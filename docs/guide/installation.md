# Installation

## Install Package

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

## Install FFmpeg

ffmpeg-forge requires FFmpeg 4.0 or higher to be installed on your system.

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

### macOS

Using Homebrew:
```bash
brew install ffmpeg
```

### Windows

**Option 1: Chocolatey**
```bash
choco install ffmpeg
```

**Option 2: Manual**
1. Download from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add to PATH environment variable

### Docker

```dockerfile
FROM node:18
RUN apt-get update && apt-get install -y ffmpeg
COPY . .
RUN npm install
```

## Custom FFmpeg Path

If FFmpeg is not in your system PATH:

```typescript
import { FFmpeg } from 'ffmpeg-forge';

FFmpeg.setFFmpegPath('/custom/path/to/ffmpeg');
FFmpeg.setFFprobePath('/custom/path/to/ffprobe');

const ffmpeg = new FFmpeg();
```

## Verify Installation

```typescript
import { FFmpeg } from 'ffmpeg-forge';

const ffmpeg = new FFmpeg();

// Get FFmpeg version
const version = await ffmpeg.getVersion();
console.log(`FFmpeg ${version.version}`);

// Check capabilities
const capabilities = await ffmpeg.getCapabilities();
console.log(`Formats: ${capabilities.formats.muxing.length}`);
console.log(`Video codecs: ${capabilities.videoCodecs.encoders.length}`);
```

## Hardware Acceleration Setup

### NVIDIA (NVENC)

Install NVIDIA drivers and CUDA:
```bash
# Ubuntu
sudo apt install nvidia-driver-580 nvidia-cuda-toolkit
```

Verify:
```bash
nvidia-smi
```

### Intel (Quick Sync)

Install VAAPI drivers:
```bash
# Ubuntu
sudo apt install intel-media-va-driver
```

### AMD (AMF)

Install AMD drivers:
```bash
# Ubuntu
sudo apt install mesa-va-drivers
```

## Troubleshooting

### FFmpeg not found

If you get "FFmpeg not found" error:

1. Check FFmpeg is installed: `which ffmpeg`
2. Set custom path:
```typescript
FFmpeg.setFFmpegPath('/usr/local/bin/ffmpeg');
```

### Hardware acceleration not working

Check available hardware acceleration:
```typescript
const hwInfo = await ffmpeg.getHardwareAccelerationInfo();
console.log('Available:', hwInfo.available);
console.log('Types:', hwInfo.types);
```

## Next Steps

- [Quick Start](/guide/quick-start) - Common use cases
- [Filters Guide](/FILTERS) - Apply video and audio effects
- [Hardware Acceleration](/HARDWARE) - GPU encoding setup

