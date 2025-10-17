---
layout: home

hero:
  name: ffmpeg-forge
  text: Modern FFmpeg Wrapper
  tagline: Type-safe FFmpeg for Node.js with hardware acceleration and zero dependencies
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/parth181195/ffmpeg-forge

features:
  - icon: 📘
    title: TypeScript Native
    details: Full TypeScript support with comprehensive type definitions, not just type declarations

  - icon: ⚡
    title: Hardware Acceleration
    details: Auto-detect and use GPU encoding on 6 platforms (NVIDIA, Intel, AMD, VAAPI, VideoToolbox, V4L2)

  - icon: 📦
    title: Zero Dependencies
    details: Uses only Node.js built-in modules. No external dependencies, smaller bundle size

  - icon: 🎨
    title: 17 Filters
    details: Video and audio filters with full type support - scale, crop, denoise, sharpen, and more

  - icon: 🔧
    title: Configuration-Based
    details: Immutable, serializable configs instead of method chaining. Type-safe and testable

  - icon: 🚀
    title: Batch Processing
    details: Process multiple files sequentially or in parallel with configurable concurrency

  - icon: 📸
    title: Media Extraction
    details: Screenshots, thumbnails (5 strategies), and trailer generation (4 strategies)

  - icon: 🎯
    title: Production Presets
    details: 15 built-in presets for YouTube, Instagram, TikTok, Twitter, and more

  - icon: 📊
    title: Progress Tracking
    details: Real-time progress events with FPS, bitrate, percentage, and time information
---

## Quick Example

```typescript
import { FFmpeg, VideoCodec, AudioCodec } from 'ffmpeg-forge';

const ffmpeg = new FFmpeg();

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

## Why ffmpeg-forge?

This package was created as a modern alternative to [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg), which is no longer actively maintained. It provides:

- **TypeScript native** - Not just type definitions
- **Zero dependencies** - Only Node.js built-ins
- **Hardware acceleration** - 2-10x faster encoding
- **Modern API** - Configuration-based instead of chaining
- **Smaller bundle** - 25.5 KB gzipped vs 45 KB
- **Better DX** - Full autocomplete and type safety

## Installation

```bash
npm install ffmpeg-forge
```

**Requirements:**
- Node.js 16+
- FFmpeg 4.0+ installed on your system

## What's Next?

<div class="vp-doc">

- [Getting Started](/guide/getting-started) - Learn the basics
- [Hardware Acceleration](/guide/hardware) - Speed up encoding with GPU
- [Filters Guide](/guide/filters) - Apply video and audio effects
- [Examples](/examples/basic-conversion) - See code examples

</div>

