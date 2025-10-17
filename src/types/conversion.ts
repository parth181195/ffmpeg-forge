import type { VideoCodecValue, AudioCodecValue } from './codecs';
import type { OutputFormatValue } from './formats';
import type { HardwareAccelerationValue } from './hardware';

export interface ConversionSuggestion {
  currentFormat: string;
  currentVideoCodec: string;
  currentAudioCodec?: string;
  currentResolution: string;
  
  suggestedFormats: string[];
  suggestedVideoCodecs: {
    cpu: string[];
    gpu: string[];
  };
  suggestedAudioCodecs: string[];
  
  canTranscode: boolean;
  canRemux: boolean; // Can change container without re-encoding
}

export interface ConversionCompatibility {
  sourceFormat: string;
  targetFormat: string;
  sourceVideoCodec: string;
  targetVideoCodec: string;
  sourceAudioCodec?: string;
  targetAudioCodec?: string;
  
  compatible: boolean;
  requiresTranscode: boolean;
  canDirectCopy: boolean;
  estimatedQuality: 'lossless' | 'high' | 'medium' | 'low';
  warnings: string[];
}

export interface ConversionRecommendation {
  recommended: boolean;
  format: OutputFormatValue;
  videoCodec: VideoCodecValue;
  audioCodec?: AudioCodecValue;
  acceleration?: HardwareAccelerationValue;
  reason: string;
  alternatives: Array<{
    format: OutputFormatValue;
    videoCodec: VideoCodecValue;
    audioCodec?: AudioCodecValue;
    reason: string;
  }>;
}

