# Hardware Acceleration Guide

## Overview

Hardware acceleration can dramatically speed up video encoding by offloading work to your GPU instead of CPU. This package supports all major hardware acceleration platforms.

## Supported Hardware

| Platform   | Type          | Codecs                      | API              |
| ---------- | ------------- | --------------------------- | ---------------- |
| **NVIDIA** | GPU           | H.264, H.265, AV1           | NVENC (CUDA)     |
| **Intel**  | iGPU/dGPU     | H.264, H.265, AV1, VP9      | Quick Sync (QSV) |
| **AMD**    | GPU           | H.264, H.265                | AMF              |
| **Linux**  | Any           | H.264, H.265, VP8, VP9, AV1 | VAAPI            |
| **macOS**  | Apple Silicon | H.264, H.265                | VideoToolbox     |
| **Linux**  | ARM           | H.264                       | V4L2             |

---

## Detection

### Auto-Detect Available Hardware

```typescript
import { detectHardwareAcceleration, getHardwareAccelerationInfo } from 'node-ffmpeg-ts';

// Simple detection
const available = detectHardwareAcceleration();
console.log('Available:', available); // ['nvidia', 'vaapi', 'intel']

// Detailed info
const info = getHardwareAccelerationInfo();
console.log('Best:', info.best); // 'nvidia'
console.log('Capabilities:', info.capabilities);
// {
//   nvidia: ['h264_nvenc', 'hevc_nvenc', 'av1_nvenc'],
//   vaapi: ['h264_vaapi', 'hevc_vaapi', ...],
// }
```

### Check Specific Hardware

```typescript
import { isHardwareAccelerationAvailable, HardwareAcceleration } from 'node-ffmpeg-ts';

if (isHardwareAccelerationAvailable(HardwareAcceleration.NVIDIA)) {
  console.log('NVIDIA GPU available!');
}
```

---

## Usage

### 1. Auto-Select (Recommended) ⭐

Let the package automatically choose the best hardware codec:

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264, // Will auto-upgrade to h264_nvenc if NVIDIA available
    bitrate: '5M',
  },
  hardwareAcceleration: {
    enabled: true, // Enable hardware acceleration
    preferHardware: true, // Prefer GPU over CPU (default: true)
    fallbackToCPU: true, // Fallback to CPU if GPU fails (default: true)
  },
});
```

**What happens:**

1. Detects best available hardware (e.g., NVIDIA)
2. Converts `libx264` → `h264_nvenc` automatically
3. Adds `-hwaccel cuda` flag
4. Falls back to CPU if hardware fails

---

### 2. Explicit Hardware Type

Specify which hardware acceleration to use:

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264,
  },
  hardwareAcceleration: {
    enabled: true,
    type: HardwareAcceleration.NVIDIA, // Force NVIDIA
  },
});
```

---

### 3. Manual Codec Selection

Use hardware codec directly:

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264_NVENC, // Explicit NVENC codec
    bitrate: '5M',
  },
  hardwareAcceleration: HardwareAcceleration.NVIDIA,
});
```

---

### 4. Simple String Syntax

For convenience:

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264,
  },
  hardwareAcceleration: 'nvidia', // Simple string
});
```

---

## Platform-Specific Examples

### NVIDIA (NVENC)

```typescript
// H.264 NVENC
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264_NVENC,
    bitrate: '5M',
    preset: 'p4', // NVENC presets: p1-p7 (p1=fastest, p7=slowest)
  },
  hardwareAcceleration: HardwareAcceleration.NVIDIA,
});

// H.265 NVENC (better compression)
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.HEVC_NVENC,
    bitrate: '3M', // Lower bitrate with same quality
    preset: 'p5', // Slower = better quality
  },
  hardwareAcceleration: HardwareAcceleration.NVIDIA,
});

// AV1 NVENC (RTX 40-series only)
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.AV1_NVENC,
    bitrate: '2M', // Even lower bitrate!
  },
  hardwareAcceleration: HardwareAcceleration.NVIDIA,
});
```

