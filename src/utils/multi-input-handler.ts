import { spawn } from 'child_process';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import type { PictureInPictureConfig, SideBySideConfig } from '../types/multi-input';
import { prepareInput, cleanupInput, getInputPath } from './input-handler';
import { FFmpegExecutionError } from '../errors/ffmpeg-errors';

/**
 * Handle multiple input operations
 */
export class MultiInputHandler {
  constructor(private ffmpegPath: string = 'ffmpeg') {}

  /**
   * Create picture-in-picture video
   */
  async pictureInPicture(config: PictureInPictureConfig): Promise<string> {
    const [mainInfo, overlayInfo] = await Promise.all([
      prepareInput(config.main),
      prepareInput(config.overlay),
    ]);

    try {
      const mainPath = getInputPath(mainInfo);
      const overlayPath = getInputPath(overlayInfo);

      mkdirSync(dirname(config.output), { recursive: true });

      const args = ['-hide_banner', '-i', mainPath, '-i', overlayPath];

      // Build overlay filter
      let overlayFilter = '[1:v]';

      // Resize overlay if needed
      if (config.overlaySize) {
        const size =
          typeof config.overlaySize === 'string'
            ? config.overlaySize
            : `${config.overlaySize.width}x${config.overlaySize.height}`;
        const [w, h] = size.split('x');
        overlayFilter += `scale=${w}:${h}[ovl];[ovl]`;
      }

      // Add border if specified
      if (config.border) {
        overlayFilter += `pad=w=iw+${config.border.width * 2}:h=ih+${config.border.width * 2}:x=${config.border.width}:y=${config.border.width}:color=${config.border.color}[ovl];[ovl]`;
      }

      // Determine position
      const pos = this.getOverlayPosition(config.position, config.x, config.y);

      // Complete filter
      const filter = `${overlayFilter}format=rgba[ovl];[0:v][ovl]overlay=${pos.x}:${pos.y}`;

      args.push('-filter_complex', filter);

      // Audio handling
      if (config.audio === 'main') {
        args.push('-map', '0:a');
      } else if (config.audio === 'overlay') {
        args.push('-map', '1:a');
      } else if (config.audio === 'both') {
        args.push('-filter_complex', '[0:a][1:a]amix=inputs=2[a]', '-map', '[a]');
      } else {
        args.push('-an');
      }

      // Video settings
      if (config.video?.codec) {
        args.push('-c:v', config.video.codec);
      }
      if (config.video?.bitrate) {
        args.push('-b:v', config.video.bitrate.toString());
      }

      args.push('-y', config.output);

      await this.runFFmpeg(args);

      return config.output;
    } finally {
      if (mainInfo.tempPath) cleanupInput(mainInfo);
      if (overlayInfo.tempPath) cleanupInput(overlayInfo);
    }
  }

  /**
   * Create side-by-side comparison
   */
  async sideBySide(config: SideBySideConfig): Promise<string> {
    const [leftInfo, rightInfo] = await Promise.all([
      prepareInput(config.left),
      prepareInput(config.right),
    ]);

    try {
      const leftPath = getInputPath(leftInfo);
      const rightPath = getInputPath(rightInfo);

      mkdirSync(dirname(config.output), { recursive: true });

      const args = ['-hide_banner', '-i', leftPath, '-i', rightPath];

      const orientation = config.orientation || 'horizontal';
      let filter = '';

      // Match size if requested
      if (config.matchSize) {
        const size = config.targetSize || '1280x720';
        filter = `[0:v]scale=${size}[left];[1:v]scale=${size}[right];`;
      } else {
        filter = '[0:v]null[left];[1:v]null[right];';
      }

      // Stack videos
      if (orientation === 'horizontal') {
        filter += '[left][right]hstack';
      } else {
        filter += '[left][right]vstack';
      }

      // Add separator if specified
      if (config.separator) {
        // Note: Separator would need custom filter implementation
        // For now, just stack
      }

      args.push('-filter_complex', filter);

      // Audio
      if (config.audio === 'left') {
        args.push('-map', '0:a');
      } else if (config.audio === 'right') {
        args.push('-map', '1:a');
      } else if (config.audio === 'both') {
        args.push('-filter_complex', '[0:a][1:a]amerge[a]', '-map', '[a]');
      } else {
        args.push('-an');
      }

      // Video settings
      if (config.video?.codec) {
        args.push('-c:v', config.video.codec);
      }

      args.push('-y', config.output);

      await this.runFFmpeg(args);

      return config.output;
    } finally {
      if (leftInfo.tempPath) cleanupInput(leftInfo);
      if (rightInfo.tempPath) cleanupInput(rightInfo);
    }
  }

  /**
   * Get overlay position
   */
  private getOverlayPosition(
    position?: string,
    x?: number | string,
    y?: number | string
  ): { x: string; y: string } {
    if (x !== undefined && y !== undefined) {
      return { x: x.toString(), y: y.toString() };
    }

    switch (position) {
      case 'top-left':
        return { x: '10', y: '10' };
      case 'top-right':
        return { x: 'main_w-overlay_w-10', y: '10' };
      case 'bottom-left':
        return { x: '10', y: 'main_h-overlay_h-10' };
      case 'bottom-right':
      default:
        return { x: 'main_w-overlay_w-10', y: 'main_h-overlay_h-10' };
    }
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
              'Multi-input operation failed',
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
