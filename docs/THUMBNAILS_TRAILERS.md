# Thumbnail Extraction & Trailer Generation Guide

## 📸 Thumbnail Extraction

Extract preview images from videos using various intelligent strategies.

### Strategies

| Strategy     | Description                     | Use Case                  |
| ------------ | ------------------------------- | ------------------------- |
| **time**     | Extract at specific timestamps  | Preview specific moments  |
| **count**    | N thumbnails evenly distributed | Video gallery/carousel    |
| **interval** | Extract every N seconds         | Timeline preview          |
| **scene**    | Extract on scene changes        | Automatic chapter markers |
| **quality**  | Extract best quality frames     | Hero images               |

---

### Examples

#### 1. Extract at Specific Times

```typescript
const result = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'thumbnails/thumb-%d.jpg',
  strategy: 'time',
  times: ['00:00:10', '00:01:00', 120], // String or number (seconds)
  size: '320x240',
  quality: 2, // 1-31 (lower = better quality)
});

console.log(`Extracted ${result.count} thumbnails`);
// Extracted 3 thumbnails

console.log(result.files);
// ['thumbnails/thumb-1.jpg', 'thumbnails/thumb-2.jpg', 'thumbnails/thumb-3.jpg']
```

#### 2. Evenly Distributed Thumbnails

```typescript
const result = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'gallery/img-%d.png',
  strategy: 'count',
  count: 10, // Extract 10 thumbnails
  size: '640x360',
  skipFirst: 5, // Skip first 5 seconds
  skipLast: 5, // Skip last 5 seconds
});

console.log(result.timestamps);
// [33.3, 61.7, 90.0, 118.3, 146.7, ...] - seconds where extracted
```

#### 3. Timeline Preview (Every N Seconds)

```typescript
const result = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'timeline/frame-%d.jpg',
  strategy: 'interval',
  interval: 30, // Every 30 seconds
  size: '160x90', // Small size for timeline
});

console.log(`Generated ${result.count} timeline thumbnails`);
```

#### 4. Scene-Based Extraction

```typescript
const result = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'scenes/scene-%d.jpg',
  strategy: 'scene',
  sceneThreshold: 0.3, // 0.0-1.0 (lower = more sensitive)
  size: '1280x720',
});

// Automatically detects scene changes and extracts thumbnails
```

#### 5. Best Quality Frames

```typescript
const result = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'best/img-%d.jpg',
  strategy: 'quality',
  count: 5, // Select 5 best frames
  size: '1920x1080', // Full HD
});

// Uses FFmpeg's thumbnail filter to select sharpest, clearest frames
```

---

## 🎞️ Trailer Generation

Create promotional trailers from longer videos with intelligent segment selection.

### Strategies

| Strategy       | Description                 | Best For                  |
| -------------- | --------------------------- | ------------------------- |
| **segments**   | Fixed number of segments    | Consistent preview length |
| **duration**   | Fill duration with segments | Time-constrained trailers |
| **scenes**     | Select interesting scenes   | Dynamic content           |
| **highlights** | High-motion/loud moments    | Action/music videos       |

### Selection Methods

| Selection       | Description                   |
| --------------- | ----------------------------- |
| **distributed** | Evenly across video (default) |
| **beginning**   | From start of video           |
| **middle**      | From middle section           |
| **end**         | From ending                   |
| **best**        | Highest quality/interest      |

---

### Examples

#### 1. Basic Trailer (3 Segments, 30 Seconds)

```typescript
const result = await ffmpeg.generateTrailer({
  input: 'full-video.mp4',
  output: 'trailer-30s.mp4',

  strategy: 'segments',
  segmentCount: 3,
  segmentDuration: 10, // 10 seconds per segment
  maxDuration: 30, // Total max 30 seconds

  selection: 'distributed', // Beginning, middle, end

  video: {
    codec: 'libx264',
    bitrate: '2M',
    size: '1280x720',
  },

  audio: {
    enabled: true,
    fadeInOut: true, // Fade audio at segment boundaries
    normalize: true, // Normalize audio levels
  },
});

console.log(`Trailer: ${result.duration}s`);
// Trailer: 30.0s

console.log(result.segments);
// [
//   { startTime: 45.0, duration: 10.0, reason: 'Distributed segment 1/3' },
//   { startTime: 90.0, duration: 10.0, reason: 'Distributed segment 2/3' },
//   { startTime: 135.0, duration: 10.0, reason: 'Distributed segment 3/3' }
// ]
```