### Intel Quick Sync (QSV)

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264_QSV,
    bitrate: '4M',
  },
  hardwareAcceleration: HardwareAcceleration.INTEL,
});
```

### AMD AMF

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264_AMF,
    bitrate: '5M',
  },
  hardwareAcceleration: HardwareAcceleration.AMD,
});
```

### VAAPI (Linux)

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264_VAAPI,
    bitrate: '4M',
  },
  hardwareAcceleration: HardwareAcceleration.VAAPI,
});
```

### VideoToolbox (macOS)

```typescript
await ffmpeg.convert({
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264_VIDEOTOOLBOX,
    bitrate: '5M',
  },
  hardwareAcceleration: HardwareAcceleration.VIDEOTOOLBOX,
});
```

---

## Auto-Selection Helper

Get hardware codec for any CPU codec:

```typescript
import { autoSelectHardwareEncoding, VideoCodec } from 'node-ffmpeg-ts';

const selection = autoSelectHardwareEncoding(VideoCodec.H264);

if (selection.isHardware) {
  console.log(`Use: ${selection.codec}`); // 'h264_nvenc'
  console.log(`Acceleration: ${selection.acceleration}`); // 'nvidia'
  console.log(`FFmpeg flag: ${selection.ffmpegHwaccel}`); // 'cuda'
} else {
  console.log(`No hardware available, use: ${selection.codec}`);
}
```

---

## Best Practices

### 1. Always Use Auto-Selection

```typescript
// ✅ Good: Auto-detect and fallback
hardwareAcceleration: {
  enabled: true,
  fallbackToCPU: true,
}

// ❌ Bad: Hard-coded (fails on systems without NVIDIA)
hardwareAcceleration: HardwareAcceleration.NVIDIA
```

### 2. Combine with Presets

```typescript
import { Presets, HardwareAcceleration } from 'node-ffmpeg-ts';

await ffmpeg.convert({
  input: 'video.mp4',
  output: 'youtube.mp4',
  ...Presets.youtube.config,
  hardwareAcceleration: {
    enabled: true, // Auto-detect best GPU
  },
});
```

### 3. Performance Testing

```typescript
// CPU encoding
const cpuStart = Date.now();
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'cpu.mp4',
  video: { codec: VideoCodec.H264 },
});
const cpuTime = Date.now() - cpuStart;

// GPU encoding
const gpuStart = Date.now();
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'gpu.mp4',
  video: { codec: VideoCodec.H264 },
  hardwareAcceleration: { enabled: true },
});
const gpuTime = Date.now() - gpuStart;

console.log(`Speedup: ${(cpuTime / gpuTime).toFixed(2)}x faster with GPU`);
```

---

## Quality Considerations

### Hardware vs CPU Quality

**Hardware Encoding:**

- ✅ **Much faster** (2-10x depending on GPU)
- ✅ **Lower power usage**
- ✅ **Parallel processing**
- ⚠️ **Slightly lower quality** at same bitrate
- ⚠️ **Fewer tuning options**

**CPU Encoding:**

- ✅ **Higher quality** at same bitrate
- ✅ **More presets** and fine-tuning
- ✅ **Better compression** (smaller files)
- ⚠️ **Much slower**
- ⚠️ **Higher power usage**

### When to Use Each

**Use Hardware (GPU) When:**

- Real-time encoding needed
- Batch processing many files
- Energy efficiency matters
- Speed > quality
- Streaming/live encoding

**Use CPU When:**

- Archival quality needed
- File size minimization critical
- Time is not a constraint
- Maximum quality needed

---

## Codec Mapping

The package automatically maps CPU codecs to GPU equivalents:

| CPU Codec | NVIDIA     | Intel    | AMD      | VAAPI      | VideoToolbox      |
| --------- | ---------- | -------- | -------- | ---------- | ----------------- |
| H.264     | h264_nvenc | h264_qsv | h264_amf | h264_vaapi | h264_videotoolbox |
| H.265     | hevc_nvenc | hevc_qsv | hevc_amf | hevc_vaapi | hevc_videotoolbox |
| VP8       | -          | -        | -        | vp8_vaapi  | -                 |
| VP9       | -          | vp9_qsv  | -        | vp9_vaapi  | -                 |
| AV1       | av1_nvenc  | av1_qsv  | -        | av1_vaapi  | -                 |

---

## Troubleshooting

### GPU Not Detected

```bash
# Check FFmpeg hardware support
ffmpeg -hwaccels

