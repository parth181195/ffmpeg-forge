# Types Reference

Common types and interfaces.

## InputSource

```typescript
type InputSource = string | Buffer | ReadStream;
```

Input can be a file path, Buffer, or readable stream.

**Examples:**

```typescript
// File path
const input: InputSource = 'video.mp4';

// Buffer
const buffer = fs.readFileSync('video.mp4');
const input: InputSource = buffer;

// Stream
const stream = fs.createReadStream('video.mp4');
const input: InputSource = stream;
```

## ProgressInfo

```typescript
interface ProgressInfo {
  frames: number;
  fps: number;
  quality: number;
  size: number;
  time: string;
  bitrate: string;
  speed: number;
  percent: number;
  timemark?: string;
}
```

Progress information during conversion.

**Example:**

```typescript
conversion.events.progress((progress) => {
  console.log(`${progress.percent}% complete`);
  console.log(`Speed: ${progress.speed}x`);
  console.log(`Time: ${progress.timemark}`);
});
```

## ConversionResult

```typescript
interface ConversionResult {
  promise: Promise<void>;
  events: ConversionEvents;
  cancel: () => void;
  getProgress: () => ProgressInfo | null;
}
```

Result from `convert()` method.

## ConversionEvents

```typescript
interface ConversionEvents {
  start: (callback: (command: string) => void) => void;
  progress: (callback: (progress: ProgressInfo) => void) => void;
  end: (callback: () => void) => void;
  error: (callback: (error: Error) => void) => void;
}
```

Event handlers for conversion.

## VideoMetadata

```typescript
interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
  frameRate: number;
  videoCodec: string;
  audioCodec: string | null;
  bitrate: number;
  videoBitrate: number;
  audioBitrate: number;
  format: string;
  hasAudio: boolean;
  hasVideo: boolean;
  pixelFormat: string;
}
```

Video metadata from `getVideoMetadata()`.

## See Also

- [FFmpeg Class](/api/ffmpeg-class)
- [Conversion Config](/api/conversion-config)

