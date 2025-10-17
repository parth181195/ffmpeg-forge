import type { ConversionConfig, VideoConfig, AudioConfig, AdvancedOptions } from '../types/conversion-config';
import { FilterBuilder } from './filter-builder';
import { autoSelectHardwareEncoding } from './hardware-acceleration-helper';

/**
 * Generate FFmpeg command arguments from configuration
 */
export class CommandGenerator {
  /**
   * Generate complete FFmpeg command arguments
   */
  static generate(config: ConversionConfig, ffmpegPath: string = 'ffmpeg'): string[] {
    const args: string[] = [];
    
    // Global options
    args.push('-hide_banner');
    
    // Map our enum to FFmpeg hwaccel names
    const hwAccelMap: Record<string, string> = {
      'nvidia': 'cuda',
      'intel': 'qsv',
      'amd': 'amf',
      'vaapi': 'vaapi',
      'videotoolbox': 'videotoolbox',
      'v4l2': 'v4l2m2m',
    };
    
    // Process hardware acceleration config
    let hwAccelType: string | undefined;
    let useHardwareCodec = false;
    
    if (config.hardwareAcceleration) {
      if (typeof config.hardwareAcceleration === 'string') {
        // Simple: just the acceleration type
        const mapped = hwAccelMap[config.hardwareAcceleration] || config.hardwareAcceleration;
        hwAccelType = mapped;
        useHardwareCodec = true;
      } else if (config.hardwareAcceleration.enabled) {
        // Advanced config
        const accelType = config.hardwareAcceleration.type;
        if (accelType) {
          hwAccelType = hwAccelMap[accelType] || accelType;
        }
        useHardwareCodec = config.hardwareAcceleration.preferHardware !== false;
      }
    }
    
    // Add hardware acceleration flag (must come before input)
    if (hwAccelType) {
      args.push('-hwaccel', hwAccelType);
    }
    
    // Auto-select hardware codec if enabled
    let finalVideoConfig = config.video;
    if (useHardwareCodec && config.video?.codec && !config.video.disabled) {
      const hwSelection = autoSelectHardwareEncoding(config.video.codec, ffmpegPath);
      
      if (hwSelection.isHardware) {
        // Use hardware codec
        finalVideoConfig = {
          ...config.video,
          codec: hwSelection.codec,
        };
        
        // Set hwaccel if not already set
        if (!hwAccelType && hwSelection.ffmpegHwaccel) {
          args.splice(2, 0, '-hwaccel', hwSelection.ffmpegHwaccel);  // Insert after -hide_banner
        }
      } else if (typeof config.hardwareAcceleration === 'object' && 
                 config.hardwareAcceleration.fallbackToCPU === false) {
        // Hardware requested but not available, and no fallback allowed
        throw new Error(`Hardware acceleration requested but codec ${config.video.codec} is not available with hardware acceleration`);
      }
    }
    
    // Threading
    if (config.options?.threads !== undefined) {
      args.push('-threads', config.options.threads.toString());
    }
    
    // Input options
    if (config.options?.inputOptions) {
      args.push(...config.options.inputOptions);
    }
    
    // Timing (input seeking - faster but less accurate)
    if (config.timing?.fastSeek && config.timing?.seek !== undefined) {
      args.push('-ss', this.formatTime(config.timing.seek));
    }
    
    // Input file (should already be a path string after prepareInput in execution engine)
    const inputPath = typeof config.input === 'string' ? config.input : 'pipe:0';
    args.push('-i', inputPath);
    
    // Timing (output seeking - slower but accurate)
    if (config.timing && !config.timing.fastSeek) {
      if (config.timing.seek !== undefined) {
        args.push('-ss', this.formatTime(config.timing.seek));
      }
      
      if (config.timing.duration !== undefined) {
        args.push('-t', this.formatTime(config.timing.duration));
      } else if (config.timing.to !== undefined) {
        args.push('-to', this.formatTime(config.timing.to));
      }
    }
    
    // Video configuration (use potentially modified config with hardware codec)
    if (finalVideoConfig) {
      this.addVideoArgs(args, finalVideoConfig);
    }
    
    // Audio configuration
    if (config.audio) {
      this.addAudioArgs(args, config.audio);
    }
    
    // Format
    if (config.format) {
      args.push('-f', config.format);
    }
    
    // Complex filters (multi-stream)
    if (config.complexFilters && config.complexFilters.length > 0) {
      const complexFilter = FilterBuilder.buildComplexFilter(config.complexFilters);
      args.push('-filter_complex', complexFilter);
    }
    
    // Advanced options
    if (config.options) {
      this.addAdvancedOptions(args, config.options);
    }
    
    // Output options
    if (config.options?.outputOptions) {
      args.push(...config.options.outputOptions);
    }
    
    // Output file
    const output = typeof config.output === 'string' ? config.output : 'pipe:1';
    args.push('-y', output);  // -y to overwrite
    
    return args;
  }

