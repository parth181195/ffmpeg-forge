# Video Configuration

Complete reference for `VideoConfig` interface.

## Interface

```typescript
interface VideoConfig {
  // Codec
  codec?: VideoCodec | string;
  
  // Quality
  quality?: number;
  bitrate?: string;
  minBitrate?: string;
  maxBitrate?: string;
  bufferSize?: string;
  
  // Resolution
  size?: string | Resolution;
  width?: number;
  height?: number;
  
  // Frame rate
  fps?: number | FrameRate;
  
  // Encoding
  preset?: string | VideoPreset;
  profile?: string | VideoProfile;
  level?: string | VideoLevel;
  pixelFormat?: string | PixelFormat;
  
  // GOP
  keyframeInterval?: number;
  bframes?: number;
  refs?: number;
  
  // Aspect ratio
  aspectRatio?: string | AspectRatio;
  
  // Hardware
  hwAccel?: HardwareAccelerationValue;
  hwAccelDevice?: string;
  
  // Filters
  filters?: VideoFilters;
}
```

---

## Codec Options

### codec

**Type:** `VideoCodec | string`

Video codec for encoding.

**Available codecs:**

```typescript
enum VideoCodec {
  // Software (CPU)
  H264 = 'libx264',
  H265 = 'libx265',
  VP8 = 'libvpx',
  VP9 = 'libvpx-vp9',
  AV1 = 'libaom-av1',
  AV1_SVT = 'libsvtav1',
  MPEG4 = 'mpeg4',
  MPEG2 = 'mpeg2video',
  THEORA = 'libtheora',
  MJPEG = 'mjpeg',
  
  // Hardware - NVIDIA
  H264_NVENC = 'h264_nvenc',
  HEVC_NVENC = 'hevc_nvenc',
  AV1_NVENC = 'av1_nvenc',
  
  // Hardware - Intel QSV
  H264_QSV = 'h264_qsv',
  HEVC_QSV = 'hevc_qsv',
  VP9_QSV = 'vp9_qsv',
  AV1_QSV = 'av1_qsv',
  
  // Hardware - AMD AMF
  H264_AMF = 'h264_amf',
  HEVC_AMF = 'hevc_amf',
  
  // Hardware - VAAPI (Linux)
  H264_VAAPI = 'h264_vaapi',
  HEVC_VAAPI = 'hevc_vaapi',
  VP8_VAAPI = 'vp8_vaapi',
  VP9_VAAPI = 'vp9_vaapi',
  
  // Hardware - VideoToolbox (macOS)
  H264_VIDEOTOOLBOX = 'h264_videotoolbox',
  HEVC_VIDEOTOOLBOX = 'hevc_videotoolbox',
  PRORES_VIDEOTOOLBOX = 'prores_videotoolbox',
  
  // Special
  COPY = 'copy', // Copy without re-encoding
}
```

**Examples:**

```typescript
// Software H.264
{ codec: VideoCodec.H264 }

// NVIDIA hardware encoding
{ codec: VideoCodec.H264_NVENC }

// Custom codec string
{ codec: 'libx265' }

// Copy (no re-encoding)
{ codec: VideoCodec.COPY }
```

---

## Quality Options

### quality

**Type:** `number`

CRF (Constant Rate Factor) for quality-based encoding.

**Range:**
- H.264/H.265: 0-51 (0=lossless, 51=worst, 23=default)
- VP9: 0-63
- Lower = better quality, larger file

**Examples:**

```typescript
// High quality
{ quality: 18 }

// Standard quality
{ quality: 23 }

// Low quality (smaller file)
{ quality: 28 }
```

**Note:** Don't use with `bitrate`. Choose one or the other.

---

### bitrate

**Type:** `string`

Target bitrate for video.

**Format:** `"<number><unit>"` where unit is `k` or `M`

**Examples:**

```typescript
{ bitrate: '2M' }    // 2 Mbps
{ bitrate: '500k' }  // 500 Kbps
{ bitrate: '10M' }   // 10 Mbps
```

**Recommended bitrates:**

| Resolution | Quality | Bitrate |
|------------|---------|---------|
| 480p | Standard | 1-2 Mbps |
| 720p | Standard | 3-5 Mbps |
| 1080p | Standard | 5-8 Mbps |
| 1080p | High | 10-15 Mbps |
| 4K | Standard | 20-35 Mbps |
| 4K | High | 50-100 Mbps |

---

### minBitrate / maxBitrate

**Type:** `string`

Bitrate constraints for VBR (Variable Bitrate) encoding.