#### 2. Duration-Based (Fit as Many Segments as Possible)

```typescript
const result = await ffmpeg.generateTrailer({
  input: 'video.mp4',
  output: 'trailer-60s.mp4',

  strategy: 'duration',
  segmentDuration: 5, // 5-second clips
  maxDuration: 60, // Max 60 seconds total

  // Automatically calculates: 60 / 5 = 12 segments

  selection: 'distributed',
});

// Creates 12 segments of 5 seconds each, distributed across video
```

#### 3. Beginning Teaser

```typescript
const result = await ffmpeg.generateTrailer({
  input: 'movie.mp4',
  output: 'teaser.mp4',

  strategy: 'segments',
  segmentCount: 4,
  segmentDuration: 5,
  maxDuration: 20,

  selection: 'beginning', // All from start
});

// Takes 4 clips from the beginning (0s, 6s, 12s, 18s)
```

#### 4. Scene-Based Trailer

```typescript
const result = await ffmpeg.generateTrailer({
  input: 'video.mp4',
  output: 'trailer-scenes.mp4',

  strategy: 'scenes',
  maxDuration: 60,
  segmentDuration: 10,

  sceneDetection: {
    enabled: true,
    threshold: 0.3, // Scene change sensitivity
    minSceneDuration: 3, // Minimum scene length
  },
});

// Automatically finds interesting scene changes
```

#### 5. With Background Music

```typescript
const result = await ffmpeg.generateTrailer({
  input: 'video.mp4',
  output: 'trailer-music.mp4',

  strategy: 'segments',
  segmentCount: 3,
  segmentDuration: 10,
  maxDuration: 30,

  audio: {
    enabled: true,
    music: 'background-music.mp3', // Add background music
    musicVolume: 0.3, // 30% volume for music
    fadeInOut: true,
  },
});

// Mixes original audio with background music
```

#### 6. With Transitions

```typescript
const result = await ffmpeg.generateTrailer({
  input: 'video.mp4',
  output: 'trailer-smooth.mp4',

  strategy: 'segments',
  segmentCount: 5,
  segmentDuration: 6,
  maxDuration: 30,

  transitions: {
    enabled: true,
    type: 'fade',
    duration: 0.5, // 0.5s fade between segments
  },
});

// Smooth fades between segments
```

#### 7. Social Media Trailer

```typescript
// Instagram Reel trailer (15s max)
const result = await ffmpeg.generateTrailer({
  input: 'long-video.mp4',
  output: 'instagram-reel.mp4',

  strategy: 'duration',
  segmentDuration: 3, // 3-second clips
  maxDuration: 15, // Instagram limit

  selection: 'distributed',

  video: {
    codec: 'libx264',
    size: '1080x1920', // Portrait
    bitrate: '4M',
  },

  audio: {
    enabled: true,
    normalize: true,
  },
});
```

#### 8. YouTube Trailer

```typescript
const result = await ffmpeg.generateTrailer({
  input: 'full-video.mp4',
  output: 'youtube-trailer.mp4',

  strategy: 'segments',
  segmentCount: 6,
  segmentDuration: 10,
  maxDuration: 60,

  selection: 'distributed',

  video: {
    codec: 'libx264',
    bitrate: '8M',
    size: '1920x1080',
    fps: 30,
  },

  audio: {
    enabled: true,
    normalize: true,
    fadeInOut: true,
  },

  transitions: {
    enabled: true,
    type: 'fade',
    duration: 0.3,
  },
});
```

---

## 🎯 Common Use Cases

### Video Gallery Thumbnails

```typescript
// Generate 12 thumbnails for a grid
const result = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'gallery/thumb-%d.jpg',
  strategy: 'count',
  count: 12,
  size: '320x180',
  quality: 3,
  skipFirst: 2,
  skipLast: 2,
});
```

### Video Player Timeline

