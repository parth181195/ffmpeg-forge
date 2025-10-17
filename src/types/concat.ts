import type { InputSource } from './input';
import type { VideoConfig, AudioConfig } from './conversion-config';
import type { FilterSpec } from './filters';

/**
 * Video concatenation configuration
 */
export interface ConcatenationConfig {
  inputs: InputSource[] | ConcatInput[];
  output: string;

  // Concatenation method
  method?: 'concat' | 'complex'; // 'concat' = simple join, 'complex' = with re-encoding

  // If inputs have different properties, normalize them
  normalize?: {
    enabled: boolean;
    video?: VideoConfig; // Target video settings
    audio?: AudioConfig; // Target audio settings
  };

  // Transitions between clips
  transitions?: {
    enabled: boolean;
    type: 'crossfade' | 'fade' | 'wipe' | 'slide';
    duration: number; // Seconds
  };

  // Audio handling
  audio?: {
    enabled: boolean;
    normalize?: boolean; // Normalize audio across all inputs
    fadeInOut?: boolean; // Fade at boundaries
  };
}

/**
 * Detailed input specification for concatenation
 */
export interface ConcatInput {
  source: InputSource;
  trim?: {
    start?: number | string;
    end?: number | string;
    duration?: number | string;
  };
  filters?: FilterSpec[];
}

/**
 * Video merge configuration (multiple inputs -> single output)
 */
export interface MergeConfig {
  inputs: MergeInput[];
  output: string;

  // Output settings
  video?: VideoConfig;
  audio?: AudioConfig;

  // Complex filter graph for merging
  filterGraph?: FilterSpec[];
}

/**
 * Input specification for merging
 */
export interface MergeInput {
  source: InputSource;
  type: 'video' | 'audio' | 'subtitle' | 'data';
  label?: string; // For referencing in filters
  streams?: string[]; // Specific streams to use: ['v:0', 'a:0']
}

/**
 * Concatenation result
 */
export interface ConcatenationResult {
  output: string;
  duration: number;
  inputCount: number;
}
