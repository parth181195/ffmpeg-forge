import type {
  ConversionSuggestion,
  ConversionCompatibility,
  ConversionRecommendation,
} from '../types/conversion';
import type { VideoMetadata } from '../types/metadata';
import { VideoCodec, AudioCodec } from '../types/codecs';
import { OutputFormat } from '../types/formats';

/**
 * Format compatibility matrix
 * Maps source format to compatible target formats
 */
const FORMAT_COMPATIBILITY: Record<string, string[]> = {
  mp4: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'ogv'],
  webm: ['webm', 'mp4', 'mkv', 'ogv'],
  mkv: ['mkv', 'mp4', 'webm', 'avi', 'mov'],
  matroska: ['mkv', 'mp4', 'webm', 'avi', 'mov'],
  avi: ['avi', 'mp4', 'mkv', 'mov'],
  mov: ['mov', 'mp4', 'mkv', 'webm'],
  flv: ['flv', 'mp4', 'mkv'],
  ogv: ['ogv', 'webm', 'mkv'],
};

/**
 * Codec compatibility for direct copy (remuxing without transcoding)
 */
export const CODEC_CONTAINER_COMPATIBILITY: Record<string, string[]> = {
  h264: ['mp4', 'mkv', 'mov', 'avi', 'flv', 'ts', 'm4v'],
  hevc: ['mp4', 'mkv', 'mov', 'ts'],
  vp8: ['webm', 'mkv'],
  vp9: ['webm', 'mkv'],
  av1: ['webm', 'mkv', 'mp4'],
  mpeg4: ['mp4', 'avi', 'mkv', '3gp'],
  aac: ['mp4', 'mov', 'mkv', 'flv', 'm4a'],
  opus: ['webm', 'mkv', 'ogg'],
  vorbis: ['webm', 'mkv', 'ogg'],
  mp3: ['mp3', 'mp4', 'mkv', 'avi'],
};

/**
 * Generate conversion suggestions based on video metadata
 */
export function generateConversionSuggestions(
  metadata: VideoMetadata,
  availableFormats: { muxing: string[] },
  availableCodecs: {
    video: { encoders: string[] };
    audio: { encoders: string[] };
  }
): ConversionSuggestion {
  const currentFormat = metadata.format.formatName.split(',')[0];
  const currentVideoCodec = metadata.videoCodec;
  const currentAudioCodec = metadata.audioCodec;
  const currentResolution = `${metadata.width}x${metadata.height}`;

  // Get compatible formats based on current format
  const baseCompatibleFormats =
    FORMAT_COMPATIBILITY[currentFormat] || Object.keys(FORMAT_COMPATIBILITY);
  const suggestedFormats = baseCompatibleFormats.filter(fmt =>
    availableFormats.muxing.includes(fmt)
  );

  // Suggest video codecs (split by CPU/GPU)
  const cpuCodecs = availableCodecs.video.encoders.filter(
    codec =>
      !codec.includes('_nvenc') &&
      !codec.includes('_qsv') &&
      !codec.includes('_amf') &&
      !codec.includes('_vaapi') &&
      !codec.includes('_v4l2m2m') &&
      !codec.includes('_videotoolbox')
  );

  const gpuCodecs = availableCodecs.video.encoders.filter(
    codec =>
      codec.includes('_nvenc') ||
      codec.includes('_qsv') ||
      codec.includes('_amf') ||
      codec.includes('_vaapi') ||
      codec.includes('_videotoolbox')
  );

  // Suggest audio codecs
  const suggestedAudioCodecs = availableCodecs.audio.encoders.filter(codec =>
    ['aac', 'libmp3lame', 'libopus', 'libvorbis', 'flac', 'ac3'].some(common =>
      codec.includes(common)
    )
  );

  // Check if transcoding is possible
  const canTranscode = cpuCodecs.length > 0 || gpuCodecs.length > 0;

  // Check if remuxing is possible (changing container without re-encoding)
  const codecContainers = CODEC_CONTAINER_COMPATIBILITY[currentVideoCodec] || [];
  const canRemux = codecContainers.some(fmt => availableFormats.muxing.includes(fmt));

  return {
    currentFormat,
    currentVideoCodec,
    currentAudioCodec,
    currentResolution,
    suggestedFormats,
    suggestedVideoCodecs: {
      cpu: cpuCodecs,
      gpu: gpuCodecs,
    },
    suggestedAudioCodecs,
    canTranscode,
    canRemux,
  };
}

/**
 * Check compatibility between source and target configuration
 */