```typescript
// Timeline scrubbing preview (every 10 seconds)
const result = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'timeline/frame-%d.jpg',
  strategy: 'interval',
  interval: 10,
  size: '160x90',
});
```

### Social Media Preview Trailer

```typescript
// 15-second Instagram preview
const result = await ffmpeg.generateTrailer({
  input: 'long-video.mp4',
  output: 'preview-15s.mp4',
  strategy: 'duration',
  segmentDuration: 3,
  maxDuration: 15,
  selection: 'distributed',
  video: {
    codec: 'libx264',
    size: '1080x1080', // Square for Instagram
  },
});
```

### Movie Trailer

```typescript
// 90-second movie trailer with music
const result = await ffmpeg.generateTrailer({
  input: 'full-movie.mp4',
  output: 'official-trailer.mp4',
  strategy: 'scenes',
  maxDuration: 90,
  segmentDuration: 6,
  sceneDetection: {
    enabled: true,
    threshold: 0.4,
    minSceneDuration: 4,
  },
  audio: {
    enabled: true,
    music: 'epic-music.mp3',
    musicVolume: 0.4,
    fadeInOut: true,
  },
  transitions: {
    enabled: true,
    type: 'fade',
    duration: 0.5,
  },
});
```

---

## ⚙️ Configuration Reference

### ThumbnailConfig

```typescript
interface ThumbnailConfig {
  input: string | Buffer | ReadStream;
  output: string; // Use %d for sequence number

  strategy: 'time' | 'count' | 'interval' | 'scene' | 'quality';

  // Strategy-specific
  times?: (string | number)[]; // For 'time'
  count?: number; // For 'count' or 'quality'
  interval?: number; // For 'interval'
  sceneThreshold?: number; // For 'scene' (0.0-1.0)

  // Output settings
  size?: string | { width: number; height: number };
  format?: 'png' | 'jpg' | 'webp' | 'bmp';
  quality?: number; // 1-31 (lower is better)

  // Advanced
  skipFirst?: number; // Skip first N seconds
  skipLast?: number; // Skip last N seconds
}
```

### TrailerConfig

```typescript
interface TrailerConfig {
  input: string | Buffer | ReadStream;
  output: string;

  strategy: 'segments' | 'duration' | 'scenes' | 'highlights';

  // Segment configuration
  segmentCount?: number; // Number of segments
  segmentDuration?: number; // Length of each segment
  maxDuration: number; // Total max length (REQUIRED)

  // Selection method
  selection?: 'beginning' | 'middle' | 'end' | 'distributed' | 'best';

  // Scene detection
  sceneDetection?: {
    enabled: boolean;
    threshold?: number;
    minSceneDuration?: number;
  };

  // Transitions
  transitions?: {
    enabled: boolean;
    type?: 'fade' | 'dissolve' | 'cut';
    duration?: number;
  };

  // Audio
  audio?: {
    enabled: boolean;
    fadeInOut?: boolean;
    normalize?: boolean;
    music?: string; // Background music path
    musicVolume?: number; // 0.0-1.0
  };

  // Output quality
  video?: {
    codec?: string;
    bitrate?: string;
    size?: string;
    fps?: number;
  };
}
```

---

## 💡 Best Practices

### Thumbnails

**For Video Players:**

```typescript
// Timeline preview - every 10s
interval: 10;
size: '160x90';
quality: 5;
```

**For Galleries:**

```typescript
// 12 thumbnails in grid
count: 12;
size: '320x180';
quality: 2;
skipFirst: 2;
skipLast: 2;
```

**For Hero Images:**

```typescript
// Best quality single frame
strategy: 'quality';
count: 1;
size: '1920x1080';
quality: 1;
```

### Trailers

**Social Media:**

```typescript
maxDuration: 15; // Instagram/TikTok
segmentDuration: 3; // Short, punchy clips
selection: 'distributed'; // Show variety
```

**YouTube:**

```typescript
maxDuration: 60; // Standard trailer length
segmentDuration: 6 - 10; // Substantial clips
transitions: enabled; // Professional feel
```

**Preview/Teaser:**

```typescript
maxDuration: 30;
segmentCount: 3;
selection: 'beginning'; // Hook viewers
```

