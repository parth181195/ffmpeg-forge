# Audio Configuration

Reference for `AudioConfig` interface.

## Interface

```typescript
interface AudioConfig {
  // Codec
  codec?: AudioCodec | string;
  
  // Quality
  bitrate?: string;
  quality?: number;
  
  // Format
  frequency?: number | SampleRate;
  channels?: number | AudioChannels;
  
  // Profile (AAC)
  profile?: string | AACProfile;
  
  // Filters
  filters?: AudioFilters;
}
```

## Properties

### codec

**Type:** `AudioCodec | string`

Audio codec for encoding.

```typescript
enum AudioCodec {
  AAC = 'aac',
  AAC_FDK = 'libfdk_aac',
  MP3 = 'libmp3lame',
  OPUS = 'libopus',
  VORBIS = 'libvorbis',
  FLAC = 'flac',
  AC3 = 'ac3',
  DTS = 'dts',
  PCM_S16LE = 'pcm_s16le',
  COPY = 'copy',
}
```

**Examples:**

```typescript
{ codec: AudioCodec.AAC }
{ codec: AudioCodec.MP3 }
{ codec: AudioCodec.OPUS }
```

### bitrate

**Type:** `string`

Audio bitrate.

**Format:** `"<number>k"`

**Recommendations:**

| Codec | Use Case | Bitrate |
|-------|----------|---------|
| AAC | Low quality | 64k-96k |
| AAC | Standard | 128k-192k |
| AAC | High quality | 256k-320k |
| MP3 | Standard | 128k-192k |
| Opus | Speech | 32k-64k |
| Opus | Music | 96k-128k |
| FLAC | Lossless | - |

**Examples:**

```typescript
{ bitrate: '128k' }
{ bitrate: '192k' }
{ bitrate: '320k' }
```

### frequency

**Type:** `number | SampleRate`

Audio sample rate in Hz.

```typescript
enum SampleRate {
  HZ8000 = 8000,
  HZ11025 = 11025,
  HZ22050 = 22050,
  HZ44100 = 44100,
  HZ48000 = 48000,
  HZ96000 = 96000,
}
```

**Common values:**
- `44100` - CD quality
- `48000` - Professional audio/video (recommended)
- `96000` - High-resolution audio

**Examples:**

```typescript
{ frequency: 48000 }
{ frequency: SampleRate.HZ48000 }
```

### channels

**Type:** `number | AudioChannels`

Number of audio channels.

```typescript
enum AudioChannels {
  MONO = 1,
  STEREO = 2,
  SURROUND_5_1 = 6,
  SURROUND_7_1 = 8,
}
```

**Examples:**

```typescript
{ channels: 2 }
{ channels: AudioChannels.STEREO }
{ channels: AudioChannels.SURROUND_5_1 }
```

### profile

**Type:** `string | AACProfile`

AAC encoding profile.

```typescript
enum AACProfile {
  LC = 'aac_low',      // Low Complexity (default, recommended)
  HE = 'aac_he',       // High Efficiency
  HE_V2 = 'aac_he_v2', // HE-AAC v2
  LD = 'aac_ld',       // Low Delay
  ELD = 'aac_eld',     // Enhanced Low Delay
}
```

**Examples:**

```typescript
{ profile: AACProfile.LC }
{ profile: 'aac_low' }
```

### filters

**Type:** `AudioFilters`

Audio filters to apply.

```typescript
interface AudioFilters {
  volume?: VolumeFilter;
  denoise?: AudioDenoiseFilter;
  equalizer?: EqualizerFilter;
  tempo?: TempoFilter;
  pitch?: PitchFilter;
}
```

See [Filters Reference](/api/filters) for details.

## Examples

### Basic Audio

```typescript
{
  codec: AudioCodec.AAC,
  bitrate: '192k',
  frequency: 48000,
  channels: 2,
}
```

### High Quality

```typescript
{
  codec: AudioCodec.AAC,
  bitrate: '256k',
  frequency: 48000,
  channels: AudioChannels.STEREO,
  profile: AACProfile.LC,
}
```

### Extract Audio Only

```typescript
// In conversion config
{
  input: 'video.mp4',
  output: 'audio.mp3',
  removeVideo: true,
  audio: {
    codec: AudioCodec.MP3,
    bitrate: '192k',
  },
}
```

### With Volume Filter

```typescript
{
  codec: AudioCodec.AAC,
  bitrate: '192k',
  filters: {
    volume: { volume: 0.8 }, // 80% volume
  },
}
```

## See Also

- [Video Configuration](/api/video-config)
- [Filters Reference](/api/filters)
- [Enums](/api/enums)

