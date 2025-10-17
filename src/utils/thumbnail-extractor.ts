import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { ThumbnailConfig, ThumbnailResult } from '../types/thumbnail';
import { prepareInput, cleanupInput, getInputPath } from './input-handler';
import { FFmpegExecutionError } from '../errors/ffmpeg-errors';

/**
 * Extract thumbnails from video
 */
export class ThumbnailExtractor {
  constructor(private ffmpegPath: string = 'ffmpeg') {}

  /**
   * Extract thumbnails based on configuration
   */
  async extract(config: ThumbnailConfig): Promise<ThumbnailResult> {
    // Prepare input
    const inputInfo = await prepareInput(config.input);
    const inputPath = getInputPath(inputInfo);

    try {
      let result: ThumbnailResult;

      switch (config.strategy) {
        case 'time':
          result = await this.extractByTime(inputPath, config);
          break;
        case 'count':
          result = await this.extractByCount(inputPath, config);
          break;
        case 'interval':
          result = await this.extractByInterval(inputPath, config);
          break;
        case 'scene':
          result = await this.extractByScene(inputPath, config);
          break;
        case 'quality':
          result = await this.extractBestQuality(inputPath, config);
          break;
        default:
          throw new Error(`Unknown strategy: ${config.strategy}`);
      }

      return result;
    } finally {
      if (inputInfo.tempPath) {
        cleanupInput(inputInfo);
      }
    }
  }

  /**
   * Extract thumbnails at specific times
   */
  private async extractByTime(
    inputPath: string,
    config: ThumbnailConfig
  ): Promise<ThumbnailResult> {
    if (!config.times || config.times.length === 0) {
      throw new Error('times array required for time-based extraction');
    }

    const files: string[] = [];
    const timestamps: number[] = [];

    // Ensure output directory exists
    mkdirSync(dirname(config.output), { recursive: true });

    for (let i = 0; i < config.times.length; i++) {
      const time = config.times[i];
      const timeStr = typeof time === 'number' ? this.formatTime(time) : time;
      const outputFile = config.output.includes('%d')
        ? config.output.replace('%d', (i + 1).toString())
        : config.output.replace(/\.(\w+)$/, `-${i + 1}.$1`);

      await this.extractSingleFrame(inputPath, timeStr, outputFile, config);
      files.push(outputFile);
      timestamps.push(typeof time === 'number' ? time : this.parseTime(time));
    }

    return { files, count: files.length, timestamps };
  }

  /**
   * Extract N thumbnails evenly distributed
   */
  private async extractByCount(
    inputPath: string,
    config: ThumbnailConfig
  ): Promise<ThumbnailResult> {
    if (!config.count || config.count < 1) {
      throw new Error('count required for count-based extraction');
    }

    // Get video duration
    const duration = await this.getVideoDuration(inputPath);

    const skipFirst = config.skipFirst || 0;
    const skipLast = config.skipLast || 0;
    const usableDuration = duration - skipFirst - skipLast;

    // Calculate evenly distributed times
    const times: number[] = [];
    for (let i = 0; i < config.count; i++) {
      const position = skipFirst + (usableDuration / (config.count + 1)) * (i + 1);
      times.push(position);
    }

    return this.extractByTime(inputPath, { ...config, times, strategy: 'time' });
  }

  /**
   * Extract thumbnails at regular intervals
   */
  private async extractByInterval(
    inputPath: string,
    config: ThumbnailConfig
  ): Promise<ThumbnailResult> {
    if (!config.interval || config.interval <= 0) {
      throw new Error('interval required for interval-based extraction');
    }

    const duration = await this.getVideoDuration(inputPath);
    const skipFirst = config.skipFirst || 0;
    const skipLast = config.skipLast || 0;

    const times: number[] = [];
    for (let t = skipFirst; t < duration - skipLast; t += config.interval) {
      times.push(t);
    }

    return this.extractByTime(inputPath, { ...config, times, strategy: 'time' });
  }