---

## 🎨 Advanced Examples

### Smart Video Gallery

```typescript
// Extract thumbnails + metadata
const thumbnails = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'gallery/thumb-%d.jpg',
  strategy: 'count',
  count: 12,
  size: '480x270',
});

const metadata = await ffmpeg.getVideoMetadata('video.mp4');

// Create gallery data
const gallery = thumbnails.files.map((file, i) => ({
  thumbnail: file,
  timestamp: thumbnails.timestamps[i],
  timecode: formatTime(thumbnails.timestamps[i]),
  title: `Scene ${i + 1}`,
}));
```

### Multi-Resolution Thumbnails

```typescript
const sizes = [
  { name: 'small', size: '160x90' },
  { name: 'medium', size: '320x180' },
  { name: 'large', size: '640x360' },
  { name: 'xlarge', size: '1280x720' },
];

for (const { name, size } of sizes) {
  await ffmpeg.extractThumbnails({
    input: 'video.mp4',
    output: `thumbs/${name}/%d.jpg`,
    strategy: 'count',
    count: 10,
    size,
  });
}
```

### Adaptive Trailer (Based on Video Length)

```typescript
const metadata = await ffmpeg.getVideoMetadata('video.mp4');
const duration = metadata.duration;

let trailerDuration: number;
let segmentCount: number;

if (duration < 60) {
  // Short video: 10-second trailer
  trailerDuration = 10;
  segmentCount = 2;
} else if (duration < 300) {
  // Medium video: 30-second trailer
  trailerDuration = 30;
  segmentCount = 3;
} else {
  // Long video: 60-second trailer
  trailerDuration = 60;
  segmentCount = 6;
}

const result = await ffmpeg.generateTrailer({
  input: 'video.mp4',
  output: 'trailer.mp4',
  strategy: 'segments',
  segmentCount,
  segmentDuration: Math.floor(trailerDuration / segmentCount),
  maxDuration: trailerDuration,
  selection: 'distributed',
});
```

### Chapter Markers from Scenes

```typescript
const thumbnails = await ffmpeg.extractThumbnails({
  input: 'video.mp4',
  output: 'chapters/chapter-%d.jpg',
  strategy: 'scene',
  sceneThreshold: 0.4,
  size: '640x360',
});

// Use timestamps for chapter markers
const chapters = thumbnails.timestamps.map((time, i) => ({
  time,
  title: `Chapter ${i + 1}`,
  thumbnail: thumbnails.files[i],
}));
```

---

## 📊 Results

### Thumbnail Results

```typescript
interface ThumbnailResult {
  files: string[]; // Generated file paths
  count: number; // Number of thumbnails
  timestamps: number[]; // Extraction times in seconds
}
```

### Trailer Results

```typescript
interface TrailerResult {
  output: string; // Output file path
  duration: number; // Total trailer duration
  segments: TrailerSegment[]; // Segment information
}

interface TrailerSegment {
  startTime: number; // Position in original video
  duration: number; // Segment length
  score?: number; // Quality score (0-1)
  reason?: string; // Selection reason
}
```

---

## 🎬 Output Examples

```
Thumbnails:
  time-1.jpg: 45K
  time-2.jpg: 48K
  time-3.jpg: 52K

Trailers:
  trailer-15s.mp4: 2.9M
  trailer-30s.mp4: 7.4M
  trailer-60s.mp4: 13M
```

---

## 🚀 Performance

**Thumbnail Extraction:**

- Time-based: Very fast (~0.1s per thumbnail)
- Scene-based: Slower (analyzes entire video)
- Quality-based: Slowest (compares all frames)

**Trailer Generation:**

- Segment extraction: ~0.5s per segment
- Concatenation: ~1-2s
- Total: Depends on segment count and transcoding

**Tips for Speed:**

- Use `codec: 'copy'` if no quality changes needed
- Use hardware acceleration for transcoding
- Limit segment count for faster generation
- Use smaller output sizes for faster processing

---

## Test It

```bash
npm run example:thumbnails
```

This will:

1. Extract thumbnails using all strategies
2. Generate trailers with different configurations
3. Show file sizes and durations
4. Demonstrate all features
