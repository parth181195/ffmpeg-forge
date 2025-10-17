import type { InputSource } from './input';
import type { VideoFilters } from './filters';

/**
 * Screenshot extraction configuration
 */
export interface ScreenshotConfig {
  input: InputSource;
  output: string | string[]; // Single file or array for multiple

  // Extraction time(s)
  time?: string | number; // Single screenshot: '00:01:30' or 90
  times?: (string | number)[]; // Multiple screenshots

  // Or frame number
  frame?: number; // Extract specific frame number

  // Screenshot properties
  size?: string | { width: number; height: number };
  format?: 'png' | 'jpg' | 'jpeg' | 'webp' | 'bmp' | 'tiff';
  quality?: number; // 1-31 (lower = better quality)

  // Filters to apply
  filters?: VideoFilters;

  // Advanced
  aspectRatio?: string;
  keepAspectRatio?: boolean;
}

/**
 * Multiple screenshot configuration
 */
export interface ScreenshotsConfig {
  input: InputSource;
  folder?: string; // Output folder (default: current directory)
  filename?: string; // Pattern: 'screenshot-%i.jpg' (%i = index)

  // Extraction strategy
  count?: number; // Number of screenshots
  timestamps?: (string | number)[]; // Specific times
  interval?: number; // Every N seconds

  // Screenshot properties
  size?: string | { width: number; height: number };
  format?: 'png' | 'jpg' | 'jpeg' | 'webp' | 'bmp';
  quality?: number;

  // Filters
  filters?: VideoFilters;
}

/**
 * Screenshot extraction result
 */
export interface ScreenshotResult {
  files: string[];
  count: number;
  timestamps?: number[];
}
