# ffmpeg-forge

> A modern, type-safe FFmpeg wrapper for Node.js with hardware acceleration and zero dependencies.

[![npm version](https://img.shields.io/npm/v/ffmpeg-forge.svg)](https://www.npmjs.com/package/ffmpeg-forge)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/coverage-57.6%25-yellow.svg)](./coverage)

## Features

- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Hardware Acceleration**: Auto-detect and use GPU encoding (NVIDIA, Intel, AMD, VAAPI, VideoToolbox, V4L2)
- **Zero Dependencies**: Uses only Node.js built-ins
- **Configuration-Based**: Immutable, serializable configs instead of method chaining
- **17 Filters**: Video and audio filters with full type support
- **15 Presets**: Pre-configured settings for common platforms
- **Batch Processing**: Parallel processing with configurable concurrency
- **Progress Tracking**: Real-time progress with events
- **Flexible I/O**: Support for file paths, Buffers, and ReadStreams
- **Media Extraction**: Screenshots, thumbnails, and trailer generation

## Installation

```bash
npm install ffmpeg-forge
```

**Requirements:**
- Node.js 16+
- FFmpeg 4.0+ installed on your system ([installation guide](https://ffmpeg.org/download.html))

**Tested On:**
- FFmpeg: 7.1.1
- Node.js: 18+
- Platforms: Linux, macOS (should work on Windows)

## Quick Start

```typescript
import { FFmpeg, VideoCodec, AudioCodec } from 'ffmpeg-forge';

const ffmpeg = new FFmpeg();

// Simple conversion
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264,
    bitrate: '2M',
    size: '1920x1080',
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '128k',
  },
});
```

## Documentation

- **[API Reference](./docs/API.md)** - Complete API documentation
- **[Examples](./docs/EXAMPLES.md)** - Comprehensive usage examples
- **[Filters Guide](./docs/FILTERS.md)** - All available filters
- **[Hardware Acceleration](./docs/HARDWARE.md)** - GPU encoding setup
- **[Thumbnails & Trailers](./docs/THUMBNAILS_TRAILERS.md)** - Media extraction features

## Core Features

### Video Conversion

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264,
    bitrate: '2M',
    fps: 30,
    size: '1920x1080',
    preset: 'medium',
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '128k',
    sampleRate: 48000,
  },
});
```

### Hardware Acceleration

```typescript
// Auto-detect and use GPU
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264,  // Automatically uses h264_nvenc if available
  },
  hardwareAcceleration: {
    enabled: true,
    preferredType: 'auto',  // or 'nvidia', 'intel', 'amd'
  },
});

// Check hardware capabilities
const hwInfo = await ffmpeg.getHardwareAccelerationInfo();
console.log('Available:', hwInfo.available);
console.log('Types:', hwInfo.types);
```

### Filters & Effects

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264,
    filters: {
      scale: { width: 1920, height: 1080, algorithm: 'lanczos' },
      sharpen: { luma_amount: 1.5 },
      color: { brightness: 0.05, contrast: 1.1 },
      denoise: { luma_spatial: 4 },
      watermark: { image: 'logo.png', x: 10, y: 10, opacity: 0.8 },
    },
  },
  audio: {
    codec: AudioCodec.AAC,
    filters: {
      volume: { level: 150 },
      denoise: { amount: 0.5 },
    },
  },
});
```

### Screenshots

```typescript
// Single screenshot
await ffmpeg.extractScreenshot({
  input: 'video.mp4',
  output: 'screenshot.jpg',
  time: 10,  // 10 seconds
  size: '1920x1080',
});

// Multiple screenshots
const result = await ffmpeg.extractScreenshots({
  input: 'video.mp4',
  folder: 'screenshots',
  filename: 'frame-%i.jpg',
  count: 5,  // 5 evenly spaced screenshots
});
```

### Thumbnails

```typescript
// Extract thumbnails using different strategies
const thumbnails = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'thumbnails/thumb-%d.jpg',
  strategy: 'interval',  // 'time', 'count', 'interval', 'scene', or 'quality'
  count: 10,
  size: '320x180',
});
```

### Video Concatenation

