import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import type { TrailerConfig, TrailerResult, TrailerSegment } from '../types/thumbnail';
import { prepareInput, cleanupInput, getInputPath } from './input-handler';
import { FFmpegExecutionError } from '../errors/ffmpeg-errors';

/**
 * Generate video trailers from longer videos
 */
export class TrailerGenerator {
  constructor(private ffmpegPath: string = 'ffmpeg') {}

  /**
   * Generate trailer based on configuration
   */
  async generate(config: TrailerConfig): Promise<TrailerResult> {
    // Prepare input
    const inputInfo = await prepareInput(config.input);
    const inputPath = getInputPath(inputInfo);

    try {
      let segments: TrailerSegment[];

      switch (config.strategy) {
        case 'segments':
          segments = await this.selectBySegments(inputPath, config);
          break;
        case 'duration':
          segments = await this.selectByDuration(inputPath, config);
          break;
        case 'scenes':
          segments = await this.selectByScenes(inputPath, config);
          break;
        case 'highlights':
          segments = await this.selectByHighlights(inputPath, config);
          break;
        default:
          throw new Error(`Unknown strategy: ${config.strategy}`);
      }

      // Ensure total duration doesn't exceed max
      segments = this.trimToMaxDuration(segments, config.maxDuration);

      // Generate trailer from segments
      const output = await this.createTrailer(inputPath, segments, config);

      const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

      return {
        output,
        duration: totalDuration,
        segments,
      };
    } finally {
      if (inputInfo.tempPath) {
        cleanupInput(inputInfo);
      }
    }
  }

  /**
   * Select segments by count
   */
  private async selectBySegments(
    inputPath: string,
    config: TrailerConfig
  ): Promise<TrailerSegment[]> {
    const count = config.segmentCount || 3;
    const duration = await this.getVideoDuration(inputPath);
    const segmentDuration = config.segmentDuration || 5;

    const selection = config.selection || 'distributed';
    const segments: TrailerSegment[] = [];

    switch (selection) {
      case 'beginning':
        // Take segments from the beginning
        for (let i = 0; i < count; i++) {
          segments.push({
            startTime: i * (segmentDuration + 1),
            duration: segmentDuration,
            reason: 'Beginning segment',
          });
        }
        break;

      case 'middle':
        // Take segments from the middle
        const middleStart = (duration - count * segmentDuration) / 2;
        for (let i = 0; i < count; i++) {
          segments.push({
            startTime: middleStart + i * (segmentDuration + 1),
            duration: segmentDuration,
            reason: 'Middle segment',
          });
        }
        break;

      case 'end':
        // Take segments from the end
        const endStart = duration - count * (segmentDuration + 1);
        for (let i = 0; i < count; i++) {
          segments.push({
            startTime: Math.max(0, endStart + i * (segmentDuration + 1)),
            duration: segmentDuration,
            reason: 'End segment',
          });
        }
        break;

      case 'distributed':
      default:
        // Evenly distribute across video
        const interval = duration / (count + 1);
        for (let i = 0; i < count; i++) {
          segments.push({
            startTime: interval * (i + 1),
            duration: Math.min(segmentDuration, duration - interval * (i + 1)),
            reason: `Distributed segment ${i + 1}/${count}`,
          });
        }
        break;
    }

    return segments;
  }

  /**
   * Select segments by total duration
   */
  private async selectByDuration(
    inputPath: string,
    config: TrailerConfig
  ): Promise<TrailerSegment[]> {
    const segmentDuration = config.segmentDuration || 5;
    const maxDuration = config.maxDuration;

    // Calculate how many segments we can fit
    const segmentCount = Math.floor(maxDuration / segmentDuration);

    return this.selectBySegments(inputPath, {
      ...config,
      segmentCount,
      strategy: 'segments',
    });
  }

  /**
   * Select segments based on scene changes
   */
  private async selectByScenes(
    inputPath: string,
    config: TrailerConfig
  ): Promise<TrailerSegment[]> {
    const threshold = config.sceneDetection?.threshold || 0.4;
    const minDuration = config.sceneDetection?.minSceneDuration || 2;

    // Detect scenes using FFmpeg
    const sceneTimestamps = await this.detectScenes(inputPath, threshold);

    // Filter scenes by minimum duration and select best ones
    const segments: TrailerSegment[] = [];

    for (let i = 0; i < sceneTimestamps.length - 1; i++) {
      const startTime = sceneTimestamps[i];
      const endTime = sceneTimestamps[i + 1];
      const duration = endTime - startTime;

      if (duration >= minDuration) {
        segments.push({
          startTime,
          duration: Math.min(duration, config.segmentDuration || 5),
          score: 1.0,
          reason: 'Scene change detected',
        });
      }
    }

    // Limit to max duration
    return this.trimToMaxDuration(segments, config.maxDuration);
  }

  /**
   * Select highlight segments (high motion or loud audio)
   */
  private async selectByHighlights(
    inputPath: string,
    config: TrailerConfig
  ): Promise<TrailerSegment[]> {
    // For now, use distributed strategy
    // TODO: Implement motion/audio analysis
    return this.selectBySegments(inputPath, {
      ...config,
      segmentCount: config.segmentCount || 3,
      selection: 'distributed',
      strategy: 'segments',
    });
  }