**Examples:**

```typescript
{
  bitrate: '5M',
  minBitrate: '3M',
  maxBitrate: '8M',
}
```

---

### bufferSize

**Type:** `string`

VBV buffer size for bitrate control.

**Example:**

```typescript
{ bufferSize: '10M' }
```

---

## Resolution Options

### size

**Type:** `string | Resolution`

Output resolution.

**String formats:**
- `"WIDTHxHEIGHT"` - Fixed size (e.g., `"1920x1080"`)
- `"WIDTH x?"` - Fixed width, auto height (e.g., `"1920x?"`)
- `"?xHEIGHT"` - Auto width, fixed height (e.g., `"?x1080"`)

**Resolution enum:**

```typescript
enum Resolution {
  UHD8K = '7680x4320',
  UHD4K = '3840x2160',
  QHD = '2560x1440',
  HD1080 = '1920x1080',
  HD720 = '1280x720',
  SD480 = '854x480',
  SD360 = '640x360',
}
```

**Examples:**

```typescript
// Fixed resolution
{ size: '1920x1080' }

// Enum
{ size: Resolution.HD1080 }

// Scale to width, maintain aspect
{ size: '1920x?' }

// Scale to height, maintain aspect
{ size: '?x1080' }
```

---

### width / height

**Type:** `number`

Alternative to `size` for specifying dimensions.

**Examples:**

```typescript
{ width: 1920, height: 1080 }

// Only width (maintains aspect)
{ width: 1920 }

// Only height (maintains aspect)
{ height: 1080 }
```

---

## Frame Rate Options

### fps

**Type:** `number | FrameRate`

Output frame rate (frames per second).

```typescript
enum FrameRate {
  FPS15 = 15,
  FPS24 = 24,
  FPS25 = 25,
  FPS30 = 30,
  FPS60 = 60,
  FPS120 = 120,
}
```

**Examples:**

```typescript
{ fps: 30 }
{ fps: FrameRate.FPS60 }
```

---

## Encoding Options

### preset

**Type:** `string | VideoPreset`

Encoding speed vs compression efficiency preset.

```typescript
enum VideoPreset {
  ULTRAFAST = 'ultrafast',
  SUPERFAST = 'superfast',
  VERYFAST = 'veryfast',
  FASTER = 'faster',
  FAST = 'fast',
  MEDIUM = 'medium',
  SLOW = 'slow',
  SLOWER = 'slower',
  VERYSLOW = 'veryslow',
}
```

**Trade-off:**
- Faster presets = quicker encoding, larger files
- Slower presets = slower encoding, smaller files, better quality

**Recommendations:**
- Development/testing: `ultrafast` or `fast`
- Production: `medium` or `slow`
- Archival: `slower` or `veryslow`

**Examples:**

```typescript
{ preset: VideoPreset.SLOW }
{ preset: 'medium' }
```

---

### profile

**Type:** `string | VideoProfile`

H.264/H.265 encoding profile.

```typescript
enum VideoProfile {
  BASELINE = 'baseline',
  MAIN = 'main',
  HIGH = 'high',
  HIGH10 = 'high10',
  HIGH422 = 'high422',
  HIGH444 = 'high444',
}
```

**H.264 profiles:**
- `baseline` - Maximum compatibility (old devices)
- `main` - Good compatibility
- `high` - Best compression (modern devices)

**Examples:**

```typescript
{ profile: VideoProfile.HIGH }
{ profile: 'main' }
```

---

### level

**Type:** `string | VideoLevel`

H.264/H.265 level (resolution/bitrate limits).

```typescript
enum VideoLevel {
  LEVEL_3_0 = '3.0',
  LEVEL_3_1 = '3.1',
  LEVEL_4_0 = '4.0',
  LEVEL_4_1 = '4.1',
  LEVEL_5_0 = '5.0',
  LEVEL_5_1 = '5.1',
  LEVEL_5_2 = '5.2',
}
```

**Common levels:**
- `3.1` - Up to 720p @ 30fps
- `4.0` - Up to 1080p @ 30fps
- `4.1` - Up to 1080p @ 60fps
- `5.0` - Up to 4K @ 30fps
- `5.1` - Up to 4K @ 60fps

**Examples:**

```typescript
{ level: '4.1' }
{ level: VideoLevel.LEVEL_5_0 }
```

---

### pixelFormat

**Type:** `string | PixelFormat`

Pixel format (color space).

