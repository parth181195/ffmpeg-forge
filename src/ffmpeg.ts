import { EventEmitter } from 'events';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { CommandBuilder } from './command-builder';
import { parseVersion, parseFormats, parseEncoders, parseDecoders, parseMediaMetadata, parseVideoMetadata, parseImageMetadata } from './parsers';
import type { FFmpegVersionInfo, FFmpegCapabilities } from './types/version';
import type { MediaMetadata, VideoMetadata, ImageMetadata } from './types/metadata';
import { HardwareAcceleration, type HardwareAccelerationValue, type HardwareAccelerationInfo } from './types/hardware';
import { StreamType, type StreamTypeValue } from './types/stream';
import type { InputSource } from './types/input';
import type { ConversionSuggestion, ConversionCompatibility, ConversionRecommendation } from './types/conversion';
import type { ConversionConfig, ConversionCallbacks, BatchConversionCallbacks, ConversionResult, ConversionEvents, ProgressInfo, ConversionResultBuffer } from './types/conversion-config';
import { filterCodecsByAcceleration, detectHardwareType } from './utils/hardware-detection';
import { prepareInput, cleanupInput, getInputPath } from './utils/input-handler';
import { generateConversionSuggestions, checkConversionCompatibility, getConversionRecommendation, CODEC_CONTAINER_COMPATIBILITY } from './utils/conversion-helper';
import { ExecutionEngine, BatchExecutionEngine } from './utils/execution-engine';
import { CommandGenerator } from './utils/command-generator';
import { ThumbnailExtractor } from './utils/thumbnail-extractor';
import { TrailerGenerator } from './utils/trailer-generator';
import { ScreenshotExtractor } from './utils/screenshot-extractor';
import { Concatenation } from './utils/concatenation';
import { MultiInputHandler } from './utils/multi-input-handler';
import type { ThumbnailConfig, ThumbnailResult, TrailerConfig, TrailerResult } from './types/thumbnail';
import type { ScreenshotConfig, ScreenshotsConfig, ScreenshotResult } from './types/screenshot';
import type { ConcatenationConfig, ConcatenationResult, MergeConfig } from './types/concat';
import type { PictureInPictureConfig, SideBySideConfig } from './types/multi-input';
import {
  FFmpegNotFoundError,
  FFprobeNotFoundError,
  FFmpegExecutionError,
  CodecNotSupportedError,
  FormatNotSupportedError,
  HardwareAccelerationError,
} from './errors';

export interface FFmpegConstructorOptions {
  ffmpegPath?: string;
  ffprobePath?: string;
}

export class FFmpeg extends EventEmitter {
  private static ffmpegPath: string = 'ffmpeg';
  private static ffprobePath: string = 'ffprobe';
  protected commandBuilder: CommandBuilder;

  constructor(options?: FFmpegConstructorOptions) {
    super();
    this.commandBuilder = new CommandBuilder();
    
    // Set paths from constructor options if provided
    if (options?.ffmpegPath) {
      FFmpeg.setFFmpegPath(options.ffmpegPath);
    } else {
      // Auto-detect ffmpeg path if not provided
      this.autoDetectFFmpegPath();
    }
    
    if (options?.ffprobePath) {
      FFmpeg.setFFprobePath(options.ffprobePath);
    } else {
      // Auto-detect ffprobe path if not provided
      this.autoDetectFFprobePath();
    }
  }

  /**
   * Auto-detect FFmpeg binary path
   */
  private autoDetectFFmpegPath(): void {
    try {
      // Try to find ffmpeg using 'which' command (Unix-like) or 'where' (Windows)
      const command = process.platform === 'win32' ? 'where ffmpeg' : 'which ffmpeg';
      const path = execSync(command, { encoding: 'utf-8' }).trim().split('\n')[0];
      
      if (path && existsSync(path)) {
        FFmpeg.setFFmpegPath(path);
      }
    } catch {
      // If auto-detection fails, keep default 'ffmpeg' (system PATH)
      // We'll validate when actually using it
    }
  }