export function checkConversionCompatibility(
  sourceVideoCodec: string,
  sourceAudioCodec: string | undefined,
  sourceFormat: string,
  targetVideoCodec: string,
  targetAudioCodec: string | undefined,
  targetFormat: string
): ConversionCompatibility {
  const warnings: string[] = [];
  let estimatedQuality: 'lossless' | 'high' | 'medium' | 'low' = 'high';

  // Check if direct copy is possible (no transcoding needed)
  const videoCodecMatch = sourceVideoCodec === targetVideoCodec || targetVideoCodec === 'copy';
  const audioCodecMatch = sourceAudioCodec === targetAudioCodec || targetAudioCodec === 'copy';
  const canDirectCopy = videoCodecMatch && audioCodecMatch;

  // Determine if transcoding is required
  const requiresTranscode = !canDirectCopy;

  // Check format compatibility
  const formatCompatible = FORMAT_COMPATIBILITY[sourceFormat]?.includes(targetFormat) ?? true;

  // Estimate quality
  if (canDirectCopy) {
    estimatedQuality = 'lossless';
  } else if (targetVideoCodec.includes('ffv1') || targetVideoCodec.includes('copy')) {
    estimatedQuality = 'lossless';
  } else if (
    targetVideoCodec.includes('264') ||
    targetVideoCodec.includes('265') ||
    targetVideoCodec.includes('vp9')
  ) {
    estimatedQuality = 'high';
  } else if (targetVideoCodec.includes('vp8') || targetVideoCodec.includes('mpeg4')) {
    estimatedQuality = 'medium';
  } else {
    estimatedQuality = 'medium';
  }

  // Add warnings
  if (requiresTranscode) {
    warnings.push('Transcoding required - may lose quality');
  }

  if (!formatCompatible) {
    warnings.push('Format combination may have compatibility issues');
  }

  if (sourceVideoCodec.includes('hevc') && targetFormat === 'avi') {
    warnings.push('HEVC to AVI conversion may have limited support');
  }

  if (targetAudioCodec && sourceAudioCodec && !audioCodecMatch) {
    warnings.push('Audio will be re-encoded');
  }

  return {
    sourceFormat,
    targetFormat,
    sourceVideoCodec,
    targetVideoCodec,
    sourceAudioCodec,
    targetAudioCodec,
    compatible: true, // Most conversions are technically possible
    requiresTranscode,
    canDirectCopy,
    estimatedQuality,
    warnings,
  };
}

/**
 * Get recommended conversion settings based on use case
 */
export function getConversionRecommendation(
  _metadata: VideoMetadata,
  useCase: 'web' | 'mobile' | 'quality' | 'size' | 'compatibility' = 'web'
): ConversionRecommendation {
  switch (useCase) {
    case 'web':
      // Optimize for web playback
      return {
        recommended: true,
        format: OutputFormat.MP4,
        videoCodec: VideoCodec.H264,
        audioCodec: AudioCodec.AAC,
        reason: 'Best browser compatibility and streaming support',
        alternatives: [
          {
            format: OutputFormat.WEBM,
            videoCodec: VideoCodec.VP9,
            audioCodec: AudioCodec.OPUS,
            reason: 'Modern browsers, better compression',
          },
          {
            format: OutputFormat.MP4,
            videoCodec: VideoCodec.H265,
            audioCodec: AudioCodec.AAC,
            reason: 'Better quality/size ratio, requires modern browsers',
          },
        ],
      };

    case 'mobile':
      // Optimize for mobile devices
      return {
        recommended: true,
        format: OutputFormat.MP4,
        videoCodec: VideoCodec.H264,
        audioCodec: AudioCodec.AAC,
        reason: 'Universal mobile device support',
        alternatives: [
          {
            format: OutputFormat.MP4,
            videoCodec: VideoCodec.H264_VIDEOTOOLBOX,
            audioCodec: AudioCodec.AAC,
            reason: 'Hardware acceleration on iOS devices',
          },
        ],
      };

    case 'quality':
      // Optimize for quality
      return {
        recommended: true,
        format: OutputFormat.MKV,
        videoCodec: VideoCodec.H265,
        audioCodec: AudioCodec.FLAC,
        reason: 'Best quality with efficient compression',
        alternatives: [
          {
            format: OutputFormat.MP4,
            videoCodec: VideoCodec.H265,
            audioCodec: AudioCodec.AAC,
            reason: 'High quality with better compatibility',
          },
          {
            format: OutputFormat.WEBM,
            videoCodec: VideoCodec.VP9,
            audioCodec: AudioCodec.OPUS,
            reason: 'Excellent quality, open format',
          },
        ],
      };

    case 'size':
      // Optimize for file size
      return {
        recommended: true,
        format: OutputFormat.WEBM,
        videoCodec: VideoCodec.VP9,
        audioCodec: AudioCodec.OPUS,
        reason: 'Best compression efficiency',
        alternatives: [
          {
            format: OutputFormat.MP4,
            videoCodec: VideoCodec.H265,
            audioCodec: AudioCodec.AAC,
            reason: 'Excellent compression, better compatibility',
          },
        ],
      };

    case 'compatibility':
      // Maximum compatibility
      return {
        recommended: true,
        format: OutputFormat.MP4,
        videoCodec: VideoCodec.H264,
        audioCodec: AudioCodec.AAC,
        reason: 'Works everywhere - maximum compatibility',
        alternatives: [
          {
            format: OutputFormat.AVI,
            videoCodec: VideoCodec.MPEG4,
            audioCodec: AudioCodec.MP3,
            reason: 'Legacy system support',
          },
        ],
      };

    default:
      return {
        recommended: true,
        format: OutputFormat.MP4,
        videoCodec: VideoCodec.H264,
        audioCodec: AudioCodec.AAC,
        reason: 'General purpose - good balance',
        alternatives: [],
      };
  }
}
