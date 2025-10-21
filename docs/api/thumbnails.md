# Thumbnails & Screenshots

API reference for media extraction features.

## extractScreenshot

Extract a single screenshot from video.

```typescript
async extractScreenshot(config: ScreenshotConfig): Promise<string>
```

**Config:**

```typescript
interface ScreenshotConfig {
  input: InputSource;
  output: string;
  timestamp: number | string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'png' | 'jpg' | 'webp';
}
```

**Example:**

```typescript
await ffmpeg.extractScreenshot({
  input: 'video.mp4',
  output: 'screenshot.png',
  timestamp: 10,  // 10 seconds
  width: 1920,
  height: 1080,
});
```

## extractScreenshots

Extract multiple screenshots from video.

```typescript
async extractScreenshots(config: ScreenshotsConfig): Promise<ScreenshotResult>
```

**Config:**

```typescript
interface ScreenshotsConfig {
  input: InputSource;
  outputDir: string;
  outputPattern?: string;  // e.g., 'screenshot-%03d.png'
  interval?: number;       // Extract every N seconds
  count?: number;          // Extract N screenshots total
  format?: 'png' | 'jpg' | 'webp';
  width?: number;
  height?: number;
}
```

**Example:**

```typescript
// Every 5 seconds
await ffmpeg.extractScreenshots({
  input: 'video.mp4',
  outputDir: './screenshots',
  interval: 5,
  format: 'png',
});

// Exactly 10 screenshots
await ffmpeg.extractScreenshots({
  input: 'video.mp4',
  outputDir: './screenshots',
  count: 10,
  format: 'jpg',
});
```

## extractThumbnails

Generate thumbnails from video.

```typescript
async extractThumbnails(config: ThumbnailConfig): Promise<ThumbnailResult>
```

**Config:**

```typescript
interface ThumbnailConfig {
  input: InputSource;
  outputDir: string;
  count?: number;
  width?: number;
  height?: number;
  format?: 'png' | 'jpg' | 'webp';
  quality?: number;
}
```

**Example:**

```typescript
await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  outputDir: './thumbnails',
  count: 5,
  width: 320,
  height: 180,
  format: 'jpg',
});
```

## See Also

- [FFmpeg Class](/api/ffmpeg-class)
- [Complete Guide](/THUMBNAILS_TRAILERS)