  /**
   * Auto-detect FFprobe binary path
   */
  private autoDetectFFprobePath(): void {
    try {
      // Try to find ffprobe using 'which' command (Unix-like) or 'where' (Windows)
      const command = process.platform === 'win32' ? 'where ffprobe' : 'which ffprobe';
      const path = execSync(command, { encoding: 'utf-8' }).trim().split('\n')[0];
      
      if (path && existsSync(path)) {
        FFmpeg.setFFprobePath(path);
      }
    } catch {
      // If auto-detection fails, keep default 'ffprobe' (system PATH)
      // We'll validate when actually using it
    }
  }

  /**
   * Validate that FFmpeg binary is accessible
   */
  private static validateFFmpegPath(): void {
    try {
      execSync(`${FFmpeg.ffmpegPath} -version`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (error) {
      throw new FFmpegNotFoundError(FFmpeg.ffmpegPath);
    }
  }

  /**
   * Validate that FFprobe binary is accessible
   */
  private static validateFFprobePath(): void {
    try {
      execSync(`${FFmpeg.ffprobePath} -version`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (error) {
      throw new FFprobeNotFoundError(FFmpeg.ffprobePath);
    }
  }

  /**
   * Set the path to the FFmpeg binary
   * @param path - Absolute path to the FFmpeg executable (default: 'ffmpeg' from PATH)
   */
  static setFFmpegPath(path: string): void {
    FFmpeg.ffmpegPath = path;
  }

  /**
   * Set the path to the FFprobe binary
   * @param path - Absolute path to the FFprobe executable (default: 'ffprobe' from PATH)
   */
  static setFFprobePath(path: string): void {
    FFmpeg.ffprobePath = path;
  }

  /**
   * Get the configured FFmpeg binary path
   */
  static getFFmpegPath(): string {
    return FFmpeg.ffmpegPath;
  }

  /**
   * Get the configured FFprobe binary path
   */
  static getFFprobePath(): string {
    return FFmpeg.ffprobePath;
  }

  /**
   * Get FFmpeg version information as structured data
   */
  static async getVersion(): Promise<FFmpegVersionInfo> {
    return new Promise((resolve, reject) => {
      try {
        this.validateFFmpegPath();
        
        const output = execSync(`${FFmpeg.ffmpegPath} -version`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        resolve(parseVersion(output));
      } catch (error) {
        if (error instanceof FFmpegNotFoundError) {
          reject(error);
        } else {
          reject(new FFmpegExecutionError(
            `Failed to get FFmpeg version: ${error instanceof Error ? error.message : 'Unknown error'}`,
            `${FFmpeg.ffmpegPath} -version`
          ));
        }
      }
    });
  }

  /**
   * Get available formats (muxers and demuxers)
   */
  static async getFormats(): Promise<{ demuxing: string[]; muxing: string[] }> {
    return new Promise((resolve, reject) => {
      try {
        this.validateFFmpegPath();
        
        const output = execSync(`${FFmpeg.ffmpegPath} -formats`, {
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        resolve(parseFormats(output));
      } catch (error) {
        if (error instanceof FFmpegNotFoundError) {
          reject(error);
        } else {
          reject(new FFmpegExecutionError(
            `Failed to get formats: ${error instanceof Error ? error.message : 'Unknown error'}`,
            `${FFmpeg.ffmpegPath} -formats`
          ));
        }
      }
    });
  }

  /**
   * Get available codecs
   */
  static async getCodecs(): Promise<{
    video: { encoders: string[]; decoders: string[] };
    audio: { encoders: string[]; decoders: string[] };
    subtitle: { encoders: string[]; decoders: string[] };
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        this.validateFFmpegPath();
        
        const [encodersOutput, decodersOutput] = await Promise.all([
          Promise.resolve(execSync(`${FFmpeg.ffmpegPath} -encoders`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
          })),
          Promise.resolve(execSync(`${FFmpeg.ffmpegPath} -decoders`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
          }))
        ]);
        
        const encoders = parseEncoders(encodersOutput);
        const decoders = parseDecoders(decodersOutput);
        
        resolve({
          video: { encoders: encoders.video, decoders: decoders.video },
          audio: { encoders: encoders.audio, decoders: decoders.audio },
          subtitle: { encoders: encoders.subtitle, decoders: decoders.subtitle }
        });
      } catch (error) {
        if (error instanceof FFmpegNotFoundError) {
          reject(error);
        } else {
          reject(new FFmpegExecutionError(
            `Failed to get codecs: ${error instanceof Error ? error.message : 'Unknown error'}`,
            `${FFmpeg.ffmpegPath} -encoders/-decoders`
          ));
        }
      }
    });
  }

  /**
   * Get all FFmpeg capabilities (version, formats, codecs)
   */
  static async getCapabilities(): Promise<FFmpegCapabilities> {
    const [version, formats, codecs] = await Promise.all([
      this.getVersion(),
      this.getFormats(),
      this.getCodecs()
    ]);
    
    return {
      version,
      formats,
      codecs
    };
  }

  /**
   * Check if a format is supported for output (muxing)
   * @throws {FormatNotSupportedError} If format is not supported and throwOnError is true
   */
  static async canOutputFormat(format: string, throwOnError: boolean = false): Promise<boolean> {
    const formats = await this.getFormats();
    const supported = formats.muxing.includes(format);
    
    if (!supported && throwOnError) {
      throw new FormatNotSupportedError(format, 'mux');
    }
    
    return supported;
  }

  /**
   * Check if a codec can be used for encoding
   * @throws {CodecNotSupportedError} If codec is not supported and throwOnError is true
   * @throws {HardwareAccelerationError} If hardware acceleration is not available
   */
  static async canEncodeWithCodec(
    codec: string,
    type: StreamTypeValue = StreamType.VIDEO,
    acceleration: HardwareAccelerationValue = HardwareAcceleration.ANY,
    throwOnError: boolean = false
  ): Promise<boolean> {
    const codecs = await this.getCodecs();
    const availableEncoders = filterCodecsByAcceleration(codecs[type].encoders, acceleration);
    const supported = availableEncoders.includes(codec);
    
    if (!supported && throwOnError) {
      // Check if it's a hardware acceleration issue
      const accelValue = typeof acceleration === 'string' ? acceleration : acceleration;
      if (accelValue !== HardwareAcceleration.ANY && accelValue !== 'any' && 
          accelValue !== HardwareAcceleration.CPU && accelValue !== 'cpu') {
        const allEncoders = codecs[type].encoders;
        if (allEncoders.includes(codec)) {
          throw new HardwareAccelerationError(accelValue);
        }
      }
      throw new CodecNotSupportedError(codec, type, 'encode');
    }
    
    return supported;
  }

  /**
   * Check if a codec can be used for decoding
   * @throws {CodecNotSupportedError} If codec is not supported and throwOnError is true
   * @throws {HardwareAccelerationError} If hardware acceleration is not available
   */
  static async canDecodeWithCodec(
    codec: string,
    type: StreamTypeValue = StreamType.VIDEO,
    acceleration: HardwareAccelerationValue = HardwareAcceleration.ANY,
    throwOnError: boolean = false
  ): Promise<boolean> {
    const codecs = await this.getCodecs();
    const availableDecoders = filterCodecsByAcceleration(codecs[type].decoders, acceleration);
    const supported = availableDecoders.includes(codec);
    
    if (!supported && throwOnError) {
      // Check if it's a hardware acceleration issue
      const accelValue = typeof acceleration === 'string' ? acceleration : acceleration;
      if (accelValue !== HardwareAcceleration.ANY && accelValue !== 'any' && 
          accelValue !== HardwareAcceleration.CPU && accelValue !== 'cpu') {
        const allDecoders = codecs[type].decoders;
        if (allDecoders.includes(codec)) {
          throw new HardwareAccelerationError(accelValue);
        }
      }
      throw new CodecNotSupportedError(codec, type, 'decode');
    }
    
    return supported;
  }

  /**
   * Verify that output format and codecs are supported
   */
  static async verifyOutputSupport(options: {
    format?: string;
    videoCodec?: string;
    audioCodec?: string;
    acceleration?: HardwareAccelerationValue;
  }): Promise<{
    supported: boolean;
    details: {
      format?: { supported: boolean; name: string };
      videoCodec?: { supported: boolean; name: string; hardwareType?: HardwareAccelerationValue };
      audioCodec?: { supported: boolean; name: string };
    };
    unsupported: string[];
  }> {
    const acceleration = options.acceleration || HardwareAcceleration.ANY;
    const details: {
      format?: { supported: boolean; name: string };
      videoCodec?: { supported: boolean; name: string; hardwareType?: HardwareAccelerationValue };
      audioCodec?: { supported: boolean; name: string };
    } = {};
    const unsupported: string[] = [];

    // Check format
    if (options.format) {
      const formatSupported = await this.canOutputFormat(options.format);
      details.format = { supported: formatSupported, name: options.format };
      if (!formatSupported) {
        unsupported.push(`format: ${options.format}`);
      }
    }

    // Check video codec
    if (options.videoCodec && options.videoCodec !== 'copy') {
      const videoSupported = await this.canEncodeWithCodec(options.videoCodec, 'video', acceleration);
      const hardwareType = detectHardwareType(options.videoCodec);
      details.videoCodec = { 
        supported: videoSupported, 
        name: options.videoCodec,
        hardwareType 
      };
      if (!videoSupported) {
        unsupported.push(`video codec: ${options.videoCodec} (${hardwareType})`);
      }
    }

    // Check audio codec
    if (options.audioCodec && options.audioCodec !== 'copy') {
      const audioSupported = await this.canEncodeWithCodec(options.audioCodec, 'audio', acceleration);
      details.audioCodec = { supported: audioSupported, name: options.audioCodec };
      if (!audioSupported) {
        unsupported.push(`audio codec: ${options.audioCodec}`);
      }
    }

    return {
      supported: unsupported.length === 0,
      details,
      unsupported
    };
  }

  /**
   * Get available hardware acceleration types
   */
  static async getAvailableHardwareAcceleration(): Promise<HardwareAccelerationInfo[]> {
    const codecs = await this.getCodecs();
    const result: HardwareAccelerationInfo[] = [];

    // Check CPU (always available if we have any CPU codecs)
    const cpuEncoders = filterCodecsByAcceleration(codecs.video.encoders, HardwareAcceleration.CPU);
    const cpuDecoders = filterCodecsByAcceleration(codecs.video.decoders, HardwareAcceleration.CPU);
    if (cpuEncoders.length > 0 || cpuDecoders.length > 0) {
      result.push({
        type: HardwareAcceleration.CPU,
        available: true,
        encoders: cpuEncoders,
        decoders: cpuDecoders
      });
    }

    // Check each GPU type
    const gpuTypes: HardwareAccelerationValue[] = [
      HardwareAcceleration.NVIDIA,
      HardwareAcceleration.INTEL,
      HardwareAcceleration.AMD,
      HardwareAcceleration.VAAPI,
      HardwareAcceleration.VIDEOTOOLBOX,
      HardwareAcceleration.V4L2
    ];
    for (const type of gpuTypes) {
      const encoders = filterCodecsByAcceleration(codecs.video.encoders, type);
      const decoders = filterCodecsByAcceleration(codecs.video.decoders, type);
      
      if (encoders.length > 0 || decoders.length > 0) {
        result.push({
          type,
          available: true,
          encoders,
          decoders
        });
      }
    }

    return result;
  }

  /**
   * Get encoders filtered by hardware acceleration type
   */
  static async getEncodersByAcceleration(
    acceleration: HardwareAccelerationValue = HardwareAcceleration.ANY,
    type: StreamTypeValue = StreamType.VIDEO
  ): Promise<string[]> {
    const codecs = await this.getCodecs();
    return filterCodecsByAcceleration(codecs[type].encoders, acceleration);
  }

  /**
   * Get decoders filtered by hardware acceleration type
   */
  static async getDecodersByAcceleration(
    acceleration: HardwareAccelerationValue = HardwareAcceleration.ANY,
    type: StreamTypeValue = StreamType.VIDEO
  ): Promise<string[]> {
    const codecs = await this.getCodecs();
    return filterCodecsByAcceleration(codecs[type].decoders, acceleration);
  }

  /**
   * Get raw metadata from a media file using FFprobe
   * @param input - File path, Buffer, or ReadStream
   */
  async getMetadata(input: InputSource): Promise<MediaMetadata> {
    let inputInfo;
    
    try {
      FFmpeg.validateFFprobePath();
      
      // Prepare input (convert buffer/stream to temp file if needed)
      inputInfo = await prepareInput(input);
      const inputPath = getInputPath(inputInfo);
      
      const args = this.commandBuilder.buildProbeCommand(inputPath);
      const output = execSync(`${FFmpeg.getFFprobePath()} ${args.join(' ')}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const metadata = parseMediaMetadata(output);
      return metadata;
    } catch (error) {
      if (error instanceof FFprobeNotFoundError) {
        throw error;
      } else {
        throw new FFmpegExecutionError(
          `Failed to get metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
          `${FFmpeg.getFFprobePath()} probe`
        );
      }
    } finally {
      // Clean up temporary file if created
      if (inputInfo) {
        cleanupInput(inputInfo);
      }
    }
  }

  /**
   * Get structured video metadata
   * @param input - File path, Buffer, or ReadStream
   */
  async getVideoMetadata(input: InputSource): Promise<VideoMetadata> {
    const metadata = await this.getMetadata(input);
    return parseVideoMetadata(metadata);
  }

  /**
   * Get structured image metadata
   * @param input - File path, Buffer, or ReadStream
   */
  async getImageMetadata(input: InputSource): Promise<ImageMetadata> {
    const metadata = await this.getMetadata(input);
    return parseImageMetadata(metadata);
  }

  /**
   * Get video duration in seconds
   * @param input - File path, Buffer, or ReadStream
   */
  async getDuration(input: InputSource): Promise<number> {
    const metadata = await this.getVideoMetadata(input);
    return metadata.duration;
  }

  /**
   * Get video resolution
   * @param input - File path, Buffer, or ReadStream
   */
  async getResolution(input: InputSource): Promise<{ width: number; height: number }> {
    const metadata = await this.getVideoMetadata(input);
    return {
      width: metadata.width,
      height: metadata.height,
    };
  }

  /**
   * Get video frame rate
   * @param input - File path, Buffer, or ReadStream
   */
  async getFrameRate(input: InputSource): Promise<number> {
    const metadata = await this.getVideoMetadata(input);
    return metadata.frameRate;
  }

  /**
   * Check if file is a video
   * @param input - File path, Buffer, or ReadStream
   */
  async isVideo(input: InputSource): Promise<boolean> {
    try {
      const metadata = await this.getMetadata(input);
      return metadata.streams.some(s => s.codecType === 'video' && 
        (s.frameRate || s.avgFrameRate)); // Has video stream with frame rate
    } catch {
      return false;
    }
  }

  /**
   * Check if file is an image
   * @param input - File path, Buffer, or ReadStream
   */
  async isImage(input: InputSource): Promise<boolean> {
    try {
      const metadata = await this.getMetadata(input);
      const videoStreams = metadata.streams.filter(s => s.codecType === 'video');
      // Image has video stream but no frame rate
      return videoStreams.length > 0 && !videoStreams[0].frameRate && !videoStreams[0].avgFrameRate;
    } catch {
      return false;
    }
  }

  /**
   * Get conversion suggestions for a video file
   * Analyzes the video and suggests compatible formats and codecs
   */
  async getConversionSuggestions(input: InputSource): Promise<ConversionSuggestion> {
    const metadata = await this.getVideoMetadata(input);
    const formats = await FFmpeg.getFormats();
    const codecs = await FFmpeg.getCodecs();

    return generateConversionSuggestions(metadata, formats, codecs);
  }

  /**
   * Check compatibility between source and target conversion settings
   */
  async checkConversionCompatibility(
    input: InputSource,
    targetFormat: string,
    targetVideoCodec: string,
    targetAudioCodec?: string
  ): Promise<ConversionCompatibility> {
    const metadata = await this.getVideoMetadata(input);
    
    return checkConversionCompatibility(
      metadata.videoCodec,
      metadata.audioCodec,
      metadata.format.formatName.split(',')[0],
      targetVideoCodec,
      targetAudioCodec,
      targetFormat
    );
  }

  /**
   * Get recommended conversion settings based on use case
   */
  async getConversionRecommendation(
    input: InputSource,
    useCase: 'web' | 'mobile' | 'quality' | 'size' | 'compatibility' = 'web'
  ): Promise<ConversionRecommendation> {
    const metadata = await this.getVideoMetadata(input);
    return getConversionRecommendation(metadata, useCase);
  }

  /**
   * Check if a video can be remuxed to a different format without transcoding
   */
  async canRemux(input: InputSource, targetFormat: string): Promise<boolean> {
    const suggestions = await this.getConversionSuggestions(input);
    return suggestions.canRemux && suggestions.suggestedFormats.includes(targetFormat);
  }

  /**
   * Get list of formats that support direct copy (remux) for this video
   */
  async getRemuxableFormats(input: InputSource): Promise<string[]> {
    const metadata = await this.getVideoMetadata(input);
    const formats = await FFmpeg.getFormats();
    
    const videoCodec = metadata.videoCodec;
    const videoCompatible = CODEC_CONTAINER_COMPATIBILITY[videoCodec] || [];
    
    // Return only formats that are available in FFmpeg
    return videoCompatible.filter(fmt => formats.muxing.includes(fmt));
  }

  /**
   * Convert video/audio with configuration-based API
   */
  /**
   * Convert media file with event-based progress tracking (fluent-ffmpeg style)
   */
  convert(config: ConversionConfig): ConversionResult {
    const engine = new ExecutionEngine(FFmpeg.ffmpegPath);
    let currentProgress: ProgressInfo | null = null;
    let isCancelled = false;
    
    // Create event emitter for this specific conversion
    const events: ConversionEvents = {
      start: (_command: string) => {
        // Events are handled by the conversion result, not the main instance
      },
      progress: (progress: ProgressInfo) => {
        currentProgress = progress;
        // Events are handled by the conversion result, not the main instance
      },
      end: () => {
        // Events are handled by the conversion result, not the main instance
      },
      error: (_error: Error) => {
        // Events are handled by the conversion result, not the main instance
      }
    };
    
    // Forward events from engine to events
    engine.on('start', events.start);
    engine.on('progress', events.progress);
    engine.on('end', events.end);
    engine.on('error', events.error);
    
    const promise = engine.execute(config).catch((error) => {
      if (!isCancelled) {
        events.error(error);
      }
      throw error;
    });
    
    return {
      promise,
      events,
      cancel: () => {
        isCancelled = true;
        engine.cancel();
      },
      getProgress: () => currentProgress
    };
  }

  /**
   * Convert media file with callback-based progress tracking (legacy)
   */
  async convertWithCallbacks(
    config: ConversionConfig,
    callbacks?: ConversionCallbacks
  ): Promise<void> {
    const engine = new ExecutionEngine(FFmpeg.ffmpegPath);
    
    // Forward events from engine to this instance
    engine.on('start', (cmd) => this.emit('start', cmd));
    engine.on('progress', (progress) => this.emit('progress', progress));
    engine.on('end', () => this.emit('end'));
    engine.on('error', (error) => this.emit('error', error));
    
    return engine.execute(config, callbacks);
  }

  /**
   * Convert and return output as Buffer with event-based progress tracking
   */
  convertToBuffer(config: Omit<ConversionConfig, 'output'>): ConversionResultBuffer {
    const engine = new ExecutionEngine(FFmpeg.ffmpegPath);
    let currentProgress: ProgressInfo | null = null;
    let isCancelled = false;
    
    // Create event emitter for this specific conversion
    const events: ConversionEvents = {
      start: (_command: string) => {
        // Events are handled by the conversion result, not the main instance
      },
      progress: (progress: ProgressInfo) => {
        currentProgress = progress;
        // Events are handled by the conversion result, not the main instance
      },
      end: () => {
        // Events are handled by the conversion result, not the main instance
      },
      error: (_error: Error) => {
        // Events are handled by the conversion result, not the main instance
      }
    };
    
    // Forward events from engine to events
    engine.on('start', events.start);
    engine.on('progress', events.progress);
    engine.on('end', events.end);
    engine.on('error', events.error);
    
    const promise = engine.executeToBuffer(config).catch((error) => {
      if (!isCancelled) {
        events.error(error);
      }
      throw error;
    });
    
    return {
      promise,
      events,
      cancel: () => {
        isCancelled = true;
        engine.cancel();
      },
      getProgress: () => currentProgress
    };
  }

  /**
   * Convert and return output as Buffer with callback-based progress tracking (legacy)
   */
  async convertToBufferWithCallbacks(
    config: Omit<ConversionConfig, 'output'>,
    callbacks?: ConversionCallbacks
  ): Promise<Buffer> {
    const engine = new ExecutionEngine(FFmpeg.ffmpegPath);
    
    // Forward events
    engine.on('start', (cmd) => this.emit('start', cmd));
    engine.on('progress', (progress) => this.emit('progress', progress));
    engine.on('end', () => this.emit('end'));
    engine.on('error', (error) => this.emit('error', error));
    
    return engine.executeToBuffer(config, callbacks);
  }

  /**
   * Convert multiple files sequentially
   */
  async convertBatch(
    configs: ConversionConfig[],
    callbacks?: BatchConversionCallbacks
  ): Promise<void> {
    const batchEngine = new BatchExecutionEngine(FFmpeg.ffmpegPath);
    return batchEngine.executeBatch(configs, callbacks);
  }

  /**
   * Convert multiple files in parallel
   */
  async convertBatchParallel(
    configs: ConversionConfig[],
    maxConcurrent: number = 2,
    callbacks?: BatchConversionCallbacks
  ): Promise<void> {
    const batchEngine = new BatchExecutionEngine(FFmpeg.ffmpegPath);
    return batchEngine.executeBatchParallel(configs, maxConcurrent, callbacks);
  }

  /**
   * Validate configuration without executing
   */
  validateConfig(config: ConversionConfig): { valid: boolean; errors: string[] } {
    return CommandGenerator.validate(config);
  }

  /**
   * Build FFmpeg command without executing (dry run)
   */
  buildCommand(config: ConversionConfig): string {
    return CommandGenerator.generateCommandString(config, FFmpeg.ffmpegPath);
  }

  /**
   * Extract thumbnails from video
   */
  async extractThumbnails(config: ThumbnailConfig): Promise<ThumbnailResult> {
    const extractor = new ThumbnailExtractor(FFmpeg.ffmpegPath);
    return extractor.extract(config);
  }

  /**
   * Generate video trailer
   */
  async generateTrailer(config: TrailerConfig): Promise<TrailerResult> {
    const generator = new TrailerGenerator(FFmpeg.ffmpegPath);
    return generator.generate(config);
  }

  /**
   * Extract single screenshot
   */
  async extractScreenshot(config: ScreenshotConfig): Promise<string> {
    const extractor = new ScreenshotExtractor(FFmpeg.ffmpegPath);
    return extractor.extractOne(config);
  }

  /**
   * Extract multiple screenshots
   */
  async extractScreenshots(config: ScreenshotsConfig): Promise<ScreenshotResult> {
    const extractor = new ScreenshotExtractor(FFmpeg.ffmpegPath);
    return extractor.extractMultiple(config);
  }

  /**
   * Concatenate multiple videos
   */
  async concatenate(config: ConcatenationConfig): Promise<ConcatenationResult> {
    const concatenation = new Concatenation(FFmpeg.ffmpegPath);
    return concatenation.concatenate(config);
  }

  /**
   * Merge multiple inputs (video + audio + subtitles)
   */
  async merge(config: MergeConfig): Promise<string> {
    const concatenation = new Concatenation(FFmpeg.ffmpegPath);
    return concatenation.merge(config);
  }

  /**
   * Create picture-in-picture video
   */
  async pictureInPicture(config: PictureInPictureConfig): Promise<string> {
    const handler = new MultiInputHandler(FFmpeg.ffmpegPath);
    return handler.pictureInPicture(config);
  }

  /**
   * Create side-by-side comparison video
   */
  async sideBySide(config: SideBySideConfig): Promise<string> {
    const handler = new MultiInputHandler(FFmpeg.ffmpegPath);
    return handler.sideBySide(config);
  }
}