  /**
   * Add video-related arguments
   */
  private static addVideoArgs(args: string[], video: VideoConfig): void {
    // Disable video
    if (video.disabled) {
      args.push('-vn');
      return;
    }
    
    // Codec
    if (video.codec) {
      args.push('-c:v', video.codec);
    }
    
    // Bitrate
    if (video.bitrate) {
      const bitrate = typeof video.bitrate === 'number' 
        ? `${video.bitrate}` 
        : video.bitrate;
      args.push('-b:v', bitrate);
    }
    
    // Quality (CRF for h264/h265, -q:v for others)
    if (video.quality !== undefined) {
      if (video.codec?.includes('264') || video.codec?.includes('265')) {
        args.push('-crf', video.quality.toString());
      } else {
        args.push('-q:v', video.quality.toString());
      }
    }
    
    // FPS
    if (video.fps) {
      args.push('-r', video.fps.toString());
    }
    
    // Size (resolution)
    if (video.size) {
      const size = this.formatSize(video.size);
      if (size) {
        args.push('-s', size);
      }
    }
    
    // Aspect ratio
    if (video.aspectRatio) {
      args.push('-aspect', video.aspectRatio.toString());
    }
    
    // Preset
    if (video.preset) {
      args.push('-preset', video.preset);
    }
    
    // Profile
    if (video.profile) {
      args.push('-profile:v', video.profile);
    }
    
    // Level
    if (video.level) {
      args.push('-level', video.level);
    }
    
    // Pixel format
    if (video.pixelFormat) {
      args.push('-pix_fmt', video.pixelFormat);
    }
    
    // Keyframe interval
    if (video.keyframeInterval) {
      args.push('-g', video.keyframeInterval.toString());
    }
    
    // B-frames
    if (video.bframes !== undefined) {
      args.push('-bf', video.bframes.toString());
    }
    
    // Reference frames
    if (video.refs !== undefined) {
      args.push('-refs', video.refs.toString());
    }
    
    // Frame limit
    if (video.frames !== undefined) {
      args.push('-frames:v', video.frames.toString());
    }
    
    // Loop (for GIFs mainly)
    if (video.loop !== undefined) {
      args.push('-loop', video.loop.toString());
    }
    
    // Filters
    this.addVideoFilters(args, video);
  }

  /**
   * Add video filters
   */
  private static addVideoFilters(args: string[], video: VideoConfig): void {
    const filterParts: string[] = [];
    
    // Upscaling
    if (video.upscale) {
      const upscaleFilters = FilterBuilder.buildUpscaleFilter(video.upscale);
      filterParts.push(...upscaleFilters);
    }
    
    // Downscaling
    if (video.downscale) {
      const downscaleFilters = FilterBuilder.buildDownscaleFilter(video.downscale);
      filterParts.push(...downscaleFilters);
    }
    
    // Standard filters
    if (video.filters) {
      const filterString = FilterBuilder.buildVideoFilters(video.filters);
      if (filterString) {
        filterParts.push(filterString);
      }
    }
    
    // Combine all filters
    if (filterParts.length > 0) {
      args.push('-vf', filterParts.join(','));
    }
  }

