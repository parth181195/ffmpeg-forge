# Filters Reference

Complete reference for video and audio filters.

## Video Filters

### ScaleFilter

Resize video.

```typescript
interface ScaleFilter {
  width?: number | string;
  height?: number | string;
  algorithm?: ScalingAlgorithm;
  force_original_aspect_ratio?: 'disable' | 'decrease' | 'increase';
  force_divisible_by?: number;
}
```

**Example:**

```typescript
filters: {
  scale: {
    width: 1920,
    height: 1080,
    algorithm: ScalingAlgorithm.LANCZOS,
  },
}
```

### CropFilter

Crop video to specific dimensions.

```typescript
interface CropFilter {
  width: number | string;
  height: number | string;
  x?: number | string;
  y?: number | string;
  keep_aspect?: boolean;
}
```

**Example:**

```typescript
filters: {
  crop: {
    width: 1920,
    height: 800,
    x: 0,
    y: 140,  // Crop letterboxing
  },
}
```

### TextFilter

Add text overlay.

```typescript
interface TextFilter {
  text: string;
  x?: string | number;
  y?: string | number;
  fontsize?: number | string;
  fontcolor?: string | Color;
  fontfile?: string;
  shadowcolor?: string | Color;
  shadowx?: number;
  shadowy?: number;
  box?: boolean;
  boxcolor?: string;
  borderw?: number;
}
```

**Example:**

```typescript
filters: {
  text: {
    text: '© 2024',
    x: '(w-tw)/2',
    y: 'h-th-50',
    fontsize: 24,
    fontcolor: Color.WHITE,
    shadowx: 2,
    shadowy: 2,
  },
}
```

### OverlayFilter

Add image watermark.

```typescript
interface WatermarkFilter {
  image: string;
  x?: number | string;
  y?: number | string;
  opacity?: number;
  scale?: number;
}
```

**Example:**

```typescript
filters: {
  overlay: {
    image: 'logo.png',
    x: 10,
    y: 10,
    opacity: 0.8,
  },
}
```

### FadeFilter

Fade in/out effect.

```typescript
interface FadeFilter {
  type: 'in' | 'out';
  startTime?: number;
  duration: number;
}
```

**Example:**

```typescript
filters: {
  fade: {
    type: 'in',
    startTime: 0,
    duration: 2,
  },
}
```

### RotateFilter

Rotate video.

```typescript
interface RotateFilter {
  angle?: number;      // Radians
  degrees?: number;    // Degrees
  fillcolor?: string | Color;
}
```

**Example:**

```typescript
filters: {
  rotate: {
    degrees: 90,
    fillcolor: Color.BLACK,
  },
}
```

### FlipFilter

Flip video horizontally or vertically.

```typescript
interface FlipFilter {
  horizontal?: boolean;
  vertical?: boolean;
}
```

**Example:**

```typescript
filters: {
  flip: {
    horizontal: true,
  },
}
```

## Audio Filters

### VolumeFilter

Adjust audio volume.

```typescript
interface VolumeFilter {
  volume: number | string;
  precision?: 'fixed' | 'float' | 'double';
}
```

**Example:**

```typescript
filters: {
  volume: {
    volume: 0.8,  // 80%
  },
}
```

### TempoFilter

Change playback speed.

```typescript
interface TempoFilter {
  tempo: number;  // 0.5-2.0
}
```

**Example:**

```typescript
filters: {
  tempo: {
    tempo: 1.5,  // 1.5x speed
  },
}
```

## See Also

- [Video Configuration](/api/video-config)
- [Audio Configuration](/api/audio-config)
- [Enums](/api/enums)

