# Filter and Scaling Examples

## Video Filters

### 1. Basic Upscaling (HD to 4K)

```typescript
await ffmpeg.convert({
  input: 'hd-video.mp4',
  output: '4k-video.mp4',
  video: {
    codec: VideoCodec.H265,
    upscale: {
      algorithm: ScalingAlgorithm.LANCZOS, // Best quality
      targetWidth: 3840,
      targetHeight: 2160,
      enhanceSharpness: true,
      denoiseBeforeScale: true,
      sharpnessAmount: 1.5,
    },
  },
});
```

### 2. Smart Downscaling (4K to 1080p)

```typescript
await ffmpeg.convert({
  input: '4k-video.mp4',
  output: '1080p-video.mp4',
  video: {
    codec: VideoCodec.H264,
    downscale: {
      algorithm: ScalingAlgorithm.LANCZOS,
      targetWidth: 1920,
      targetHeight: 1080,
      deinterlace: true,
      preserveDetails: true,
    },
  },
});
```

### 3. Custom Scaling with Filters

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'scaled.mp4',
  video: {
    filters: {
      scale: {
        width: 1920,
        height: 1080,
        algorithm: ScalingAlgorithm.LANCZOS,
        force_original_aspect_ratio: 'decrease',
        force_divisible_by: 2, // Required for some codecs
      },
    },
  },
});
```

### 4. Auto-Calculate Dimensions

```typescript
// Fixed width, auto height
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'output.mp4',
  video: {
    filters: {
      scale: {
        width: 1920,
        height: -1, // Auto-calculate to maintain aspect ratio
      },
    },
  },
});

// Fixed height, auto width
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'output.mp4',
  video: {
    size: '?x1080', // Shorthand syntax
  },
});
```

### 5. Deinterlacing

```typescript
await ffmpeg.convert({
  input: 'interlaced.mp4',
  output: 'progressive.mp4',
  video: {
    filters: {
      deinterlace: {
        mode: DeinterlaceMode.YADIF,
        parity: 'auto',
        deint: 'all',
      },
    },
  },
});
```

### 6. Noise Reduction

```typescript
await ffmpeg.convert({
  input: 'noisy-video.mp4',
  output: 'clean-video.mp4',
  video: {
    filters: {
      denoise: {
        filter: DenoiseFilter.HQDN3D,
        luma_spatial: 4,
        chroma_spatial: 3,
        luma_tmp: 6,
        chroma_tmp: 4.5,
      },
    },
  },
});
```

### 7. Sharpening

```typescript
await ffmpeg.convert({
  input: 'soft-video.mp4',
  output: 'sharp-video.mp4',
  video: {
    filters: {
      sharpen: {
        luma_msize_x: 5,
        luma_msize_y: 5,
        luma_amount: 1.5,
        chroma_msize_x: 5,
        chroma_msize_y: 5,
        chroma_amount: 1.0,
      },
    },
  },
});
```

### 8. Color Correction

```typescript
await ffmpeg.convert({
  input: 'dark-video.mp4',
  output: 'corrected-video.mp4',
  video: {
    filters: {
      color: {
        brightness: 0.1, // Increase brightness
        contrast: 1.2, // Increase contrast
        saturation: 1.1, // Slightly more vibrant
        gamma: 1.2, // Adjust gamma
      },
    },
  },
});
```

### 9. Cropping and Padding

```typescript
// Crop video
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'cropped.mp4',
  video: {
    filters: {
      crop: {
        width: 1920,
        height: 800, // Cinematic aspect
        x: '(iw-1920)/2', // Center horizontally
        y: '(ih-800)/2', // Center vertically
      },
    },
  },
});

// Add padding/letterbox
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'padded.mp4',
  video: {
    filters: {
      pad: {
        width: 1920,
        height: 1080,
        x: '(ow-iw)/2',
        y: '(oh-ih)/2',
        color: 'black',
      },
    },
  },
});
```

### 10. Rotation and Flipping

```typescript
// Rotate video
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'rotated.mp4',
  video: {
    filters: {
      rotate: {
        angle: 'PI/4', // 45 degrees
        fillcolor: 'black',
        bilinear: true,
      },
    },
  },
});

// Flip video
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'flipped.mp4',
  video: {
    filters: {
      flip: {
        horizontal: true,
        vertical: false,
      },
    },
  },
});
```

### 11. Watermark

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'watermarked.mp4',
  video: {
    filters: {
      watermark: {
        input: 'logo.png',
        x: 'main_w-overlay_w-10', // 10px from right
        y: 'main_h-overlay_h-10', // 10px from bottom
        opacity: 0.7,
      },
    },
  },
});
```

### 12. Text Overlay

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'with-text.mp4',
  video: {
    filters: {
      text: {
        text: 'Copyright © 2025',
        fontsize: 24,
        fontcolor: 'white',
        x: 10,
        y: 10,
        shadowcolor: 'black',
        shadowx: 2,
        shadowy: 2,
        borderw: 2,
        bordercolor: 'black',
      },
    },
  },
});
```

### 13. Fade In/Out

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'faded.mp4',
  video: {
    filters: {
      fade: {
        type: 'in',
        start_time: 0,
        duration: 2, // 2 second fade in
      },
    },
  },
});
```

## Audio Filters

### 1. Volume Adjustment

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'louder.mp4',
  audio: {
    filters: {
      volume: {
        volume: 1.5, // 150% volume
        precision: 'float',
      },
    },
  },
});

