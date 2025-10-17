# API Reference

Complete reference for all configuration options, types, and methods.

## Table of Contents

- [FFmpeg Class](#ffmpeg-class)
- [Conversion Configuration](#conversion-configuration)
- [Video Configuration](#video-configuration)
- [Audio Configuration](#audio-configuration)
- [Filters](#filters)
- [Enums](#enums)
- [Types](#types)

## FFmpeg Class

### Constructor

```typescript
new FFmpeg(options?: FFmpegConstructorOptions)
```

**Options:**
- `ffmpegPath?: string` - Custom path to FFmpeg binary
- `ffprobePath?: string` - Custom path to FFprobe binary

### Static Methods

#### setFFmpegPath
```typescript
static setFFmpegPath(path: string): void
```
Set global FFmpeg binary path.

#### setFFprobePath
```typescript
static setFFprobePath(path: string): void
```
Set global FFprobe binary path.

### Instance Methods

#### getVersion
```typescript
async getVersion(): Promise<VersionInfo>
```
Get FFmpeg version and capabilities.

**Returns:**
```typescript
interface VersionInfo {
  version: string;
  configuration: string[];
  formats: {
    muxing: string[];
    demuxing: string[];
  };
  codecs: {
    videoEncoders: string[];
    videoDecoders: string[];
    audioEncoders: string[];
    audioDecoders: string[];
  };
}
```

#### getVideoMetadata
```typescript
async getVideoMetadata(input: InputSource): Promise<MediaMetadata>
```
Extract metadata from video/audio file.

**Parameters:**
- `input: string | Buffer | ReadStream` - File path, buffer, or stream

**Returns:**
```typescript
interface MediaMetadata {
  format: {
    formatName: string;
    formatLongName: string;
    duration: number;
    size: number;
    bitRate: number;
  };
  videoCodec: string;
  audioCodec: string;
  width: number;
  height: number;
  aspectRatio: string;
  frameRate: number;
  bitRate: number;
  audioBitRate: number;
  audioSampleRate: number;
  audioChannels: number;
  streams: StreamInfo[];
}
```

#### convert
```typescript
convert(config: ConversionConfig): ConversionResult
```
Convert media file with event-based progress tracking.

**Returns:**
```typescript
interface ConversionResult {
  promise: Promise<void>;
  events: {
    start: (callback: (command: string) => void) => void;
    progress: (callback: (progress: ProgressInfo) => void) => void;
    end: (callback: () => void) => void;
    error: (callback: (error: Error) => void) => void;
  };
  cancel: () => void;
  getProgress: () => ProgressInfo | null;
}
```

#### convertToBuffer
```typescript
convertToBuffer(config: Omit<ConversionConfig, 'output'>): ConversionResultBuffer
```
Convert and return output as Buffer.

**Returns:**
```typescript
interface ConversionResultBuffer {
  promise: Promise<Buffer>;
  events: ConversionEvents;
  cancel: () => void;
  getProgress: () => ProgressInfo | null;
}
```

#### extractScreenshot
```typescript
async extractScreenshot(config: ScreenshotConfig): Promise<ScreenshotResult>
```
Extract a single screenshot from video.

#### extractScreenshots
```typescript
async extractScreenshots(config: ScreenshotsConfig): Promise<ScreenshotResult[]>
```
Extract multiple screenshots from video.

#### generateThumbnails
```typescript
async generateThumbnails(config: ThumbnailConfig): Promise<ThumbnailResult[]>
```
Generate thumbnails from video.

#### generateTrailer
```typescript
async generateTrailer(config: TrailerConfig): Promise<TrailerResult>
```
Generate a video trailer.

#### concatenate
```typescript
async concatenate(config: ConcatenationConfig): Promise<ConcatenationResult>
```
Concatenate multiple videos.

#### merge
```typescript
async merge(config: MergeConfig): Promise<void>
```
Merge video and audio streams.

## Conversion Configuration

```typescript
interface ConversionConfig {
  // Input/Output
  input: InputSource;                    // File path, Buffer, or ReadStream
  output: string;                        // Output file path
  format?: OutputFormat;                 // Output format (mp4, webm, etc.)
  
  // Video settings
  video?: VideoConfig;
  
  // Audio settings
  audio?: AudioConfig;
  
  // Timing
  startTime?: number | string;           // Start time in seconds or "HH:MM:SS"
  duration?: number | string;            // Duration in seconds or "HH:MM:SS"
  endTime?: number | string;             // End time in seconds or "HH:MM:SS"
  
  // Advanced
  overwrite?: boolean;                   // Overwrite output file (default: true)
  metadata?: Record<string, string>;     // Custom metadata
  
  // Frame control
  frameCount?: number;                   // Limit output to N frames
  loop?: number;                         // Loop input N times (-1 for infinite)
  
  // Callbacks (deprecated - use events instead)
  onProgress?: (progress: ProgressInfo) => void;
  onStart?: (command: string) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}
```

## Video Configuration

```typescript
interface VideoConfig {
  // Codec
  codec?: VideoCodec | string;           // Video codec
  
  // Quality
  quality?: number;                      // CRF value (0-51, lower = better)
  bitrate?: string;                      // Video bitrate (e.g., "2M", "500k")
  
  // Resolution
  size?: string;                         // Output size "1920x1080" or "1280x?"
  width?: number;                        // Output width
  height?: number;                       // Output height
  
  // Frame rate
  fps?: number;                          // Frames per second
  
  // Filters
  filters?: {
    scale?: ScaleFilter;
    crop?: CropFilter;
    pad?: PadFilter;
    rotate?: RotateFilter;
    flip?: FlipFilter;
    deinterlace?: DeinterlaceFilter;
    denoise?: VideoDenoiseFilter;
    sharpen?: SharpenFilter;
    color?: ColorFilter;
    fade?: FadeFilter;
    watermark?: WatermarkFilter;
    text?: TextOverlayFilter;
  };
  
  // Hardware acceleration
  hwAccel?: HardwareAcceleration;        // GPU acceleration type
  hwAccelDevice?: string;                // GPU device ID
}
```

## Audio Configuration

```typescript
interface AudioConfig {
  // Codec
  codec?: AudioCodec | string;           // Audio codec
  
  // Quality
  bitrate?: string;                      // Audio bitrate (e.g., "128k")
  quality?: number;                      // Quality value (codec-specific)
  
  // Format
  sampleRate?: number;                   // Sample rate in Hz (e.g., 48000)
  channels?: number;                     // Number of channels (1=mono, 2=stereo)
  
  // Filters
  filters?: {
    volume?: VolumeFilter;
    eq?: EQFilter;
    tempo?: TempoFilter;
    pitch?: PitchFilter;
    denoise?: AudioDenoiseFilter;
  };
  
  // Options
  removeAudio?: boolean;                 // Remove audio track
}
```

## Filters

### Video Filters

#### ScaleFilter
```typescript
interface ScaleFilter {
  width?: number | string;               // Output width (number or "iw*2")
  height?: number | string;              // Output height (number or "ih*2")
  algorithm?: ScalingAlgorithm;          // Scaling algorithm
  force_original_aspect_ratio?: 'disable' | 'decrease' | 'increase';
  force_divisible_by?: number;           // Force dimensions divisible by N
}
```

#### CropFilter
```typescript
interface CropFilter {
  width: number | string;                // Crop width
  height: number | string;               // Crop height
  x?: number | string;                   // X position (default: center)
  y?: number | string;                   // Y position (default: center)
  keep_aspect?: boolean;                 // Maintain aspect ratio
}
```

#### RotateFilter
```typescript
interface RotateFilter {
  angle?: number;                        // Rotation angle in radians
  degrees?: number;                      // Rotation angle in degrees
  fillcolor?: string;                    // Background color (e.g., "black")
}
```

#### FlipFilter
```typescript
interface FlipFilter {
  horizontal?: boolean;                  // Flip horizontally
  vertical?: boolean;                    // Flip vertically
}
```

#### DeinterlaceFilter
```typescript
interface DeinterlaceFilter {
  mode?: DeinterlaceMode;                // Deinterlacing mode
  parity?: 'tff' | 'bff' | 'auto';      // Field parity
}
```

#### VideoDenoiseFilter
```typescript
interface VideoDenoiseFilter {
  filter: DenoiseFilterType;             // Filter type
  strength?: number;                     // Strength (1-10)
  luma?: number;                         // Luma strength
  chroma?: number;                       // Chroma strength
}
```

#### WatermarkFilter
```typescript
interface WatermarkFilter {
  input: string;                         // Watermark image path
  x?: number | string;                   // X position or expression
  y?: number | string;                   // Y position or expression
  opacity?: number;                      // Opacity (0-1)
  scale?: number;                        // Scale factor
}
```

#### TextOverlayFilter
```typescript
interface TextOverlayFilter {
  text: string;                          // Text to display
  x?: number | string;                   // X position
  y?: number | string;                   // Y position
  fontsize?: number;                     // Font size
  fontcolor?: string;                    // Font color
  fontfile?: string;                     // Font file path
  box?: boolean;                         // Draw background box
  boxcolor?: string;                     // Box color
}
```

### Audio Filters

#### VolumeFilter
```typescript
interface VolumeFilter {
  volume: number | string;               // Volume level (0.5, "10dB", etc.)
  precision?: 'fixed' | 'float' | 'double';
}
```

#### EQFilter
```typescript
interface EQFilter {
  bass?: number;                         // Bass adjustment (-20 to 20)
  mid?: number;                          // Mid adjustment (-20 to 20)
  treble?: number;                       // Treble adjustment (-20 to 20)
}
```

#### TempoFilter
```typescript
interface TempoFilter {
  tempo: number;                         // Playback speed (0.5 to 2.0)
}
```

#### PitchFilter
```typescript
interface PitchFilter {
  pitch: number;                         // Semitones to shift (-12 to 12)
}
```

## Enums

### VideoCodec
```typescript
enum VideoCodec {
  // CPU Codecs
  H264 = 'libx264',
  H265 = 'libx265',
  VP8 = 'libvpx',
  VP9 = 'libvpx-vp9',
  AV1_LIBAOM = 'libaom-av1',
  MPEG4 = 'mpeg4',
  
  // NVIDIA GPU
  H264_NVENC = 'h264_nvenc',
  HEVC_NVENC = 'hevc_nvenc',
  AV1_NVENC = 'av1_nvenc',
  
  // Intel QSV
  H264_QSV = 'h264_qsv',
  HEVC_QSV = 'hevc_qsv',
  
  // AMD AMF
  H264_AMF = 'h264_amf',
  HEVC_AMF = 'hevc_amf',
  
  // VAAPI
  H264_VAAPI = 'h264_vaapi',
  HEVC_VAAPI = 'hevc_vaapi',
  
  // VideoToolbox (macOS)
  H264_VIDEOTOOLBOX = 'h264_videotoolbox',
  HEVC_VIDEOTOOLBOX = 'hevc_videotoolbox',
  
  COPY = 'copy',
}
```

### AudioCodec
```typescript
enum AudioCodec {
  AAC = 'aac',
  MP3 = 'libmp3lame',
  OPUS = 'libopus',
  VORBIS = 'libvorbis',
  FLAC = 'flac',
  AC3 = 'ac3',
  COPY = 'copy',
}
```

### OutputFormat
```typescript
enum OutputFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  MKV = 'matroska',
  AVI = 'avi',
  MOV = 'mov',
  FLV = 'flv',
  MPEG = 'mpeg',
  OGG = 'ogg',
  MP3 = 'mp3',
  WAV = 'wav',
  FLAC = 'flac',
  GIF = 'gif',
}
```

### HardwareAcceleration
```typescript
enum HardwareAcceleration {
  NVIDIA = 'cuda',
  INTEL_QSV = 'qsv',
  AMD_AMF = 'amf',
  VAAPI = 'vaapi',
  VIDEOTOOLBOX = 'videotoolbox',
  V4L2 = 'v4l2m2m',
}
```

### ScalingAlgorithm
```typescript
enum ScalingAlgorithm {
  FAST_BILINEAR = 'fast_bilinear',
  BILINEAR = 'bilinear',
  BICUBIC = 'bicubic',
  LANCZOS = 'lanczos',
  SPLINE = 'spline',
}
```

### DeinterlaceMode
```typescript
enum DeinterlaceMode {
  SEND_FRAME = 'send_frame',
  SEND_FIELD = 'send_field',
  SEND_FRAME_NOSPATIAL = 'send_frame_nospatial',
  SEND_FIELD_NOSPATIAL = 'send_field_nospatial',
}
```

### DenoiseFilterType
```typescript
enum DenoiseFilterType {
  HQDN3D = 'hqdn3d',
  NLMEANS = 'nlmeans',
  VAGUEDENOISER = 'vaguedenoiser',
}
```

## Types

### InputSource
```typescript
type InputSource = string | Buffer | ReadStream;
```

### ProgressInfo
```typescript
interface ProgressInfo {
  frames?: number;                       // Frames processed
  currentFps?: number;                   // Current FPS
  currentKbps?: number;                  // Current bitrate
  targetSize?: number;                   // Target size in KB
  timemark?: string;                     // Current time "HH:MM:SS.ms"
  percent?: number;                      // Progress percentage (0-100)
}
```

### StreamInfo
```typescript
interface StreamInfo {
  index: number;
  codecName: string;
  codecType: StreamType;
  width?: number;
  height?: number;
  bitRate?: number;
  frameRate?: number;
  duration?: number;
}
```

## Presets

Pre-configured conversion settings for common use cases:

```typescript
import { presets } from 'ffmpeg-forge';

// Web optimized
presets.web.hd
presets.web.sd
presets.web.mobile

// Social media
presets.youtube.hd1080
presets.youtube.hd720
presets.instagram.feed
presets.instagram.story
presets.tiktok

// Quality focused
presets.quality.high
presets.quality.medium
presets.quality.low

// Size optimized
presets.size.small
presets.size.tiny

// Legacy formats
presets.dvd
```

**Usage:**
```typescript
import { FFmpeg, presets } from 'ffmpeg-forge';

const ffmpeg = new FFmpeg();
const conversion = ffmpeg.convert({
  ...presets.youtube.hd1080,
  input: 'input.mp4',
  output: 'output.mp4',
});
```

