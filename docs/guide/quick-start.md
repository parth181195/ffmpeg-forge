# Quick Start

This guide will walk you through common use cases with ffmpeg-forge.

## Basic Conversion

Convert a video to a different format:

```typescript
import { FFmpeg, VideoCodec, AudioCodec } from 'ffmpeg-forge';

const ffmpeg = new FFmpeg();

await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.webm',
  video: {
    codec: VideoCodec.VP9,
    bitrate: '1M',
  },
  audio: {
    codec: AudioCodec.OPUS,
    bitrate: '128k',
  },
});
```

## Resize Video

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264,
    size: '1280x720', // or { width: 1280, height: 720 }
  },
});
```

## Extract Audio

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'audio.mp3',
  video: {
    disabled: true, // No video
  },
  audio: {
    codec: AudioCodec.MP3,
    bitrate: '192k',
  },
});
```

## Trim Video

```typescript
await ffmpeg.convert({
  input: 'long-video.mp4',
  output: 'clip.mp4',
  timing: {
    seek: 10,      // Start at 10 seconds
    duration: 30,  // 30 seconds long
  },
  video: {
    codec: VideoCodec.COPY, // Fast, no re-encode
  },
  audio: {
    codec: AudioCodec.COPY,
  },
});
```

## Apply Filters

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
    },
  },
});
```

## Hardware Acceleration

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264, // Automatically uses h264_nvenc if NVIDIA GPU available
  },
  hardwareAcceleration: {
    enabled: true,
    preferredType: 'auto', // or 'nvidia', 'intel', 'amd'
  },
});
```

## Use Presets

```typescript
import { presets } from 'ffmpeg-forge';

// YouTube preset
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'youtube.mp4',
  ...presets.youtube,
});

// Instagram Story
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'story.mp4',
  ...presets.instagramStory,
});
```

## Extract Screenshot

```typescript
// Single screenshot
await ffmpeg.extractScreenshot({
  input: 'video.mp4',
  output: 'screenshot.jpg',
  time: 30, // 30 seconds
  size: '1920x1080',
});

// Multiple screenshots
await ffmpeg.extractScreenshots({
  input: 'video.mp4',
  folder: 'screenshots',
  filename: 'frame-%i.jpg',
  count: 5, // 5 evenly spaced
});
```

## Generate Thumbnails

```typescript
const result = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'thumbnails/thumb-%d.jpg',
  strategy: 'interval', // Every N seconds
  count: 10,
  size: '320x180',
});

console.log(`Generated ${result.count} thumbnails`);
```

## Create Trailer

```typescript
const trailer = await ffmpeg.generateTrailer({
  input: 'movie.mp4',
  output: 'trailer.mp4',
  strategy: 'segments',
  maxDuration: 30, // 30 second trailer
  segmentCount: 5,
});

console.log(`Trailer duration: ${trailer.duration}s`);
```

## Batch Processing

```typescript
// Sequential
await ffmpeg.convertBatch([
  { input: 'video1.mp4', output: 'out1.mp4', video: { codec: VideoCodec.H264 } },
  { input: 'video2.mp4', output: 'out2.mp4', video: { codec: VideoCodec.H264 } },
]);

// Parallel (3 at a time)
await ffmpeg.convertBatchParallel(
  [
    { input: 'video1.mp4', output: 'out1.mp4', video: { codec: VideoCodec.H264 } },
    { input: 'video2.mp4', output: 'out2.mp4', video: { codec: VideoCodec.H264 } },
    { input: 'video3.mp4', output: 'out3.mp4', video: { codec: VideoCodec.H264 } },
  ],
  { concurrency: 3 }
);
```

## Next Steps

- [Getting Started](/guide/getting-started) - Introduction
- [Filters Guide](/FILTERS) - Explore all available filters
- [Hardware Acceleration](/HARDWARE) - Speed up encoding
- [Thumbnails & Trailers](/THUMBNAILS_TRAILERS) - Media extraction

