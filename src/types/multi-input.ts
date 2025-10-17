import type { InputSource } from './input';
import type { VideoConfig, AudioConfig, ConversionConfig } from './conversion-config';
import type { FilterSpec } from './filters';

/**
 * Multiple input configuration
 */
export interface MultiInputConfig {
  inputs: MultiInput[];
  output: string | NodeJS.WritableStream;
  
  // Output settings
  video?: VideoConfig;
  audio?: AudioConfig;
  format?: string;
  
  // Complex filter graph for combining inputs
  filterGraph: FilterSpec[];
  
  // Map which streams to include
  streamMap?: StreamMapping[];
}

/**
 * Single input in multi-input configuration
 */
export interface MultiInput {
  source: InputSource;
  label?: string;              // Label for referencing in filters (e.g., 'main', 'overlay')
  
  // Stream selection
  videoStream?: number | false;  // Which video stream (0, 1, ...) or false to disable
  audioStream?: number | false;  // Which audio stream
  subtitleStream?: number | false;
  
  // Input-specific options
  seek?: string | number;
  duration?: string | number;
  
  // Hardware acceleration for this input
  hwaccel?: string;
}

/**
 * Stream mapping for output
 */
export interface StreamMapping {
  input: number | string;      // Input index or label
  stream: string;               // Stream specifier: 'v:0', 'a:0', etc.
  output?: number;              // Output file index (for multiple outputs)
}

/**
 * Multiple output configuration
 */
export interface MultiOutputConfig extends Omit<ConversionConfig, 'output'> {
  outputs: OutputSpec[];
}

/**
 * Single output specification
 */
export interface OutputSpec {
  path: string;
  video?: VideoConfig;
  audio?: AudioConfig;
  format?: string;
  streamMap?: string[];  // Which streams to include
}

/**
 * Picture-in-picture configuration
 */
export interface PictureInPictureConfig {
  main: InputSource;
  overlay: InputSource;
  output: string;
  
  // Overlay position
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  x?: number | string;  // Pixels or expression: 'main_w-overlay_w-10'
  y?: number | string;
  
  // Overlay size
  overlaySize?: string | { width: number; height: number };
  
  // Border
  border?: {
    width: number;
    color: string;
  };
  
  // Output settings
  video?: VideoConfig;
  audio?: 'main' | 'overlay' | 'both' | 'none';
}

/**
 * Side-by-side comparison configuration
 */
export interface SideBySideConfig {
  left: InputSource;
  right: InputSource;
  output: string;
  
  // Orientation
  orientation?: 'horizontal' | 'vertical';
  
  // Separator
  separator?: {
    width: number;
    color: string;
  };
  
  // Resize videos to match
  matchSize?: boolean;
  targetSize?: string;
  
  // Output settings
  video?: VideoConfig;
  audio?: 'left' | 'right' | 'both' | 'none';
}

