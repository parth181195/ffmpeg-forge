# FFmpeg Class

The main class for video/audio processing operations.

## Constructor

```typescript
new FFmpeg(options?: FFmpegConstructorOptions)
```

Creates a new FFmpeg instance.

**Options:**

| Property | Type | Description |
|----------|------|-------------|
| `ffmpegPath` | `string?` | Custom path to FFmpeg binary |
| `ffprobePath` | `string?` | Custom path to FFprobe binary |

**Example:**

```typescript
import { FFmpeg } from 'ffmpeg-forge';

// Auto-detect FFmpeg
const ffmpeg = new FFmpeg();

// Custom paths
const ffmpeg = new FFmpeg({
  ffmpegPath: '/usr/local/bin/ffmpeg',
  ffprobePath: '/usr/local/bin/ffprobe',
});
```

---

## Static Methods

### setFFmpegPath

```typescript
static setFFmpegPath(path: string): void
```

Set global FFmpeg binary path for all instances.

**Parameters:**
- `path` - Absolute path to FFmpeg binary

**Example:**

```typescript
FFmpeg.setFFmpegPath('/opt/ffmpeg/bin/ffmpeg');
```

---

### setFFprobePath

```typescript
static setFFprobePath(path: string): void
```

Set global FFprobe binary path for all instances.

---

### getVersion

```typescript
static async getVersion(): Promise<FFmpegVersionInfo>
```

Get FFmpeg version information and configuration.

**Returns:**

```typescript
interface FFmpegVersionInfo {
  version: string;              // "4.4.2"
  major: number;                // 4
  minor: number;                // 4
  patch: number;                // 2
  configuration: string[];      // Build configuration flags
  libavutil: string;
  libavcodec: string;
  libavformat: string;
  libavdevice: string;
  libavfilter: string;
  libswscale: string;
  libswresample: string;
}
```

**Example:**

```typescript
const version = await FFmpeg.getVersion();
console.log(`FFmpeg ${version.version}`);
```

---

### getFormats

```typescript
static async getFormats(): Promise<{ demuxing: string[]; muxing: string[] }>
```

Get all supported input and output formats.

**Returns:**
- `demuxing` - Input formats (container formats FFmpeg can read)
- `muxing` - Output formats (container formats FFmpeg can write)

**Example:**

```typescript
const { demuxing, muxing } = await FFmpeg.getFormats();
console.log('Can output MP4:', muxing.includes('mp4'));
```

---

### getCodecs

```typescript
static async getCodecs(): Promise<FFmpegCapabilities>
```

Get all available encoders and decoders.

**Returns:**

```typescript
interface FFmpegCapabilities {
  video: {
    encoders: string[];        // ['libx264', 'h264_nvenc', ...]
    decoders: string[];        // ['h264', 'hevc', ...]
  };
  audio: {
    encoders: string[];        // ['aac', 'libmp3lame', ...]
    decoders: string[];        // ['aac', 'mp3', ...]
  };
  subtitle: {
    encoders: string[];
    decoders: string[];
  };
}
```

**Example:**

```typescript
const codecs = await FFmpeg.getCodecs();
const hasNVENC = codecs.video.encoders.includes('h264_nvenc');
```

---

### getCapabilities

```typescript
static async getCapabilities(): Promise<FFmpegCapabilities>
```

Alias for `getCodecs()`.

---

### canOutputFormat

```typescript
static async canOutputFormat(format: string, throwOnError?: boolean): Promise<boolean>
```

Check if FFmpeg supports outputting to a specific format.

**Parameters:**
- `format` - Format name (e.g., "mp4", "webm")
- `throwOnError` - Throw error if not supported (default: false)

**Example:**

```typescript
if (await FFmpeg.canOutputFormat('mp4')) {
  console.log('MP4 output supported');
}
```

---

### canEncodeWithCodec

```typescript
static async canEncodeWithCodec(
  codec: string,
  type?: StreamType,
  acceleration?: HardwareAccelerationValue,
  throwOnError?: boolean
): Promise<boolean>
```

Check if FFmpeg can encode with a specific codec.

**Parameters:**
- `codec` - Codec name (e.g., "libx264", "h264_nvenc")
- `type` - Stream type (default: VIDEO)
- `acceleration` - Required hardware acceleration
- `throwOnError` - Throw error if not supported

