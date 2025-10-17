import type { ProgressInfo } from '../types/conversion-config';

/**
 * Parse FFmpeg progress output from stderr
 */
export class ProgressParser {
  private duration: number = 0;

  /**
   * Set total duration for percentage calculation
   */
  setDuration(seconds: number): void {
    this.duration = seconds;
  }

  /**
   * Parse progress line from FFmpeg stderr
   * Example: "frame= 1234 fps= 30 q=28.0 size= 1024kB time=00:00:41.23 bitrate=203.5kbits/s speed=1.5x"
   */
  parseProgress(line: string): ProgressInfo | null {
    // FFmpeg progress lines typically contain "time=" and "bitrate="
    if (!line.includes('time=') || !line.includes('bitrate=')) {
      return null;
    }

    const progress: Partial<ProgressInfo> = {};

    // Parse frame number
    const frameMatch = line.match(/frame=\s*(\d+)/);
    if (frameMatch) {
      progress.frames = parseInt(frameMatch[1]);
    }

    // Parse current FPS
    const fpsMatch = line.match(/fps=\s*([\d.]+)/);
    if (fpsMatch) {
      progress.currentFps = parseFloat(fpsMatch[1]);
    }

    // Parse current bitrate
    const bitrateMatch = line.match(/bitrate=\s*([\d.]+)kbits\/s/);
    if (bitrateMatch) {
      progress.currentKbps = parseFloat(bitrateMatch[1]);
    }

    // Parse target size
    const sizeMatch = line.match(/size=\s*(\d+)kB/);
    if (sizeMatch) {
      progress.targetSize = parseInt(sizeMatch[1]);
    }

    // Parse timemark
    const timeMatch = line.match(/time=(\d{2}:\d{2}:\d{2}.\d{2})/);
    if (timeMatch) {
      progress.timemark = timeMatch[1];

      // Calculate percentage if duration is known
      if (this.duration > 0) {
        const currentSeconds = this.parseTimemark(progress.timemark);
        progress.percent = Math.min((currentSeconds / this.duration) * 100, 100);
        progress.percent = Math.round(progress.percent * 100) / 100; // 2 decimal places
      } else {
        progress.percent = 0;
      }
    }

    // Return null if we couldn't parse essential fields
    if (!progress.frames && !progress.timemark) {
      return null;
    }

    return progress as ProgressInfo;
  }

  /**
   * Parse duration from FFmpeg metadata output
   * Example: "Duration: 00:05:30.25, start: 0.000000, bitrate: 1234 kb/s"
   */
  parseDuration(line: string): number | null {
    const durationMatch = line.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const seconds = parseFloat(durationMatch[3]);

      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      this.setDuration(totalSeconds);
      return totalSeconds;
    }
    return null;
  }

  /**
   * Convert timemark string to seconds
   */
  private parseTimemark(timemark: string): number {
    const parts = timemark.split(':');
    if (parts.length !== 3) return 0;

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Check if line indicates encoding has started
   */
  isEncodingStart(line: string): boolean {
    return (
      line.includes('Press [q] to stop') || line.includes('frame=') || line.includes('encoder')
    );
  }

  /**
   * Check if line indicates error
   */
  isError(line: string): boolean {
    const errorPatterns = [
      'error',
      'invalid',
      'failed',
      'cannot',
      'unable to',
      'does not contain',
      'no such file',
      'permission denied',
    ];

    const lowerLine = line.toLowerCase();
    return errorPatterns.some(pattern => lowerLine.includes(pattern));
  }

  /**
   * Extract codec information from FFmpeg output
   */
  parseCodecInfo(line: string): { video?: string; audio?: string } | null {
    const info: { video?: string; audio?: string } = {};

    // Parse video codec: "Stream #0:0: Video: h264 (High), yuv420p, 1920x1080"
    const videoMatch = line.match(/Video:\s*([^,\s]+)/);
    if (videoMatch) {
      info.video = videoMatch[1];
    }

    // Parse audio codec: "Stream #0:1: Audio: aac (LC), 48000 Hz, stereo"
    const audioMatch = line.match(/Audio:\s*([^,\s]+)/);
    if (audioMatch) {
      info.audio = audioMatch[1];
    }

    return Object.keys(info).length > 0 ? info : null;
  }
}
