import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import type { ConcatenationConfig, ConcatenationResult, MergeConfig } from '../types/concat';
import { prepareInput, cleanupInput, getInputPath } from './input-handler';
import { FFmpegExecutionError } from '../errors/ffmpeg-errors';

/**
 * Video concatenation and merging
 */
export class Concatenation {
  constructor(private ffmpegPath: string = 'ffmpeg') {}

  /**
   * Concatenate multiple videos
   */
  async concatenate(config: ConcatenationConfig): Promise<ConcatenationResult> {
    const inputInfos = await Promise.all(
      (Array.isArray(config.inputs[0]) ? config.inputs : config.inputs).map((input: any) =>
        prepareInput(typeof input === 'object' && input.source ? input.source : input)
      )
    );

    try {
      const method = config.method || 'concat';

      if (method === 'concat') {
        return await this.simpleConcatenate(inputInfos, config);
      } else {
        return await this.complexConcatenate(inputInfos, config);
      }
    } finally {
      inputInfos.forEach(info => {
        if (info.tempPath) {
          cleanupInput(info);
        }
      });
    }
  }

  /**
   * Simple concatenation (same codec, no re-encoding)
   */
  private async simpleConcatenate(
    inputInfos: any[],
    config: ConcatenationConfig
  ): Promise<ConcatenationResult> {
    // Create concat demuxer file
    const concatFile = join(tmpdir(), `concat-${Date.now()}.txt`);

    try {
      const inputPaths = inputInfos.map(info => getInputPath(info));
      // Use absolute paths in concat file
      const { resolve } = await import('path');
      const absolutePaths = inputPaths.map(p => resolve(p));
      const concatContent = absolutePaths.map(path => `file '${path}'`).join('\n');
      writeFileSync(concatFile, concatContent);

      mkdirSync(dirname(config.output), { recursive: true });

      const args = [
        '-hide_banner',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        concatFile,
        '-c',
        'copy', // No re-encoding
        '-y',
        config.output,
      ];

      await this.runFFmpeg(args);

      const duration = await this.getVideoDuration(config.output);

      return {
        output: config.output,
        duration,
        inputCount: inputPaths.length,
      };
    } finally {
      if (existsSync(concatFile)) {
        unlinkSync(concatFile);
      }
    }
  }

  /**
   * Complex concatenation (with re-encoding, normalization, transitions)
   */
  private async complexConcatenate(
    inputInfos: any[],
    config: ConcatenationConfig
  ): Promise<ConcatenationResult> {
    const inputPaths = inputInfos.map(info => getInputPath(info));

    mkdirSync(dirname(config.output), { recursive: true });

    const args = ['-hide_banner'];

    // Add all inputs
    inputPaths.forEach(path => {
      args.push('-i', path);
    });

    // Build filter graph for concatenation
    if (config.normalize?.enabled || config.transitions?.enabled) {
      // Complex concatenation with filters
      const filterParts: string[] = [];

      // Normalize each input if needed
      if (config.normalize?.enabled && config.normalize.video?.size) {
        const size = config.normalize.video.size;
        inputPaths.forEach((_, i) => {
          filterParts.push(`[${i}:v]scale=${size},setsar=1[v${i}]`);
        });
      } else {
        // Just label the streams
        inputPaths.forEach((_, i) => {
          filterParts.push(`[${i}:v]null[v${i}]`);
        });
      }

      // Concatenate with transitions
      if (config.transitions?.enabled) {
        const transDur = config.transitions.duration || 0.5;
        const transType = config.transitions.type || 'fade';

        // Build xfade filter chain
        let result = '[v0]';
        for (let i = 1; i < inputPaths.length; i++) {
          const offset = i * 10; // Approximate offset
          result = `${result}[v${i}]xfade=transition=${transType}:duration=${transDur}:offset=${offset}`;
          if (i < inputPaths.length - 1) {
            result += `[vt${i}];[vt${i}]`;
          }
        }
        filterParts.push(result);
      } else {
        // Simple concat
        const videoInputs = inputPaths.map((_, i) => `[v${i}]`).join('');
        filterParts.push(`${videoInputs}concat=n=${inputPaths.length}:v=1:a=0[outv]`);

        // Audio concat
        const audioInputs = inputPaths.map((_, i) => `[${i}:a]`).join('');
        filterParts.push(`${audioInputs}concat=n=${inputPaths.length}:v=0:a=1[outa]`);
      }

      args.push('-filter_complex', filterParts.join(';'));
      args.push('-map', '[outv]', '-map', '[outa]');
    } else {
      // Simple concat filter
      const videoInputs = inputPaths.map((_, i) => `[${i}:v]`).join('');
      const audioInputs = inputPaths.map((_, i) => `[${i}:a]`).join('');

      const filter =
        `${videoInputs}concat=n=${inputPaths.length}:v=1:a=0[outv];` +
        `${audioInputs}concat=n=${inputPaths.length}:v=0:a=1[outa]`;

      args.push('-filter_complex', filter);
      args.push('-map', '[outv]', '-map', '[outa]');
    }

    // Output settings
    if (config.normalize?.video?.codec) {
      args.push('-c:v', config.normalize.video.codec);
    } else {
      args.push('-c:v', 'libx264');
    }

    if (config.normalize?.video?.bitrate) {
      args.push('-b:v', config.normalize.video.bitrate.toString());
    }

    if (config.normalize?.audio?.codec) {
      args.push('-c:a', config.normalize.audio.codec);
    } else {
      args.push('-c:a', 'aac');
    }

    args.push('-y', config.output);

    await this.runFFmpeg(args);

    const duration = await this.getVideoDuration(config.output);

    return {
      output: config.output,
      duration,
      inputCount: inputPaths.length,
    };
  }