// Or in dB
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'louder.mp4',
  audio: {
    filters: {
      volume: {
        volume: '10dB', // Increase by 10dB
      },
    },
  },
});
```

### 2. Audio Noise Reduction

```typescript
await ffmpeg.convert({
  input: 'noisy-audio.mp4',
  output: 'clean-audio.mp4',
  audio: {
    filters: {
      denoise: {
        noise_reduction: 0.5,
        noise_type: 'white',
      },
    },
  },
});
```

### 3. Equalizer

```typescript
await ffmpeg.convert({
  input: 'audio.mp4',
  output: 'equalized.mp4',
  audio: {
    filters: {
      equalizer: [
        { frequency: 100, width_type: 'q', width: 1, gain: 5 }, // Boost bass
        { frequency: 1000, width_type: 'q', width: 1, gain: -2 }, // Cut mids
        { frequency: 10000, width_type: 'q', width: 1, gain: 3 }, // Boost treble
      ],
    },
  },
});
```

### 4. Speed Change (Tempo)

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'faster.mp4',
  audio: {
    filters: {
      tempo: {
        tempo: 1.5, // 1.5x speed (without pitch change)
      },
    },
  },
});
```

### 5. Pitch Shift

```typescript
await ffmpeg.convert({
  input: 'audio.mp4',
  output: 'higher-pitch.mp4',
  audio: {
    filters: {
      pitch: {
        pitch: 2, // Up 2 semitones
      },
    },
  },
});
```

## Combined Filters

### 1. Upscale + Denoise + Sharpen

```typescript
await ffmpeg.convert({
  input: 'old-video.mp4',
  output: 'enhanced-4k.mp4',
  video: {
    codec: VideoCodec.H265,
    filters: {
      denoise: {
        filter: DenoiseFilter.HQDN3D,
        luma_spatial: 4,
      },
      scale: {
        width: 3840,
        height: 2160,
        algorithm: ScalingAlgorithm.LANCZOS,
      },
      sharpen: {
        luma_amount: 2,
      },
    },
  },
});
```

### 2. Complete Video Enhancement

```typescript
await ffmpeg.convert({
  input: 'raw-footage.mp4',
  output: 'polished.mp4',
  video: {
    codec: VideoCodec.H264,
    bitrate: '5M',
    filters: {
      deinterlace: {
        mode: DeinterlaceMode.YADIF,
      },
      denoise: {
        filter: DenoiseFilter.HQDN3D,
        luma_spatial: 3,
      },
      color: {
        brightness: 0.05,
        contrast: 1.1,
        saturation: 1.05,
      },
      sharpen: {
        luma_amount: 1.2,
      },
      scale: {
        width: 1920,
        height: 1080,
        algorithm: ScalingAlgorithm.LANCZOS,
      },
      watermark: {
        input: 'logo.png',
        x: 'main_w-overlay_w-20',
        y: 20,
        opacity: 0.8,
      },
    },
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '192k',
    volumeNormalization: true,
    filters: {
      denoise: {
        noise_reduction: 0.3,
      },
    },
  },
});
```

### 3. Custom Filter Chain

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'custom.mp4',
  video: {
    filters: {
      custom: [
        'scale=1920:1080:flags=lanczos',
        'unsharp=5:5:1.0:5:5:0.0',
        'eq=brightness=0.1:contrast=1.2',
      ],
    },
  },
  audio: {
    filters: {
      custom: ['volume=1.5', 'highpass=f=200', 'lowpass=f=3000'],
    },
  },
});
```

## Complex Multi-Stream Filters

### 1. Picture-in-Picture

```typescript
await ffmpeg.convert({
  input: 'main-video.mp4',
  output: 'pip.mp4',
  complexFilters: [
    {
      inputs: ['0:v', '1:v'],
      filter: 'overlay',
      options: {
        x: 'main_w-overlay_w-10',
        y: 'main_h-overlay_h-10',
      },
      outputs: ['v'],
    },
  ],
});
```

### 2. Side-by-Side Comparison

```typescript
await ffmpeg.convert({
  input: 'video1.mp4',
  output: 'comparison.mp4',
  complexFilters: [
    {
      inputs: ['0:v'],
      filter: 'scale',
      options: { w: 960, h: 1080 },
      outputs: ['left'],
    },
    {
      inputs: ['1:v'],
      filter: 'scale',
      options: { w: 960, h: 1080 },
      outputs: ['right'],
    },
    {
      inputs: ['left', 'right'],
      filter: 'hstack',
      outputs: ['v'],
    },
  ],
});
```

## Preset Configurations

```typescript
// Define reusable presets
const presets = {
  youtubeUpload: {
    video: {
      codec: VideoCodec.H264,
      bitrate: '8M',
      size: '1920x1080',
      fps: 30,
      filters: {
        color: {
          contrast: 1.1,
          saturation: 1.05,
        },
      },
    },
    audio: {
      codec: AudioCodec.AAC,
      bitrate: '192k',
      volumeNormalization: true,
    },
  },

  instagramStory: {
    video: {
      codec: VideoCodec.H264,
      size: '1080x1920', // Portrait
      filters: {
        scale: {
          width: 1080,
          height: 1920,
          algorithm: ScalingAlgorithm.LANCZOS,
        },
      },
    },
    timing: {
      duration: 15, // 15 second clips
    },
  },

  aiUpscale: {
    video: {
      codec: VideoCodec.H265,
      upscale: {
        algorithm: ScalingAlgorithm.LANCZOS,
        targetWidth: 3840,
        targetHeight: 2160,
        enhanceSharpness: true,
        denoiseBeforeScale: true,
        sharpnessAmount: 2,
      },
    },
  },
};

// Use preset
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'youtube.mp4',
  ...presets.youtubeUpload,
});
```
