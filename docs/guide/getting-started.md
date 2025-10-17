# Getting Started

## Introduction

ffmpeg-forge is a modern, type-safe FFmpeg wrapper for Node.js. It provides a configuration-based API with full TypeScript support, hardware acceleration, and zero runtime dependencies.

## What is ffmpeg-forge?

ffmpeg-forge is a TypeScript wrapper around [FFmpeg](https://ffmpeg.org/), the powerful multimedia framework. It handles:

- Video/audio conversion
- Format transcoding
- Filters and effects
- Screenshots and thumbnails
- Trailer generation
- Batch processing
- Hardware-accelerated encoding

## Why ffmpeg-forge?

This package was created as a modern alternative to [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg), which is deprecated. Key improvements:

- **TypeScript Native** - Full type support, not just declarations
- **Zero Dependencies** - Only Node.js built-ins (no deprecated packages)
- **Hardware Acceleration** - GPU encoding support (6 platforms)
- **Configuration API** - Type-safe configs instead of method chaining
- **Smaller Bundle** - 25.5 KB gzipped vs 45 KB
- **Modern Features** - Batch processing, presets, smart analysis

## Installation

::: code-group

```bash [npm]
npm install ffmpeg-forge
```

```bash [yarn]
yarn add ffmpeg-forge
```

```bash [pnpm]
pnpm add ffmpeg-forge
```

:::

## Requirements

- **Node.js**: 16 or higher
- **FFmpeg**: 4.0 or higher

### Installing FFmpeg

::: details Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```
:::

::: details macOS
```bash
brew install ffmpeg
```
:::

::: details Windows
Download from [ffmpeg.org](https://ffmpeg.org/download.html) or use:
```bash
choco install ffmpeg
```
:::

## Your First Conversion

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
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '128k',
  },
});
```

That's it! The conversion will start, and you'll get a fully converted video.

## With Progress Tracking

```typescript
ffmpeg.on('progress', (progress) => {
  console.log(`Progress: ${progress.percent}%`);
  console.log(`FPS: ${progress.currentFps}`);
});

ffmpeg.on('end', () => {
  console.log('Conversion complete!');
});

await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: { codec: VideoCodec.H264 },
});
```

## Next Steps

- [Quick Start Guide](/guide/quick-start) - More examples
- [Filters Guide](/FILTERS) - Apply video/audio effects
- [Hardware Acceleration](/HARDWARE) - Use GPU encoding
- [Thumbnails & Trailers](/THUMBNAILS_TRAILERS) - Media extraction

## Need Help?

- Check the existing guides in the docs/ folder
- Report issues on [GitHub](https://github.com/parth181195/ffmpeg-forge/issues)