  /**
   * Detect scene changes and return timestamps
   */
  private async detectScenes(inputPath: string, threshold: number): Promise<number[]> {
    // Use ffmpeg to detect scenes
    const args = [
      '-hide_banner',
      '-i',
      inputPath,
      '-vf',
      `select='gt(scene,${threshold})',showinfo`,
      '-f',
      'null',
      '-',
    ];

    return new Promise((resolve, reject) => {
      const process = spawn(this.ffmpegPath, args);
      let stderr = '';

      process.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      process.on('close', code => {
        if (code === 0 || code === 255) {
          // 255 is normal for null output
          // Parse timestamps from showinfo output
          const timestamps = this.parseSceneTimestamps(stderr);
          resolve(timestamps);
        } else {
          reject(new Error('Scene detection failed'));
        }
      });
    });
  }

  /**
   * Parse scene timestamps from FFmpeg showinfo output
   */
  private parseSceneTimestamps(output: string): number[] {
    const timestamps: number[] = [0]; // Always include start
    const regex = /pts_time:([\d.]+)/g;
    let match;

    while ((match = regex.exec(output)) !== null) {
      timestamps.push(parseFloat(match[1]));
    }

    return timestamps;
  }

  /**
   * Trim segments to fit within max duration
   */
  private trimToMaxDuration(segments: TrailerSegment[], maxDuration: number): TrailerSegment[] {
    const trimmed: TrailerSegment[] = [];
    let currentDuration = 0;

    for (const segment of segments) {
      const remainingTime = maxDuration - currentDuration;

      if (remainingTime <= 0) break;

      if (segment.duration <= remainingTime) {
        trimmed.push(segment);
        currentDuration += segment.duration;
      } else {
        // Include partial segment
        trimmed.push({
          ...segment,
          duration: remainingTime,
        });
        break;
      }
    }

    return trimmed;
  }

  /**
   * Create trailer from selected segments
   */
  private async createTrailer(
    inputPath: string,
    segments: TrailerSegment[],
    config: TrailerConfig
  ): Promise<string> {
    // Create concat file for FFmpeg
    const concatFile = join(tmpdir(), `trailer-${Date.now()}.txt`);
    const segmentFiles: string[] = [];

    try {
      // Extract each segment to temporary file
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const segmentFile = join(tmpdir(), `trailer-segment-${Date.now()}-${i}.mp4`);

        await this.extractSegment(inputPath, segment, segmentFile, config);
        segmentFiles.push(segmentFile);
      }

      // Create concat file
      const concatContent = segmentFiles.map(f => `file '${f}'`).join('\n');
      writeFileSync(concatFile, concatContent);

      // Concatenate segments
      mkdirSync(dirname(config.output), { recursive: true });

      const args = ['-hide_banner', '-f', 'concat', '-safe', '0', '-i', concatFile];

      // Add transitions if enabled
      if (config.transitions?.enabled) {
        const transType = config.transitions.type || 'fade';
        const transDuration = config.transitions.duration || 0.5;

        if (transType === 'fade') {
          // Add crossfade between segments
          args.push(
            '-vf',
            `fade=t=in:st=0:d=${transDuration},fade=t=out:st=${segments[0].duration - transDuration}:d=${transDuration}`
          );
        }
      }

      // Video codec settings
      if (config.video?.codec) {
        args.push('-c:v', config.video.codec);
      } else {
        args.push('-c:v', 'copy'); // Copy if no codec specified
      }

      if (config.video?.bitrate) {
        args.push('-b:v', config.video.bitrate);
      }

      if (config.video?.size) {
        args.push('-s', config.video.size);
      }

      if (config.video?.fps) {
        args.push('-r', config.video.fps.toString());
      }

      // Audio handling
      if (config.audio?.enabled !== false) {
        if (config.audio?.music) {
          // Add background music
          args.push('-i', config.audio.music);
          const musicVol = config.audio.musicVolume || 0.3;
          args.push(
            '-filter_complex',
            `[1:a]volume=${musicVol}[music];[0:a][music]amix=inputs=2:duration=first[a]`
          );
          args.push('-map', '0:v', '-map', '[a]');
        } else if (config.audio?.normalize) {
          args.push('-af', 'loudnorm');
        } else {
          args.push('-c:a', 'copy');
        }
      } else {
        args.push('-an');
      }

      args.push('-y', config.output);

      await this.runFFmpeg(args);

      return config.output;
    } finally {
      // Cleanup temporary files
      if (existsSync(concatFile)) {
        unlinkSync(concatFile);
      }

      segmentFiles.forEach(file => {
        if (existsSync(file)) {
          try {
            unlinkSync(file);
          } catch {
            // Ignore
          }
        }
      });
    }
  }

  /**
   * Extract a single segment
   */
  private async extractSegment(
    inputPath: string,
    segment: TrailerSegment,
    output: string,
    config: TrailerConfig
  ): Promise<void> {
    const args = [
      '-hide_banner',
      '-ss',
      this.formatTime(segment.startTime),
      '-i',
      inputPath,
      '-t',
      this.formatTime(segment.duration),
      '-c:v',
      config.video?.codec || 'libx264',
      '-c:a',
      'aac',
      '-y',
      output,
    ];

    // Add fade in/out if enabled
    if (config.audio?.fadeInOut) {
      const fadeDur = 0.5;
      args.push(
        '-af',
        `afade=t=in:st=0:d=${fadeDur},afade=t=out:st=${segment.duration - fadeDur}:d=${fadeDur}`
      );
    }

    await this.runFFmpeg(args);
  }

  /**
   * Get video duration
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
              `Trailer generation failed`,
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
   * Format time in seconds to HH:MM:SS
   */
  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
  }
}
