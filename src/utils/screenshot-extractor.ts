import { spawn } from 'child_process';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import type { ScreenshotConfig, ScreenshotsConfig, ScreenshotResult } from '../types/screenshot';
import { prepareInput, cleanupInput, getInputPath } from './input-handler';
import { FilterBuilder } from './filter-builder';
import { FFmpegExecutionError } from '../errors/ffmpeg-errors';

/**
 * Extract screenshots from video
 */
export class ScreenshotExtractor {
  constructor(private ffmpegPath: string = 'ffmpeg') {}
  
  /**
   * Extract single screenshot
   */
  async extractOne(config: ScreenshotConfig): Promise<string> {
    const inputInfo = await prepareInput(config.input);
    const inputPath = getInputPath(inputInfo);
    
    try {
      const output = Array.isArray(config.output) ? config.output[0] : config.output;
      mkdirSync(dirname(output), { recursive: true });
      
      const args = ['-hide_banner'];
      
      // Seek to time (before input for speed)
      if (config.time !== undefined) {
        const timeStr = typeof config.time === 'number' 
          ? this.formatTime(config.time) 
          : config.time;
        args.push('-ss', timeStr);
      }
      
      args.push('-i', inputPath);
      
      // Frame number (if specified instead of time)
      if (config.frame !== undefined) {
        args.push('-vf', `select='eq(n,${config.frame})'`, '-vframes', '1');
      } else {
        args.push('-vframes', '1');
      }
      
      // Size
      if (config.size) {
        const size = typeof config.size === 'string' 
          ? config.size 
          : `${config.size.width}x${config.size.height}`;
        args.push('-s', size);
      }
      
      // Aspect ratio
      if (config.aspectRatio) {
        args.push('-aspect', config.aspectRatio);
      }
      
      // Quality
      if (config.quality) {
        args.push('-q:v', config.quality.toString());
      }
      
      // Filters
      if (config.filters) {
        const filterString = FilterBuilder.buildVideoFilters(config.filters);
        if (filterString) {
          // Combine with frame selection if needed
          if (config.frame !== undefined) {
            const existingVf = args[args.indexOf('-vf') + 1];
            args[args.indexOf('-vf') + 1] = `${existingVf},${filterString}`;
          } else {
            args.push('-vf', filterString);
          }
        }
      }
      
      args.push('-y', output);
      
      await this.runFFmpeg(args);
      
      return output;
    } finally {
      if (inputInfo.tempPath) {
        cleanupInput(inputInfo);
      }
    }
  }
  
  /**
   * Extract multiple screenshots
   */
  async extractMultiple(config: ScreenshotsConfig): Promise<ScreenshotResult> {
    const inputInfo = await prepareInput(config.input);
    const inputPath = getInputPath(inputInfo);
    
    try {
      const folder = config.folder || '.';
      const filename = config.filename || 'screenshot-%i.jpg';
      
      mkdirSync(folder, { recursive: true });
      
      let timestamps: number[] = [];
      
      // Determine timestamps
      if (config.timestamps) {
        timestamps = config.timestamps.map(t => 
          typeof t === 'number' ? t : this.parseTime(t)
        );
      } else if (config.count) {
        // Get video duration and distribute evenly
        const duration = await this.getVideoDuration(inputPath);
        const interval = duration / (config.count + 1);
        for (let i = 1; i <= config.count; i++) {
          timestamps.push(interval * i);
        }
      } else if (config.interval) {
        // Get duration and create timestamps at intervals
        const duration = await this.getVideoDuration(inputPath);
        for (let t = 0; t < duration; t += config.interval) {
          timestamps.push(t);
        }
      } else {
        throw new Error('Must specify timestamps, count, or interval');
      }
      
      // Extract each screenshot
      const files: string[] = [];
      
      for (let i = 0; i < timestamps.length; i++) {
        const time = timestamps[i];
        const outputFile = join(folder, filename.replace('%i', (i + 1).toString()));
        
        const args = [
          '-hide_banner',
          '-ss', this.formatTime(time),
          '-i', inputPath,
          '-vframes', '1',
        ];
        
        if (config.size) {
          const size = typeof config.size === 'string' 
            ? config.size 
            : `${config.size.width}x${config.size.height}`;
          args.push('-s', size);
        }
        
        if (config.quality) {
          args.push('-q:v', config.quality.toString());
        }
        
        if (config.filters) {
          const filterString = FilterBuilder.buildVideoFilters(config.filters);
          if (filterString) {
            args.push('-vf', filterString);
          }
        }
        
        args.push('-y', outputFile);
        
        await this.runFFmpeg(args);
        files.push(outputFile);
      }
      
      return {
        files,
        count: files.length,
        timestamps,
      };
    } finally {
      if (inputInfo.tempPath) {
        cleanupInput(inputInfo);
      }
    }
  }
  
  /**
   * Get video duration
   */
  private async getVideoDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = this.ffmpegPath.replace('ffmpeg', 'ffprobe');
      const process = spawn(ffprobe, [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        inputPath,
      ]);
      
      let output = '';
      process.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
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
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new FFmpegExecutionError(
            'Screenshot extraction failed',
            `${this.ffmpegPath} ${args.join(' ')}`,
            stderr
          ));
        }
      });
      
      process.on('error', (err) => {
        reject(new FFmpegExecutionError(`Failed to start FFmpeg: ${err.message}`));
      });
    });
  }
  
  /**
   * Format time
   */
  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
  }
  
  /**
   * Parse time string
   */
  private parseTime(time: string): number {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }
}