**Example:**

```typescript
const hasNVENC = await FFmpeg.canEncodeWithCodec(
  'h264_nvenc',
  StreamType.VIDEO,
  HardwareAcceleration.NVIDIA
);
```

---

### canDecodeWithCodec

```typescript
static async canDecodeWithCodec(
  codec: string,
  type?: StreamType,
  acceleration?: HardwareAccelerationValue,
  throwOnError?: boolean
): Promise<boolean>
```

Check if FFmpeg can decode a specific codec.

---

### verifyOutputSupport

```typescript
static async verifyOutputSupport(options: {
  format?: string;
  videoCodec?: string;
  audioCodec?: string;
  acceleration?: HardwareAccelerationValue;
}): Promise<{
  supported: boolean;
  details: {
    format?: { supported: boolean; name: string };
    videoCodec?: { supported: boolean; name: string };
    audioCodec?: { supported: boolean; name: string };
  };
}>
```

Verify if a combination of format/codecs is supported.

**Example:**

```typescript
const support = await FFmpeg.verifyOutputSupport({
  format: 'mp4',
  videoCodec: 'h264_nvenc',
  audioCodec: 'aac',
  acceleration: HardwareAcceleration.NVIDIA,
});

if (!support.supported) {
  console.error('Configuration not supported');
}
```

---

### getAvailableHardwareAcceleration

```typescript
static async getAvailableHardwareAcceleration(): Promise<HardwareAccelerationInfo[]>
```

Detect available hardware acceleration methods.

**Returns:**

```typescript
interface HardwareAccelerationInfo {
  type: HardwareAccelerationValue;
  available: boolean;
  codecs: string[];
}
```

**Example:**

```typescript
const hwAccel = await FFmpeg.getAvailableHardwareAcceleration();
for (const hw of hwAccel) {
  if (hw.available) {
    console.log(`${hw.type}: ${hw.codecs.join(', ')}`);
  }
}
```

---

### getEncodersByAcceleration

```typescript
static async getEncodersByAcceleration(
  acceleration?: HardwareAccelerationValue,
  type?: StreamType
): Promise<string[]>
```

Get available encoders for specific hardware acceleration.

**Example:**

```typescript
const nvencEncoders = await FFmpeg.getEncodersByAcceleration(
  HardwareAcceleration.NVIDIA,
  StreamType.VIDEO
);
// ['h264_nvenc', 'hevc_nvenc', 'av1_nvenc']
```

---

### getDecodersByAcceleration

```typescript
static async getDecodersByAcceleration(
  acceleration?: HardwareAccelerationValue,
  type?: StreamType
): Promise<string[]>
```

Get available decoders for specific hardware acceleration.

---

## Instance Methods

### Metadata Methods

#### getMetadata

```typescript
async getMetadata(input: InputSource): Promise<MediaMetadata>
```

Extract complete metadata from media file.

**Parameters:**
- `input` - File path, Buffer, or ReadStream

**Returns:**

```typescript
interface MediaMetadata {
  format: FormatMetadata;
  streams: StreamMetadata[];
  chapters: ChapterMetadata[];
}
```

**Example:**

```typescript
const metadata = await ffmpeg.getMetadata('video.mp4');
console.log(`Duration: ${metadata.format.duration}s`);
console.log(`Streams: ${metadata.streams.length}`);
```

---

#### getVideoMetadata

```typescript
async getVideoMetadata(input: InputSource): Promise<VideoMetadata>
```

Extract video-specific metadata.

**Returns:**

```typescript
interface VideoMetadata {
  duration: number;              // Duration in seconds
  width: number;                 // Video width
  height: number;                // Video height
  aspectRatio: string;           // "16:9"
  frameRate: number;             // Frames per second
  videoCodec: string;            // Codec name
  audioCodec: string | null;     // Audio codec if present
  bitrate: number;               // Total bitrate
  videoBitrate: number;          // Video bitrate
  audioBitrate: number;          // Audio bitrate
  format: string;                // Container format
  hasAudio: boolean;
  hasVideo: boolean;
  pixelFormat: string;           // "yuv420p"
}
```