```typescript
// Simple concatenation (same codec, no re-encode)
await ffmpeg.concatenate({
  inputs: ['video1.mp4', 'video2.mp4', 'video3.mp4'],
  output: 'combined.mp4',
  method: 'concat',
});

// With normalization and transitions
await ffmpeg.concatenate({
  inputs: ['video1.mp4', 'video2.mp4'],
  output: 'combined.mp4',
  method: 'complex',
  normalize: {
    enabled: true,
    video: {
      codec: VideoCodec.H264,
      size: '1920x1080',
    },
  },
  transitions: {
    enabled: true,
    type: 'crossfade',
    duration: 1,
  },
});
```

### Trailer Generation

```typescript
// Generate video trailer from segments
const trailer = await ffmpeg.generateTrailer({
  input: 'movie.mp4',
  output: 'trailer.mp4',
  strategy: 'segments',  // 'segments', 'duration', 'scenes', or 'highlights'
  maxDuration: 30,  // 30 seconds max
  segmentCount: 5,   // Extract 5 segments
});
```

### Batch Processing

```typescript
// Sequential processing
await ffmpeg.convertBatch([
  { input: 'video1.mp4', output: 'output1.mp4', video: { codec: VideoCodec.H264 } },
  { input: 'video2.mp4', output: 'output2.mp4', video: { codec: VideoCodec.H264 } },
]);

// Parallel processing
await ffmpeg.convertBatchParallel(
  [
    { input: 'video1.mp4', output: 'output1.mp4', video: { codec: VideoCodec.H264 } },
    { input: 'video2.mp4', output: 'output2.mp4', video: { codec: VideoCodec.H264 } },
  ],
  {
    concurrency: 3,  // Process 3 at a time
    onProgress: (file, progress) => {
      console.log(`${file}: ${progress.percent}%`);
    },
  }
);
```

### Progress Tracking

```typescript
ffmpeg.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}%`);
  console.log(`FPS: ${progress.currentFps}`);
  console.log(`Time: ${progress.timemark}`);
});

ffmpeg.on('end', () => {
  console.log('Conversion complete!');
});

ffmpeg.on('error', (error) => {
  console.error('Conversion failed:', error);
});

await ffmpeg.convert({ ... });
```

### Conversion Analysis

```typescript
// Get conversion suggestions based on input file
const suggestions = await ffmpeg.getConversionSuggestions('input.mp4');
console.log('Compatible formats:', suggestions.formats);
console.log('Available codecs:', suggestions.videoCodecs);

// Check if conversion is possible
const compatible = await ffmpeg.checkConversionCompatibility({
  input: 'input.mp4',
  outputFormat: 'webm',
  videoCodec: VideoCodec.VP9,
  audioCodec: AudioCodec.OPUS,
});

// Get common settings for specific use cases
const recommendation = await ffmpeg.getConversionRecommendation('input.mp4', 'web');
// Returns settings commonly used for web streaming
```

### Presets

```typescript
import { presets } from 'ffmpeg-forge';

// Use built-in preset configuration
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  ...presets.youtube,  // Pre-configured settings
});

// Available presets:
// - youtube, instagramPost, instagramStory, tiktok, twitter
// - webStreaming, mobile, archive, smallFile, dvd
// - audioOnly, podcast, gif, upscale4K
```

### Advanced Features

```typescript
// Picture-in-picture
await ffmpeg.pictureInPicture({
  main: 'main-video.mp4',
  overlay: 'webcam.mp4',
  output: 'pip.mp4',
  position: 'bottom-right',
  overlaySize: '320x180',
});

// Side-by-side comparison
await ffmpeg.sideBySide({
  left: 'original.mp4',
  right: 'processed.mp4',
  output: 'comparison.mp4',
  orientation: 'horizontal',
});

