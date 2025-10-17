import type { InputSource } from './input';
import type { VideoCodecValue, AudioCodecValue } from './codecs';
import type { OutputFormatValue } from './formats';
import type { HardwareAccelerationValue } from './hardware';
import type { VideoFilters, AudioFilters, FilterSpec, UpscalingOptions, DownscalingOptions } from './filters';

/**
 * Size specification for video
 */
export type SizeSpec = 
  | string                                    // '1920x1080', '50%', '?x720', '1280x?'
  | { width: number; height: number }        // { width: 1920, height: 1080 }
  | { width: number; height: '?' }           // Auto-calculate height
  | { width: '?'; height: number };          // Auto-calculate width

/**
 * Video configuration
 */
export interface VideoConfig {
  codec?: VideoCodecValue;
  bitrate?: string | number;           // '1000k', '2M', 1000000
  quality?: number;                    // 0-51 for h264/h265, 0-63 for VP8/VP9
  fps?: number;                        // Frames per second
  size?: SizeSpec;                     // Resolution
  aspectRatio?: string | number;       // '16:9', 1.77
  disabled?: boolean;                  // Remove video stream (audio only)
  
  // Frame control
  frames?: number;                     // Limit output frames
  loop?: number;                       // Loop video N times (0 = infinite for GIFs)
  
  // Advanced options
  preset?: string;                     // 'ultrafast', 'fast', 'medium', 'slow', 'veryslow'
  profile?: string;                    // 'baseline', 'main', 'high'
  level?: string;                      // '3.0', '4.0', '4.1'
  pixelFormat?: string;                // 'yuv420p', 'yuv444p'
  keyframeInterval?: number;           // GOP size
  bframes?: number;                    // B-frames count
  refs?: number;                       // Reference frames
  
  // Filters and enhancement
  filters?: VideoFilters;
  upscale?: UpscalingOptions;          // AI/smart upscaling
  downscale?: DownscalingOptions;      // Quality downscaling
}

/**
 * Audio configuration
 */
export interface AudioConfig {
  codec?: AudioCodecValue;
  bitrate?: string | number;           // '128k', '192k', 128000
  quality?: number;                    // Codec-specific quality
  channels?: number;                   // 1 (mono), 2 (stereo), 6 (5.1)
  frequency?: number;                  // Sample rate: 44100, 48000
  disabled?: boolean;                  // Remove audio stream (video only)
  
  // Advanced options
  profile?: string;                    // AAC: 'aac_low', 'aac_he'
  volumeNormalization?: boolean;       // Normalize audio volume
  
  // Filters
  filters?: AudioFilters;
}

/**
 * Timing configuration for seeking and trimming
 */
export interface TimingConfig {
  seek?: string | number;              // Start time: '00:01:30', 90
  duration?: string | number;          // Duration: '00:00:10', 10
  to?: string | number;                // End time: '00:02:00', 120
  fastSeek?: boolean;                  // Fast but less accurate seeking
}

/**
 * Advanced options
 */
export interface AdvancedOptions {
  inputOptions?: string[];             // Raw input options
  outputOptions?: string[];            // Raw output options
  
  // Aspect ratio handling
  autopad?: boolean | string;          // true, 'black', 'white', '#FF0000'
  keepAspectRatio?: boolean;
  
  // Threading
  threads?: number;                    // Number of threads (0 = auto)
  
  // Two-pass encoding
  twoPass?: boolean;
  passlogfile?: string;
  
  // Metadata
  metadata?: Record<string, string>;   // Custom metadata
  
  // Subtitles
  subtitles?: string;                  // Path to subtitle file
  burnSubtitles?: boolean;             // Burn subtitles into video
}

/**
 * Main conversion configuration
 */
export interface ConversionConfig {
  // Input/Output
  input: InputSource;
  output: string | NodeJS.WritableStream;
  
  // Format
  format?: OutputFormatValue;
  
  // Media streams
  video?: VideoConfig;
  audio?: AudioConfig;
  
  // Timing
  timing?: TimingConfig;
  
  // Hardware acceleration
  hardwareAcceleration?: {
    enabled: boolean;                          // Enable hardware acceleration
    type?: HardwareAccelerationValue;          // Specific type (auto-detect if not specified)
    preferHardware?: boolean;                  // Prefer hardware codecs over CPU (default: true)
    fallbackToCPU?: boolean;                   // Fallback to CPU if hardware fails (default: true)
  } | HardwareAccelerationValue;               // Or just pass the type directly
  
  // Advanced filters (for complex multi-stream scenarios)
  complexFilters?: FilterSpec[];
  
  // Advanced options
  options?: AdvancedOptions;
}

/**
 * Callbacks for conversion progress (fluent-ffmpeg style)
 */
export interface ConversionCallbacks {
  onStart?: (command: string) => void;
  onProgress?: (progress: ProgressInfo) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Event-based conversion interface (fluent-ffmpeg style)
 */
export interface ConversionEvents {
  start: (command: string) => void;
  progress: (progress: ProgressInfo) => void;
  end: () => void;
  error: (error: Error) => void;
}

/**
 * Progress information
 */
export interface ProgressInfo {
  frames: number;           // Total frames processed
  currentFps: number;       // Current processing speed
  currentKbps: number;      // Current bitrate
  targetSize: number;       // Target file size (KB)
  timemark: string;         // Current time position
  percent: number;          // Progress percentage (0-100)
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Batch conversion callbacks
 */
export interface BatchConversionCallbacks {
  onProgress?: (index: number, progress: ProgressInfo) => void;
  onFileComplete?: (index: number) => void;
  onFileError?: (index: number, error: Error) => void;
  onComplete?: () => void;
}

/**
 * Conversion result with event handling
 */
export interface ConversionResult {
  /**
   * Promise that resolves when conversion completes
   */
  promise: Promise<void>;
  
  /**
   * Event emitter for conversion events
   */
  events: ConversionEvents;
  
  /**
   * Cancel the conversion
   */
  cancel: () => void;
  
  /**
   * Get current progress
   */
  getProgress: () => ProgressInfo | null;
}

/**
 * Preset configurations
 */
export interface PresetConfig {
  name: string;
  description: string;
  config: Partial<ConversionConfig>;
}