  /**
   * Extract thumbnails on scene changes
   */
  private async extractByScene(
    inputPath: string,
    config: ThumbnailConfig
  ): Promise<ThumbnailResult> {
    const threshold = config.sceneThreshold || 0.4;

    // Use FFmpeg scene detection filter to find scenes
    // Then extract first frame of each scene
    const outputPattern = config.output.includes('%d')
      ? config.output
      : config.output.replace(/\.(\w+)$/, '-%d.$1');

    mkdirSync(dirname(config.output), { recursive: true });

    const args = [
      '-hide_banner',
      '-i',
      inputPath,
      '-vf',
      `select='gt(scene,${threshold})',showinfo`,
      '-vsync',
      'vfr',
    ];

    if (config.size) {
      const size =
        typeof config.size === 'string'
          ? config.size
          : `${config.size.width}x${config.size.height}`;
      args.push('-s', size);
    }

    if (config.quality) {
      args.push('-q:v', config.quality.toString());
    }

    args.push(outputPattern);

    await this.runFFmpeg(args);

    // Count generated files
    const files = this.getGeneratedFiles(outputPattern);

    return {
      files,
      count: files.length,
      timestamps: [], // Would need to parse from showinfo output
    };
  }

  /**
   * Extract best quality frames
   */
  private async extractBestQuality(
    inputPath: string,
    config: ThumbnailConfig
  ): Promise<ThumbnailResult> {
    const count = config.count || 5;

    // Use thumbnail filter to select best frames
    const outputPattern = config.output.includes('%d')
      ? config.output
      : config.output.replace(/\.(\w+)$/, '-%d.$1');

    mkdirSync(dirname(config.output), { recursive: true });

    const args = ['-hide_banner', '-i', inputPath, '-vf', `thumbnail=${count}`, '-vsync', 'vfr'];

    if (config.size) {
      const size =
        typeof config.size === 'string'
          ? config.size
          : `${config.size.width}x${config.size.height}`;
      args.push('-s', size);
    }

    args.push('-frames:v', count.toString());
    args.push(outputPattern);

    await this.runFFmpeg(args);

    const files = this.getGeneratedFiles(outputPattern);

    return {
      files,
      count: files.length,
      timestamps: [],
    };
  }

  /**
   * Extract a single frame at specified time
   */
  private async extractSingleFrame(
    inputPath: string,
    time: string,
    output: string,
    config: ThumbnailConfig
  ): Promise<void> {
    mkdirSync(dirname(output), { recursive: true });

    const args = ['-hide_banner', '-ss', time, '-i', inputPath, '-vframes', '1'];

    if (config.size) {
      const size =
        typeof config.size === 'string'
          ? config.size
          : `${config.size.width}x${config.size.height}`;
      args.push('-s', size);
    }

    if (config.quality) {
      args.push('-q:v', config.quality.toString());
    }

    args.push('-y', output);

    await this.runFFmpeg(args);
  }

  /**
   * Get video duration using ffprobe
   */
  private async getVideoDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = this.ffmpegPath.replace('ffmpeg', 'ffprobe');
      const args = [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        inputPath,
      ];

      const process = spawn(ffprobe, args);
      let output = '';

      process.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      process.on('close', code => {
        if (code === 0) {
          resolve(parseFloat(output.trim()));
        } else {
          reject(new Error('Failed to get video duration'));
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
              `Thumbnail extraction failed`,
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

  /**
   * Get list of generated files from pattern
   */
  private getGeneratedFiles(pattern: string): string[] {
    const files: string[] = [];
    let i = 1;

    while (true) {
      const file = pattern.replace('%d', i.toString());
      if (existsSync(file)) {
        files.push(file);
        i++;
      } else {
        break;
      }
    }

    return files;
  }

  /**
   * Format time in seconds to HH:MM:SS
   */
  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /**
   * Parse time string to seconds
   */
  private parseTime(time: string): number {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }
}
