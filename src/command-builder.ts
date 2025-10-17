import type { FFmpegOptions } from './types/options';

export class CommandBuilder {
  private args: string[] = [];

  /**
   * Add global options (before input)
   */
  addGlobalOptions(options: { overwrite?: boolean; hideOutput?: boolean }): this {
    if (options.overwrite) {
      this.args.push('-y');
    }
    
    if (options.hideOutput) {
      this.args.push('-hide_banner', '-loglevel', 'error');
    }
    
    return this;
  }

  /**
   * Add input file
   */
  addInput(inputPath: string): this {
    this.args.push('-i', inputPath);
    return this;
  }

  /**
   * Add video codec
   */
  addVideoCodec(codec: string): this {
    this.args.push('-c:v', codec);
    return this;
  }

  /**
   * Add audio codec
   */
  addAudioCodec(codec: string): this {
    this.args.push('-c:a', codec);
    return this;
  }

  /**
   * Add video bitrate
   */
  addVideoBitrate(bitrate: string): this {
    this.args.push('-b:v', bitrate);
    return this;
  }

  /**
   * Add audio bitrate
   */
  addAudioBitrate(bitrate: string): this {
    this.args.push('-b:a', bitrate);
    return this;
  }

  /**
   * Add output format
   */
  addFormat(format: string): this {
    this.args.push('-f', format);
    return this;
  }

  /**
   * Add FPS
   */
  addFps(fps: number): this {
    this.args.push('-r', fps.toString());
    return this;
  }

  /**
   * Add video size/resolution
   */
  addSize(size: string): this {
    this.args.push('-s', size);
    return this;
  }

  /**
   * Add aspect ratio
   */
  addAspectRatio(aspectRatio: string): this {
    this.args.push('-aspect', aspectRatio);
    return this;
  }

  /**
   * Add duration (limit output duration)
   */
  addDuration(duration: number): this {
    this.args.push('-t', duration.toString());
    return this;
  }

  /**
   * Add seek (start position)
   */
  addSeek(seek: number): this {
    this.args.push('-ss', seek.toString());
    return this;
  }

  /**
   * Disable audio
   */
  disableAudio(): this {
    this.args.push('-an');
    return this;
  }

  /**
   * Disable video
   */
  disableVideo(): this {
    this.args.push('-vn');
    return this;
  }

  /**
   * Add custom arguments
   */
  addCustomArgs(customArgs: string[]): this {
    this.args.push(...customArgs);
    return this;
  }

  /**
   * Add output file
   */
  addOutput(outputPath: string): this {
    this.args.push(outputPath);
    return this;
  }

  /**
   * Build FFmpeg conversion command with options
   */
  buildConversionCommand(
    inputPath: string,
    outputPath: string,
    options: FFmpegOptions = {}
  ): string[] {
    this.reset();

    // Global options
    this.addGlobalOptions({ overwrite: true });

    // Input
    this.addInput(inputPath);

    // Video codec
    if (options.videoCodec) {
      this.addVideoCodec(options.videoCodec);
    }

    // Audio codec
    if (options.audioCodec) {
      this.addAudioCodec(options.audioCodec);
    }

    // Video bitrate
    if (options.videoBitrate) {
      this.addVideoBitrate(options.videoBitrate);
    }

    // Audio bitrate
    if (options.audioBitrate) {
      this.addAudioBitrate(options.audioBitrate);
    }

    // Format
    if (options.format) {
      this.addFormat(options.format);
    }

    // FPS
    if (options.fps) {
      this.addFps(options.fps);
    }

    // Size
    if (options.size) {
      this.addSize(options.size);
    }

    // Aspect ratio
    if (options.aspectRatio) {
      this.addAspectRatio(options.aspectRatio);
    }

    // Seek
    if (options.seek) {
      this.addSeek(options.seek);
    }

    // Duration
    if (options.duration) {
      this.addDuration(options.duration);
    }

    // No audio
    if (options.noAudio) {
      this.disableAudio();
    }

    // No video
    if (options.noVideo) {
      this.disableVideo();
    }

    // Output
    this.addOutput(outputPath);

    return this.build();
  }

  /**
   * Build FFprobe command for metadata extraction
   */
  buildProbeCommand(inputPath: string): string[] {
    this.reset();
    
    return [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      inputPath
    ];
  }

  /**
   * Build the command arguments array
   */
  build(): string[] {
    return [...this.args];
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.args = [];
    return this;
  }

  /**
   * Get the command as a string (for display purposes)
   */
  toString(executable: string = 'ffmpeg'): string {
    return `${executable} ${this.args.join(' ')}`;
  }
}