# Check available encoders
ffmpeg -encoders | grep nvenc   # NVIDIA
ffmpeg -encoders | grep qsv     # Intel
ffmpeg -encoders | grep amf     # AMD
ffmpeg -encoders | grep vaapi   # VAAPI
```

### Encoding Fails

1. **Update GPU drivers**
2. **Rebuild FFmpeg** with hardware support
3. **Use fallbackToCPU: true** in config
4. **Check FFmpeg compilation flags**:
   ```bash
   ffmpeg -version | grep enable
   ```

### Lower Quality Output

Increase bitrate for hardware encoding:

```typescript
// CPU: 2M bitrate
video: { codec: VideoCodec.H264, bitrate: '2M' }

// GPU: 3M bitrate for similar quality
video: { codec: VideoCodec.H264_NVENC, bitrate: '3M' }
```

---

## Examples

### Example 1: 4K Upscaling with Hardware

```typescript
await ffmpeg.convert({
  input: 'hd-video.mp4',
  output: '4k-video.mp4',
  video: {
    codec: VideoCodec.H265, // Auto-upgrades to hevc_nvenc
    upscale: {
      algorithm: ScalingAlgorithm.LANCZOS,
      targetWidth: 3840,
      targetHeight: 2160,
      enhanceSharpness: true,
    },
  },
  hardwareAcceleration: { enabled: true },
});
```

### Example 2: Batch Encoding with GPU

```typescript
const configs = [
  { input: 'video1.mp4', output: 'out1.mp4' },
  { input: 'video2.mp4', output: 'out2.mp4' },
  { input: 'video3.mp4', output: 'out3.mp4' },
].map(({ input, output }) => ({
  input,
  output,
  video: { codec: VideoCodec.H264 },
  hardwareAcceleration: { enabled: true },
}));

// Process all with GPU in parallel
await ffmpeg.convertBatchParallel(configs, 3); // 3 concurrent
```

### Example 3: Real-time Streaming

```typescript
await ffmpeg.convert({
  input: 'camera-input.mp4',
  output: 'stream.mp4',
  video: {
    codec: VideoCodec.H264,
    preset: 'ultrafast',
    bitrate: '3M',
  },
  hardwareAcceleration: {
    enabled: true,
    preferHardware: true,
  },
});
```

---

## Performance Notes

From our tests (15-second 720p video):

```
CPU (libx264):     0.56s
GPU (h264_nvenc):  0.90s
Speedup:           0.62x (slower for short videos!)
```

**Why GPU seems slower for short videos?**

- GPU initialization overhead (~0.3-0.5s)
- Memory transfer overhead
- Only worth it for longer videos or batch processing

**For longer videos (5+ minutes):**

- GPU can be 2-5x faster
- Significant power savings
- Better for batch processing

---

## API Reference

### detectHardwareAcceleration()

Returns array of available hardware acceleration types.

### getHardwareAccelerationInfo()

Returns detailed info about capabilities.

### autoSelectHardwareEncoding(codec)

Auto-selects best hardware codec for desired CPU codec.

### getBestHardwareAcceleration()

Returns best available hardware (priority: NVIDIA > Intel > AMD > VAAPI > VideoToolbox).

### isHardwareAccelerationAvailable(type)

Check if specific hardware type is available.

### getHardwareCodec(cpuCodec, hwType)

Get hardware equivalent of CPU codec.

---

## Test It

```bash
npm run example:hardware
```

This will:

1. Detect your hardware
2. Show available codecs
3. Benchmark CPU vs GPU
4. Test different hardware types
5. Show hardware-aware recommendations