```typescript
enum PixelFormat {
  YUV420P = 'yuv420p',
  YUV422P = 'yuv422p',
  YUV444P = 'yuv444p',
  YUV420P10LE = 'yuv420p10le',
  RGB24 = 'rgb24',
  RGBA = 'rgba',
}
```

**Common formats:**
- `yuv420p` - Standard (best compatibility)
- `yuv422p` - Higher chroma resolution
- `yuv444p` - Full chroma resolution
- `yuv420p10le` - 10-bit color

**Examples:**

```typescript
{ pixelFormat: PixelFormat.YUV420P }
{ pixelFormat: 'yuv420p' }
```

---

## GOP (Group of Pictures) Options

### keyframeInterval

**Type:** `number`

Interval between keyframes (I-frames) in frames.

**Formula:** `fps * seconds_between_keyframes`

**Recommendations:**
- Streaming: 2-4 seconds (60-120 frames @ 30fps)
- Download: 10 seconds (300 frames @ 30fps)

**Examples:**

```typescript
// Keyframe every 2 seconds @ 30fps
{ keyframeInterval: 60 }

// Keyframe every 10 seconds @ 30fps
{ keyframeInterval: 300 }
```

---

### bframes

**Type:** `number`

Number of B-frames between keyframes.

**Range:** 0-16 (typically 0-4)

**Trade-off:**
- More B-frames = better compression, higher CPU usage
- Fewer B-frames = faster encoding, larger files

**Examples:**

```typescript
{ bframes: 0 }  // Lowest latency
{ bframes: 2 }  // Balanced
{ bframes: 4 }  // Best compression
```

---

### refs

**Type:** `number`

Number of reference frames.

**Range:** 1-16

**Examples:**

```typescript
{ refs: 1 }  // Fast encoding
{ refs: 3 }  // Balanced
{ refs: 5 }  // Best quality
```

---

## Aspect Ratio

### aspectRatio

**Type:** `string | AspectRatio`

Output aspect ratio.

```typescript
enum AspectRatio {
  RATIO_16_9 = '16:9',
  RATIO_4_3 = '4:3',
  RATIO_21_9 = '21:9',
  RATIO_1_1 = '1:1',
  RATIO_9_16 = '9:16',
}
```

**Examples:**

```typescript
{ aspectRatio: AspectRatio.RATIO_16_9 }
{ aspectRatio: '4:3' }
```

---

## Hardware Acceleration

### hwAccel

**Type:** `HardwareAccelerationValue`

Hardware acceleration method.

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

**Examples:**

```typescript
{ hwAccel: HardwareAcceleration.NVIDIA }
```

---

### hwAccelDevice

**Type:** `string`

Specific hardware device to use.

**Examples:**

```typescript
// NVIDIA GPU 0
{ hwAccel: HardwareAcceleration.NVIDIA, hwAccelDevice: '0' }

// NVIDIA GPU 1
{ hwAccelDevice: '1' }
```

---

## Filters

### filters

**Type:** `VideoFilters`

Video filters to apply. See [Filters Reference](/api/filters).

**Example:**

```typescript
{
  filters: {
    scale: { width: 1920, height: 1080 },
    text: { text: 'Watermark', x: 10, y: 10 },
    fade: { type: 'in', duration: 2 },
  },
}
```

---

## Complete Examples

### Basic Conversion

```typescript
{
  codec: VideoCodec.H264,
  bitrate: '2M',
  size: '1920x1080',
  fps: 30,
}
```

---

### High Quality

```typescript
{
  codec: VideoCodec.H265,
  quality: 18,
  preset: VideoPreset.SLOW,
  profile: VideoProfile.MAIN,
  bframes: 4,
  refs: 3,
}
```

---

### Hardware Acceleration (NVIDIA)

```typescript
{
  codec: VideoCodec.H264_NVENC,
  bitrate: '8M',
  preset: VideoPreset.SLOW,  // Maps to p7 on NVENC
  size: Resolution.HD1080,
  fps: FrameRate.FPS30,
}
```

---

### With Filters

```typescript
{
  codec: VideoCodec.H264,
  bitrate: '5M',
  filters: {
    scale: {
      width: 1920,
      height: 1080,
      algorithm: ScalingAlgorithm.LANCZOS,
    },
    text: {
      text: '© 2024',
      x: '(w-tw)/2',
      y: 'h-th-50',
      fontsize: 24,
      fontcolor: 'white',
    },
  },
}
```

---

## See Also

- [Audio Configuration](/api/audio-config)
- [Filters Reference](/api/filters)
- [Enums](/api/enums)
- [Conversion Config](/api/conversion-config)