  /**
   * Merge multiple inputs (video + audio + subtitles)
   */
  async merge(config: MergeConfig): Promise<string> {
    const inputInfos = await Promise.all(config.inputs.map(input => prepareInput(input.source)));

    try {
      const args = ['-hide_banner'];

      // Add all inputs
      inputInfos.forEach(info => {
        args.push('-i', getInputPath(info));
      });

      // Map streams
      const videoInput = config.inputs.find(i => i.type === 'video');
      const audioInputs = config.inputs.filter(i => i.type === 'audio');
      const subtitleInputs = config.inputs.filter(i => i.type === 'subtitle');

      if (videoInput) {
        const videoIndex = config.inputs.indexOf(videoInput);
        args.push('-map', `${videoIndex}:v`);
      }

      audioInputs.forEach(input => {
        const index = config.inputs.indexOf(input);
        args.push('-map', `${index}:a`);
      });

      subtitleInputs.forEach(input => {
        const index = config.inputs.indexOf(input);
        args.push('-map', `${index}:s`);
      });

      // Output codec
      if (config.video?.codec) {
        args.push('-c:v', config.video.codec);
      } else {
        args.push('-c:v', 'copy');
      }

      if (config.audio?.codec) {
        args.push('-c:a', config.audio.codec);
      } else {
        args.push('-c:a', 'copy');
      }

      mkdirSync(dirname(config.output), { recursive: true });
      args.push('-y', config.output);

      await this.runFFmpeg(args);

      return config.output;
    } finally {
      inputInfos.forEach(info => {
        if (info.tempPath) {
          cleanupInput(info);
        }
      });
    }
  }

  /**
   * Get video duration
   */
  private async getVideoDuration(path: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = this.ffmpegPath.replace('ffmpeg', 'ffprobe');
      const process = spawn(ffprobe, [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        path,
      ]);

      let output = '';
      process.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      process.on('close', code => {
        if (code === 0) {
          resolve(parseFloat(output.trim()));
        } else {
          reject(new Error('Failed to get duration'));
        }
      });
    });
  }

  /**
   * Run FFmpeg command
   */
  private async runFFmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.ffmpegPath, args);
      let stderr = '';

      process.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      process.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new FFmpegExecutionError(
              'Concatenation failed',
              `${this.ffmpegPath} ${args.join(' ')}`,
              stderr
            )
          );
        }
      });

      process.on('error', err => {
        reject(new FFmpegExecutionError(`Failed to start FFmpeg: ${err.message}`));
      });
    });
  }
}