// Merge audio tracks
await ffmpeg.merge({
  inputs: [
    { source: 'video.mp4', type: 'video' },
    { source: 'audio.mp3', type: 'audio' },
  ],
  output: 'merged.mp4',
});
```

## Available Filters

### Video Filters (12)
- **scale** - Resize with 10 algorithms (Lanczos, Bicubic, etc.)
- **crop** - Position-aware cropping
- **pad** - Letterboxing/pillarboxing
- **deinterlace** - 3 modes (YADIF, BWDIF, W3FDIF)
- **denoise** - 4 algorithms (HQDN3D, NLMeans, etc.)
- **sharpen** - Unsharp mask
- **color** - Brightness, contrast, saturation, gamma
- **rotate** - Any angle rotation
- **flip** - Horizontal/vertical
- **text** - Text overlay with styling
- **fade** - Fade in/out effects
- **custom** - Any FFmpeg filter string

### Audio Filters (5)
- **volume** - Volume control
- **denoise** - Audio noise reduction
- **equalizer** - Multi-band EQ
- **tempo** - Speed without pitch change
- **pitch** - Pitch shift

[See full filter documentation](./docs/FILTERS.md)

## Hardware Acceleration

Supports 6 hardware acceleration platforms:

- **NVIDIA NVENC** - H.264, H.265, AV1
- **Intel Quick Sync** - H.264, H.265, AV1, VP9
- **AMD AMF** - H.264, H.265
- **VAAPI** (Linux) - H.264, H.265, VP8, VP9, AV1
- **VideoToolbox** (macOS) - H.264, H.265
- **V4L2** (ARM) - H.264

[Hardware acceleration guide](./docs/HARDWARE.md)

## Comparison with fluent-ffmpeg

> **Note:** This package was created as a modern alternative to fluent-ffmpeg, which is no longer actively maintained.

| Feature | fluent-ffmpeg | ffmpeg-forge |
|---------|--------------|----------------|
| TypeScript | Type definitions | Native |
| Dependencies | 3 packages | 0 |
| Bundle Size | ~45KB gzipped | 25.5KB gzipped |
| Hardware Acceleration | No | Yes (6 platforms) |
| Batch Processing | No | Yes (sequential & parallel) |
| Configuration API | Chaining | Config objects |
| Presets | No | 15 built-in |
| Status | Deprecated | Active |

**Note:** Both packages are wrappers around FFmpeg. This package focuses on TypeScript support and modern API design.

## Configuration

### Manual FFmpeg/FFprobe Path

```typescript
import { FFmpeg } from 'ffmpeg-forge';

FFmpeg.setFFmpegPath('/custom/path/to/ffmpeg');
FFmpeg.setFFprobePath('/custom/path/to/ffprobe');

const ffmpeg = new FFmpeg();
```

### Buffer I/O

```typescript
import { readFileSync } from 'fs';

// Input from Buffer
const inputBuffer = readFileSync('input.mp4');
await ffmpeg.convert({
  input: inputBuffer,
  output: 'output.mp4',
  video: { codec: VideoCodec.H264 },
});

// Output to Buffer
const outputBuffer = await ffmpeg.convertToBuffer({
  input: 'input.mp4',
  video: { codec: VideoCodec.H264 },
  format: 'mp4',
});
```

### Dry Run

```typescript
// Preview command without executing
const command = ffmpeg.buildCommand({
  input: 'input.mp4',
  output: 'output.mp4',
  video: { codec: VideoCodec.H264, bitrate: '2M' },
});
console.log('FFmpeg command:', command);
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run examples
npm run example
npm run example:hardware
npm run example:thumbnails
```

## API Reference

[Complete API documentation](./docs/API.md)

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

MIT © [Parth Jansari](https://github.com/parth181195)

## Tested Environment

This package has been tested on the following configuration:

**Software:**
- FFmpeg: 7.1.1
- Node.js: 18+
- Operating System: Ubuntu 25.04 (Linux kernel 6.14)

**Hardware:**
- CPU: AMD Ryzen 5 5600X (6-Core, 12 threads)
- GPU: NVIDIA GeForce RTX 4070 (12GB VRAM, Driver 580.65)
- RAM: 60GB

**Note:** The package should work on any system with FFmpeg 4.0+ and Node.js 16+. Hardware acceleration features depend on your specific GPU and drivers.

## Acknowledgments

This package was inspired by [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg), which has been the go-to FFmpeg wrapper for Node.js for many years. As fluent-ffmpeg is no longer actively maintained and has deprecated dependencies, ffmpeg-forge was created to provide a modern, type-safe alternative with zero dependencies and contemporary JavaScript/TypeScript features.

This is a TypeScript wrapper around [FFmpeg](https://ffmpeg.org/), the powerful multimedia framework that does all the heavy lifting.

Built with:
- [TypeScript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev/)
- Node.js built-in modules

Special thanks to the fluent-ffmpeg contributors for pioneering FFmpeg wrappers in Node.js.
