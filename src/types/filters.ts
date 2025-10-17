/**
 * Video and Audio Filter Types
 */

import type { Color } from './enums';

// Common scaling algorithms
export enum ScalingAlgorithm {
  FAST_BILINEAR = 'fast_bilinear',
  BILINEAR = 'bilinear',
  BICUBIC = 'bicubic',
  EXPERIMENTAL = 'experimental',
  NEIGHBOR = 'neighbor',
  AREA = 'area',
  BICUBLIN = 'bicublin',
  GAUSS = 'gauss',
  SINC = 'sinc',
  LANCZOS = 'lanczos',
  SPLINE = 'spline',
}

export type ScalingAlgorithmValue = ScalingAlgorithm | string;

// Deinterlace methods
export enum DeinterlaceMode {
  YADIF = 'yadif',
  BWDIF = 'bwdif',
  W3FDIF = 'w3fdif',
}

export type DeinterlaceModeValue = DeinterlaceMode | string;

// Denoise filter types
export enum DenoiseFilterType {
  HQDN3D = 'hqdn3d',
  NLMEANS = 'nlmeans',
  ATADENOISE = 'atadenoise',
  VAGUEDENOISER = 'vaguedenoiser',
}

export type DenoiseFilterValue = DenoiseFilterType | string;

// Video filter interfaces
export interface ScaleFilter {
  width?: number | string; // 1920, '1920', 'iw*2', '-1' (auto)
  height?: number | string; // 1080, '1080', 'ih*2', '-1' (auto)
  algorithm?: ScalingAlgorithmValue;
  force_original_aspect_ratio?: 'disable' | 'decrease' | 'increase';
  force_divisible_by?: number; // Force dimensions divisible by N (e.g., 2)
}

export interface CropFilter {
  width: number | string;
  height: number | string;
  x?: number | string; // X position (default: center)
  y?: number | string; // Y position (default: center)
}

export interface PadFilter {
  width: number | string;
  height: number | string;
  x?: number | string; // X position
  y?: number | string; // Y position
  color?: string | Color; // 'black', Color.BLACK, '#FF0000'
}

export interface DeinterlaceFilter {
  mode?: DeinterlaceModeValue;
  parity?: 'tff' | 'bff' | 'auto'; // Top field first, bottom field first, auto
  deint?: 'all' | 'interlaced';
}

export interface VideoDenoiseFilter {
  filter?: DenoiseFilterValue;
  luma_spatial?: number; // Spatial luma strength (0-10)
  chroma_spatial?: number; // Spatial chroma strength (0-10)
  luma_tmp?: number; // Temporal luma strength (0-10)
  chroma_tmp?: number; // Temporal chroma strength (0-10)
}

export interface SharpenFilter {
  luma_msize_x?: number; // Luma matrix horizontal size (3-23)
  luma_msize_y?: number; // Luma matrix vertical size (3-23)
  luma_amount?: number; // Luma effect strength (-2 to 5)
  chroma_msize_x?: number;
  chroma_msize_y?: number;
  chroma_amount?: number;
}

export interface ColorFilter {
  brightness?: number; // -1 to 1
  contrast?: number; // -1000 to 1000
  saturation?: number; // 0 to 3
  gamma?: number; // 0.1 to 10
  gamma_r?: number; // Red gamma
  gamma_g?: number; // Green gamma
  gamma_b?: number; // Blue gamma
}

export interface RotateFilter {
  angle: number | string; // Angle in radians or degrees
  fillcolor?: string | Color; // Background color: 'black', Color.BLACK, '#FF0000'
  bilinear?: boolean; // Use bilinear interpolation
}

export interface FlipFilter {
  horizontal?: boolean; // Flip horizontally (hflip)
  vertical?: boolean; // Flip vertically (vflip)
}

export interface WatermarkFilter {
  input: string; // Path to watermark image
  x?: number | string; // X position: 10, 'main_w-overlay_w-10'
  y?: number | string; // Y position: 10, 'main_h-overlay_h-10'
  opacity?: number; // 0.0 to 1.0
  enable?: string; // Time expression, e.g., 'between(t,10,20)'
}

export interface TextFilter {
  text: string;
  fontfile?: string;
  fontsize?: number;
  fontcolor?: string | Color; // Font color: 'white', Color.WHITE, '#FFFFFF'
  x?: number | string;
  y?: number | string;
  shadowcolor?: string | Color; // Shadow color
  shadowx?: number;
  shadowy?: number;
  borderw?: number;
  bordercolor?: string | Color; // Border color
}

export interface FadeFilter {
  type: 'in' | 'out';
  start_frame?: number;
  nb_frames?: number;
  start_time?: number;
  duration?: number;
  color?: string;
}

// Audio filter interfaces
export interface VolumeFilter {
  volume: number | string; // 0.5, '10dB', '0.5'
  precision?: 'fixed' | 'float' | 'double';
}

export interface AudioDenoiseFilter {
  noise_reduction?: number; // 0.01 to 1
  noise_type?: 'white' | 'vinyl' | 'shellac' | 'hiss';
}

export interface EqualizerFilter {
  frequency: number; // Center frequency in Hz
  width_type?: 'h' | 'q' | 'o' | 's';
  width?: number;
  gain?: number; // Gain in dB
}

export interface TempoFilter {
  tempo: number; // 0.5 to 2.0 (playback speed)
}

export interface PitchFilter {
  pitch: number; // Semitones to shift (-12 to 12)
}

// Complex filter specifications
export interface FilterSpec {
  inputs?: string[];
  filter: string;
  options?: Record<string, any>;
  outputs?: string[];
}

// Combined video filters configuration
export interface VideoFilters {
  // Scaling and resizing
  scale?: ScaleFilter;

  // Cropping and padding
  crop?: CropFilter;
  pad?: PadFilter;

  // Quality enhancement
  deinterlace?: DeinterlaceFilter;
  denoise?: VideoDenoiseFilter;
  sharpen?: SharpenFilter;

  // Color adjustments
  color?: ColorFilter;

  // Transformations
  rotate?: RotateFilter;
  flip?: FlipFilter;

  // Overlays
  watermark?: WatermarkFilter;
  text?: TextFilter;

  // Effects
  fade?: FadeFilter;

  // Custom filters (raw FFmpeg filter strings)
  custom?: string[];
}

// Combined audio filters configuration
export interface AudioFilters {
  // Volume
  volume?: VolumeFilter;

  // Noise reduction
  denoise?: AudioDenoiseFilter;

  // Equalizer
  equalizer?: EqualizerFilter[];

  // Tempo and pitch
  tempo?: TempoFilter;
  pitch?: PitchFilter;

  // Custom filters (raw FFmpeg filter strings)
  custom?: string[];
}

// Complex filter graph
export interface FilterGraph {
  video?: VideoFilters;
  audio?: AudioFilters;
  complex?: FilterSpec[]; // For advanced multi-input/output filters
}

// Upscaling-specific options
export interface UpscalingOptions {
  algorithm: ScalingAlgorithmValue;
  targetWidth: number;
  targetHeight: number;
  enhanceSharpness?: boolean; // Apply unsharp filter after upscaling
  denoiseBeforeScale?: boolean; // Denoise before upscaling
  sharpnessAmount?: number; // 0-5 (for unsharp filter)
}

// Downscaling-specific options
export interface DownscalingOptions {
  algorithm: ScalingAlgorithmValue;
  targetWidth: number;
  targetHeight: number;
  deinterlace?: boolean; // Deinterlace before downscaling
  preserveDetails?: boolean; // Use better algorithm for detail preservation
}
