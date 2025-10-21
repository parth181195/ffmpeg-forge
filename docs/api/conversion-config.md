# Conversion Configuration

Complete reference for `ConversionConfig` interface.

## Interface

```typescript
interface ConversionConfig {
  // Required
  input: InputSource;
  output: string;
  
  // Format
  format?: OutputFormat | string;
  
  // Streams
  video?: VideoConfig;
  audio?: AudioConfig;
  
  // Timing
  startTime?: number | string;
  duration?: number | string;
  endTime?: number | string;
  
  // Options
  overwrite?: boolean;
  metadata?: Record<string, string>;
  frameCount?: number;
  loop?: number;
  
  // Stream removal
  removeVideo?: boolean;
  removeAudio?: boolean;
  
  // Advanced
  customArgs?: string[];
  
  // Callbacks (deprecated - use events instead)
  onProgress?: (progress: ProgressInfo) => void;
  onStart?: (command: string) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}
```

---

## Properties

### input

**Type:** `InputSource` (string | Buffer | ReadStream)

**Required:** Yes

Input source for conversion.

**Supported types:**
- **File path** (string): Path to local file
- **Buffer**: In-memory buffer
- **ReadStream**: Node.js readable stream

**Examples:**

```typescript
// File path
{ input: '/path/to/video.mp4' }

// Relative path
{ input: './video.mp4' }

// Buffer
const buffer = fs.readFileSync('video.mp4');
{ input: buffer }

// Stream
const stream = fs.createReadStream('video.mp4');
{ input: stream }
```

---

### output

**Type:** `string`

**Required:** Yes

Output file path.

**Examples:**

```typescript
{ output: 'output.mp4' }
{ output: '/tmp/converted.webm' }
{ output: '../results/video.mkv' }
```

**Note:** Directory must exist. Use `fs.mkdirSync(dirname, { recursive: true })` to create.

---

### format

**Type:** `OutputFormat | string`

**Required:** No (auto-detected from output extension)

Output container format.

**Available formats:**

```typescript
enum OutputFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  MKV = 'matroska',
  AVI = 'avi',
  MOV = 'mov',
  FLV = 'flv',
  MPEG = 'mpeg',
  OGG = 'ogg',
  MP3 = 'mp3',
  WAV = 'wav',
  FLAC = 'flac',
  GIF = 'gif',
}
```

**Examples:**

```typescript
// Auto-detect from extension
{ output: 'video.mp4' } // format = 'mp4'

// Explicit format
{ output: 'video.mp4', format: OutputFormat.MP4 }

// Override extension
{ output: 'video.mkv', format: OutputFormat.WEBM }

// Custom format string
{ format: '3gp' }
```

---

### video

**Type:** `VideoConfig`

**Required:** No

Video stream configuration. See [Video Configuration](/api/video-config).

**Examples:**

```typescript
// Basic
{ video: { codec: VideoCodec.H264, bitrate: '2M' } }

// Advanced
{
  video: {
    codec: VideoCodec.H264_NVENC,
    bitrate: '5M',
    size: '1920x1080',
    fps: 30,
    preset: VideoPreset.SLOW,
    filters: {
      scale: { width: 1920, height: 1080 },
      text: { text: 'Watermark', x: 10, y: 10 },
    },
  },
}
```

---

### audio

**Type:** `AudioConfig`

**Required:** No

Audio stream configuration. See [Audio Configuration](/api/audio-config).

**Examples:**

```typescript
// Basic
{ audio: { codec: AudioCodec.AAC, bitrate: '192k' } }

// Advanced
{
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '192k',
    frequency: 48000,
    channels: AudioChannels.STEREO,
    filters: {
      volume: { volume: 0.8 },
    },
  },
}
```

---

### startTime

**Type:** `number | string`

**Required:** No

Start time for trimming input.

**Formats:**
- **Number**: Seconds (e.g., `30` = 30 seconds)
- **String**: `"HH:MM:SS"` or `"HH:MM:SS.ms"` format

**Examples:**

```typescript
// Start at 30 seconds
{ startTime: 30 }

// Start at 1 minute 30 seconds
{ startTime: '00:01:30' }

// Start at 1:30.500 (1.5 minutes)
{ startTime: '00:01:30.500' }
```

---

### duration

**Type:** `number | string`

**Required:** No

Duration of output (after startTime).

**Formats:**
- **Number**: Seconds
- **String**: `"HH:MM:SS"` format

**Examples:**

```typescript
// 10 seconds duration
{ duration: 10 }

// 5 minutes duration
{ duration: '00:05:00' }

// Trim: from 30s to 40s
{
  startTime: 30,
  duration: 10,
}

// Trim: from 1:00 to 1:30
{
  startTime: '00:01:00',
  duration: '00:00:30',
}
```

---

### endTime

**Type:** `number | string`

**Required:** No

End time for trimming input (alternative to duration).

**Examples:**

```typescript
// From start to 1 minute
{ endTime: 60 }

// From 30s to 90s
{
  startTime: 30,
  endTime: 90,
}

// Last 10 seconds (requires getting duration first)
const metadata = await ffmpeg.getVideoMetadata('video.mp4');
{
  startTime: metadata.duration - 10,
  endTime: metadata.duration,
}
```

**Note:** Cannot use both `duration` and `endTime`.

---

### overwrite

**Type:** `boolean`

**Default:** `true`

