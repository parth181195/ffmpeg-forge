import type { InputSource } from './input';

/**
 * Thumbnail extraction configuration
 */
export interface ThumbnailConfig {
  input: InputSource;
  output: string;  // Output path (can use %d for sequence number)
  
  // Extraction strategy
  strategy: 'time' | 'count' | 'interval' | 'scene' | 'quality';
  
  // Time-based (extract at specific times)
  times?: (string | number)[];  // ['00:00:10', '00:01:00', 120]
  
  // Count-based (extract N thumbnails evenly distributed)
  count?: number;
  
  // Interval-based (extract every N seconds)
  interval?: number;  // Seconds between thumbnails
  
  // Scene-based (extract on scene changes)
  sceneThreshold?: number;  // 0.0 to 1.0 (sensitivity)
  
  // Quality-based (extract best quality frames)
  selectBestQuality?: boolean;
  
  // Thumbnail properties
  size?: string | { width: number; height: number };  // '320x240', { width: 320, height: 240 }
  format?: 'png' | 'jpg' | 'webp' | 'bmp';
  quality?: number;  // 1-31 (lower is better quality)
  
  // Advanced options
  skipFirst?: number;   // Skip first N seconds
  skipLast?: number;    // Skip last N seconds
  aspectRatio?: string; // '16:9', maintain aspect ratio
}

/**
 * Thumbnail extraction result
 */
export interface ThumbnailResult {
  files: string[];
  count: number;
  timestamps: number[];  // Seconds where thumbnails were extracted
}

/**
 * Trailer generation configuration
 */
export interface TrailerConfig {
  input: InputSource;
  output: string;
  
  // Segment strategy
  strategy: 'segments' | 'duration' | 'scenes' | 'highlights';
  
  // Segment count (extract N segments)
  segmentCount?: number;
  
  // Segment duration (each segment length)
  segmentDuration?: number;  // Seconds per segment
  
  // Total trailer length (will not exceed this)
  maxDuration: number;
  
  // Segment selection
  selection?: 'beginning' | 'middle' | 'end' | 'distributed' | 'best';
  
  // Scene-based (detect interesting scenes)
  sceneDetection?: {
    enabled: boolean;
    threshold?: number;  // 0.0 to 1.0
    minSceneDuration?: number;  // Minimum scene length in seconds
  };
  
  // Highlight detection (audio-based or motion-based)
  highlightDetection?: {
    enabled: boolean;
    audioLevel?: number;     // Detect loud moments
    motionLevel?: number;    // Detect high-motion scenes
  };
  
  // Transitions between segments
  transitions?: {
    enabled: boolean;
    type?: 'fade' | 'dissolve' | 'cut';
    duration?: number;  // Transition duration in seconds
  };
  
  // Audio handling
  audio?: {
    enabled: boolean;
    fadeInOut?: boolean;     // Fade audio at start/end of each segment
    normalize?: boolean;     // Normalize audio levels
    music?: string;          // Add background music track
    musicVolume?: number;    // 0.0 to 1.0
  };
  
  // Output quality
  video?: {
    codec?: string;
    bitrate?: string;
    size?: string;
    fps?: number;
  };
}

/**
 * Trailer generation result
 */
export interface TrailerResult {
  output: string;
  duration: number;
  segments: TrailerSegment[];
}

export interface TrailerSegment {
  startTime: number;    // Original video timestamp
  duration: number;     // Segment length
  score?: number;       // Quality/importance score (0-1)
  reason?: string;      // Why this segment was selected
}