**Example:**

```typescript
const video = await ffmpeg.getVideoMetadata('video.mp4');
console.log(`${video.width}x${video.height} @ ${video.frameRate}fps`);
```

---

#### getImageMetadata

```typescript
async getImageMetadata(input: InputSource): Promise<ImageMetadata>
```

Extract image metadata.

---

#### getDuration

```typescript
async getDuration(input: InputSource): Promise<number>
```

Get media duration in seconds.

**Example:**

```typescript
const duration = await ffmpeg.getDuration('video.mp4');
console.log(`Duration: ${duration}s`);
```

---

#### getResolution

```typescript
async getResolution(input: InputSource): Promise<{ width: number; height: number }>
```

Get video resolution.

---

#### getFrameRate

```typescript
async getFrameRate(input: InputSource): Promise<number>
```

Get video frame rate.

---

#### isVideo

```typescript
async isVideo(input: InputSource): Promise<boolean>
```

Check if input is a video file.

---

#### isImage

```typescript
async isImage(input: InputSource): Promise<boolean>
```

Check if input is an image file.

---

### Conversion Methods

#### convert

```typescript
convert(config: ConversionConfig): ConversionResult
```

Convert media file with event-based progress tracking.

**Returns:**

```typescript
interface ConversionResult {
  promise: Promise<void>;
  events: ConversionEvents;
  cancel: () => void;
  getProgress: () => ProgressInfo | null;
}

interface ConversionEvents {
  start: (callback: (command: string) => void) => void;
  progress: (callback: (progress: ProgressInfo) => void) => void;
  end: (callback: () => void) => void;
  error: (callback: (error: Error) => void) => void;
}
```

**Example:**

```typescript
const conversion = ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: { codec: VideoCodec.H264, bitrate: '2M' },
});

conversion.events.start((command) => {
  console.log('Starting:', command);
});

conversion.events.progress((progress) => {
  console.log(`Progress: ${progress.percent}%`);
});

conversion.events.end(() => {
  console.log('Done!');
});

conversion.events.error((error) => {
  console.error('Error:', error);
});

await conversion.promise;
```

---

#### convertToBuffer

```typescript
convertToBuffer(config: Omit<ConversionConfig, 'output'>): ConversionResultBuffer
```

Convert and return output as Buffer (in-memory).

**Returns:**

```typescript
interface ConversionResultBuffer {
  promise: Promise<Buffer>;
  events: ConversionEvents;
  cancel: () => void;
  getProgress: () => ProgressInfo | null;
}
```

**Example:**

```typescript
const conversion = ffmpeg.convertToBuffer({
  input: 'video.mp4',
  video: { codec: VideoCodec.H264, size: '640x480' },
  format: OutputFormat.MP4,
});

const buffer = await conversion.promise;
// Use buffer (upload to S3, etc.)
```

---

#### convertBatch

```typescript
async convertBatch(
  configs: ConversionConfig[],
  callbacks?: BatchConversionCallbacks
): Promise<void>
```

Convert multiple files sequentially.

**Example:**

```typescript
await ffmpeg.convertBatch([
  { input: 'video1.mp4', output: 'out1.mp4', video: { codec: VideoCodec.H264 } },
  { input: 'video2.mp4', output: 'out2.mp4', video: { codec: VideoCodec.H264 } },
]);
```

---

#### convertBatchParallel

```typescript
async convertBatchParallel(
  configs: ConversionConfig[],
  maxConcurrent?: number,
  callbacks?: BatchConversionCallbacks
): Promise<void>
```

Convert multiple files in parallel.

**Parameters:**
- `configs` - Array of conversion configurations
- `maxConcurrent` - Maximum concurrent conversions (default: 2)

**Example:**

```typescript
await ffmpeg.convertBatchParallel(configs, 4); // Run 4 at a time
```

---

### Media Extraction Methods

#### extractScreenshot

```typescript
async extractScreenshot(config: ScreenshotConfig): Promise<string>
```

Extract a single screenshot from video.

See [Screenshots & Thumbnails](/api/thumbnails) for details.

---

#### extractScreenshots

```typescript
async extractScreenshots(config: ScreenshotsConfig): Promise<ScreenshotResult>
```