Whether to overwrite output file if it exists.

**Examples:**

```typescript
// Overwrite (default)
{ overwrite: true }

// Don't overwrite (will throw error if exists)
{ overwrite: false }
```

---

### metadata

**Type:** `Record<string, string>`

**Required:** No

Custom metadata tags for output file.

**Examples:**

```typescript
{
  metadata: {
    title: 'My Video',
    artist: 'John Doe',
    comment: 'Created with ffmpeg-forge',
    copyright: '© 2024',
  },
}
```

---

### frameCount

**Type:** `number`

**Required:** No

Limit output to specific number of frames.

**Examples:**

```typescript
// Output only 100 frames
{ frameCount: 100 }

// Create thumbnail (1 frame)
{
  frameCount: 1,
  video: { codec: VideoCodec.MJPEG },
}
```

---

### loop

**Type:** `number`

**Required:** No

Loop input file N times.

**Examples:**

```typescript
// Loop 3 times
{ loop: 3 }

// Infinite loop (for streaming)
{ loop: -1 }
```

---

### removeVideo

**Type:** `boolean`

**Default:** `false`

Remove video stream (audio-only output).

**Examples:**

```typescript
// Extract audio from video
{
  input: 'video.mp4',
  output: 'audio.mp3',
  removeVideo: true,
  audio: { codec: AudioCodec.MP3, bitrate: '192k' },
}
```

---

### removeAudio

**Type:** `boolean`

**Default:** `false`

Remove audio stream (video-only output).

**Examples:**

```typescript
// Silent video
{
  input: 'video.mp4',
  output: 'silent.mp4',
  removeAudio: true,
  video: { codec: VideoCodec.H264 },
}
```

---

### customArgs

**Type:** `string[]`

**Required:** No

Additional custom FFmpeg arguments.

**Examples:**

```typescript
{
  customArgs: [
    '-threads', '4',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
  ],
}
```

**Warning:** Use with caution. May conflict with other options.

---

## Event Handlers (Deprecated)

Use `conversion.events` instead of these callbacks.

### onProgress

**Type:** `(progress: ProgressInfo) => void`

**Deprecated:** Use `conversion.events.progress()` instead.

---

### onStart

**Type:** `(command: string) => void`

**Deprecated:** Use `conversion.events.start()` instead.

---

### onEnd

**Type:** `() => void`

**Deprecated:** Use `conversion.events.end()` instead.

---

### onError

**Type:** `(error: Error) => void`

**Deprecated:** Use `conversion.events.error()` instead.

---

## Complete Examples

### Basic Conversion

```typescript
const conversion = ffmpeg.convert({
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

await conversion.promise;
```

---

### Trim Video

```typescript
await ffmpeg.convert({
  input: 'long-video.mp4',
  output: 'clip.mp4',
  startTime: '00:01:30',
  duration: '00:00:30',
  video: { codec: VideoCodec.COPY }, // No re-encode
  audio: { codec: AudioCodec.COPY },
}).promise;
```

---

### Hardware Acceleration

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264_NVENC, // NVIDIA GPU
    bitrate: '5M',
    preset: VideoPreset.SLOW,
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '192k',
  },
}).promise;
```

---

### Extract Audio

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'audio.mp3',
  removeVideo: true,
  audio: {
    codec: AudioCodec.MP3,
    bitrate: '192k',
  },
}).promise;
```

---

### Add Watermark

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'watermarked.mp4',
  video: {
    codec: VideoCodec.H264,
    bitrate: '5M',
    filters: {
      text: {
        text: '© 2024 My Company',
        x: '(w-tw)/2',
        y: 'h-th-50',
        fontsize: 24,
        fontcolor: 'white',
        shadowcolor: 'black',
        shadowx: 2,
        shadowy: 2,
      },
    },
  },
  audio: {
    codec: AudioCodec.COPY,
  },
}).promise;
```

---

### Multiple Filters

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'processed.mp4',
  video: {
    codec: VideoCodec.H264,
    bitrate: '3M',
    filters: {
      scale: { width: 1920, height: 1080 },
      crop: { width: 1920, height: 800, x: 0, y: 140 },
      text: { text: 'Title', x: 10, y: 10 },
      fade: { type: 'in', duration: 2 },
    },
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '192k',
    filters: {
      volume: { volume: 0.8 },
    },
  },
}).promise;
```

---

### With Metadata

```typescript
await ffmpeg.convert({
  input: 'video.mp4',
  output: 'video-with-metadata.mp4',
  video: { codec: VideoCodec.COPY },
  audio: { codec: AudioCodec.COPY },
  metadata: {
    title: 'My Awesome Video',
    artist: 'John Doe',
    album: '2024 Collection',
    year: '2024',
    comment: 'Created with ffmpeg-forge',
  },
}).promise;
```

---

### Buffer Output

```typescript
const conversion = ffmpeg.convertToBuffer({
  input: 'video.mp4',
  format: OutputFormat.MP4,
  video: {
    codec: VideoCodec.H264,
    size: '640x480',
    bitrate: '1M',
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '128k',
  },
});

const buffer = await conversion.promise;
// Upload to S3, etc.
```

---

## See Also

- [Video Configuration](/api/video-config)
- [Audio Configuration](/api/audio-config)
- [Filters](/api/filters)
- [Enums](/api/enums)
- [FFmpeg Class](/api/ffmpeg-class)

