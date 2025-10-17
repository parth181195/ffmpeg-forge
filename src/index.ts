export { FFmpeg } from './ffmpeg';
export type { FFmpegConstructorOptions } from './ffmpeg';
export * from './types';
export * from './errors';
export * from './presets';

// Export hardware acceleration utilities
export {
  detectHardwareAcceleration,
  getHardwareAccelerationInfo,
  autoSelectHardwareEncoding,
  getBestHardwareAcceleration,
  isHardwareAccelerationAvailable,
  getHardwareCodec,
  HARDWARE_CODEC_MAP,
} from './utils/hardware-acceleration-helper';

// Export commonly used types for convenience
export type {
  VideoMetadata,
  MediaMetadata,
  ImageMetadata,
  ConversionSuggestion,
  ConversionCompatibility,
  ConversionRecommendation,
  ConversionConfig,
  ConversionCallbacks,
  ConversionEvents,
  ConversionResult,
  ProgressInfo,
  VideoConfig,
  AudioConfig,
  ThumbnailConfig,
  ThumbnailResult,
  TrailerConfig,
  TrailerResult,
} from './types';