Extract multiple screenshots from video.

---

#### extractThumbnails

```typescript
async extractThumbnails(config: ThumbnailConfig): Promise<ThumbnailResult>
```

Generate thumbnails from video.

---

#### generateTrailer

```typescript
async generateTrailer(config: TrailerConfig): Promise<TrailerResult>
```

Generate a video trailer.

---

### Multi-Input Methods

#### concatenate

```typescript
async concatenate(config: ConcatenationConfig): Promise<ConcatenationResult>
```

Concatenate multiple videos into one.

**Example:**

```typescript
await ffmpeg.concatenate({
  inputs: ['part1.mp4', 'part2.mp4', 'part3.mp4'],
  output: 'full-video.mp4',
});
```

---

#### merge

```typescript
async merge(config: MergeConfig): Promise<string>
```

Merge video and audio streams.

**Example:**

```typescript
await ffmpeg.merge({
  videoInput: 'video.mp4',
  audioInput: 'audio.mp3',
  output: 'merged.mp4',
});
```

---

#### pictureInPicture

```typescript
async pictureInPicture(config: PictureInPictureConfig): Promise<string>
```

Create picture-in-picture effect.

**Example:**

```typescript
await ffmpeg.pictureInPicture({
  mainInput: 'main.mp4',
  overlayInput: 'webcam.mp4',
  output: 'pip.mp4',
  position: 'top-right',
  overlayScale: 0.25,
});
```

---

#### sideBySide

```typescript
async sideBySide(config: SideBySideConfig): Promise<string>
```

Place two videos side by side.

**Example:**

```typescript
await ffmpeg.sideBySide({
  leftInput: 'video1.mp4',
  rightInput: 'video2.mp4',
  output: 'side-by-side.mp4',
});
```

---

### Helper Methods

#### validateConfig

```typescript
validateConfig(config: ConversionConfig): { valid: boolean; errors: string[] }
```

Validate conversion configuration.

**Example:**

```typescript
const validation = ffmpeg.validateConfig(config);
if (!validation.valid) {
  console.error('Invalid config:', validation.errors);
}
```

---

#### buildCommand

```typescript
buildCommand(config: ConversionConfig): string
```

Build FFmpeg command line from configuration (for debugging).

**Example:**

```typescript
const command = ffmpeg.buildCommand(config);
console.log('Would run:', command);
```

---

### Recommendation Methods

#### getConversionSuggestions

```typescript
async getConversionSuggestions(input: InputSource): Promise<ConversionSuggestion>
```

Get recommended conversion settings for input file.

**Returns:**

```typescript
interface ConversionSuggestion {
  recommendedCodecs: {
    video: string[];
    audio: string[];
  };
  recommendedFormats: string[];
  currentQuality: 'low' | 'medium' | 'high';
  targetQuality: 'low' | 'medium' | 'high';
}
```

---

#### checkConversionCompatibility

```typescript
async checkConversionCompatibility(
  input: InputSource,
  targetFormat: string,
  targetVideoCodec: string,
  targetAudioCodec?: string
): Promise<ConversionCompatibility>
```

Check if conversion settings are compatible.

---

#### getConversionRecommendation

```typescript
async getConversionRecommendation(
  input: InputSource,
  useCase?: 'web' | 'mobile' | 'quality' | 'size' | 'compatibility'
): Promise<ConversionRecommendation>
```

Get recommended settings for specific use case.

**Example:**

```typescript
const recommendation = await ffmpeg.getConversionRecommendation(
  'video.mp4',
  'web'
);

const conversion = ffmpeg.convert({
  input: 'video.mp4',
  output: 'optimized.mp4',
  ...recommendation.config,
});
```

---

#### canRemux

```typescript
async canRemux(input: InputSource, targetFormat: string): Promise<boolean>
```

Check if video can be remuxed without re-encoding.

---

#### getRemuxableFormats

```typescript
async getRemuxableFormats(input: InputSource): Promise<string[]>
```

Get list of formats that can be remuxed without re-encoding.

---

## See Also

- [Conversion Configuration](/api/conversion-config)
- [Video Configuration](/api/video-config)
- [Audio Configuration](/api/audio-config)
- [Filters](/api/filters)
- [Enums](/api/enums)