  /**
   * Add audio-related arguments
   */
  private static addAudioArgs(args: string[], audio: AudioConfig): void {
    // Disable audio
    if (audio.disabled) {
      args.push('-an');
      return;
    }
    
    // Codec
    if (audio.codec) {
      args.push('-c:a', audio.codec);
    }
    
    // Bitrate
    if (audio.bitrate) {
      const bitrate = typeof audio.bitrate === 'number'
        ? `${audio.bitrate}`
        : audio.bitrate;
      args.push('-b:a', bitrate);
    }
    
    // Quality
    if (audio.quality !== undefined) {
      args.push('-q:a', audio.quality.toString());
    }
    
    // Channels
    if (audio.channels) {
      args.push('-ac', audio.channels.toString());
    }
    
    // Sample rate
    if (audio.frequency) {
      args.push('-ar', audio.frequency.toString());
    }
    
    // Profile
    if (audio.profile) {
      args.push('-profile:a', audio.profile);
    }
    
    // Volume normalization
    if (audio.volumeNormalization) {
      args.push('-af', 'loudnorm');
    }
    
    // Filters
    if (audio.filters) {
      const filterString = FilterBuilder.buildAudioFilters(audio.filters);
      if (filterString) {
        // Combine with volume normalization if both are present
        if (audio.volumeNormalization) {
          const existingAf = args[args.indexOf('-af') + 1];
          args[args.indexOf('-af') + 1] = `${existingAf},${filterString}`;
        } else {
          args.push('-af', filterString);
        }
      }
    }
  }

  /**
   * Add advanced options
   */
  private static addAdvancedOptions(args: string[], options: AdvancedOptions): void {
    // Two-pass encoding
    if (options.twoPass) {
      const passlogfile = options.passlogfile || 'ffmpeg2pass';
      args.push('-pass', '1', '-passlogfile', passlogfile);
    }
    
    // Metadata
    if (options.metadata) {
      Object.entries(options.metadata).forEach(([key, value]) => {
        args.push('-metadata', `${key}=${value}`);
      });
    }
    
    // Subtitles
    if (options.subtitles) {
      if (options.burnSubtitles) {
        // Burn subtitles into video
        args.push('-vf', `subtitles=${options.subtitles}`);
      } else {
        // Include as separate stream
        args.push('-i', options.subtitles, '-c:s', 'mov_text');
      }
    }
  }

  /**
   * Format time value (seconds or timestamp)
   */
  private static formatTime(time: string | number): string {
    if (typeof time === 'string') {
      return time;  // Already formatted (e.g., '00:01:30')
    }
    
    // Convert seconds to HH:MM:SS format
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format size specification
   */
  private static formatSize(size: VideoConfig['size']): string | null {
    if (!size) return null;
    
    if (typeof size === 'string') {
      return size;  // Already formatted (e.g., '1920x1080', '50%')
    }
    
    if (typeof size === 'object') {
      const w = size.width === '?' ? '-1' : size.width;
      const h = size.height === '?' ? '-1' : size.height;
      return `${w}x${h}`;
    }
    
    return null;
  }

  /**
   * Generate command string for display/logging
   */
  static generateCommandString(config: ConversionConfig, ffmpegPath: string = 'ffmpeg'): string {
    const args = this.generate(config);
    return `${ffmpegPath} ${args.join(' ')}`;
  }

  /**
   * Validate configuration before generation
   */
  static validate(config: ConversionConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!config.input) {
      errors.push('Input is required');
    }
    
    if (!config.output) {
      errors.push('Output is required');
    }
    
    // Validate video config
    if (config.video) {
      if (config.video.upscale && config.video.downscale) {
        errors.push('Cannot use both upscale and downscale');
      }
      
      if (config.video.upscale && config.video.size) {
        errors.push('Cannot use both upscale and size');
      }
    }
    
    // Validate timing
    if (config.timing) {
      if (config.timing.duration && config.timing.to) {
        errors.push('Cannot use both duration and to');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

