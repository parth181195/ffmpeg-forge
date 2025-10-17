import type { ConversionConfig } from '../types/conversion-config';
import { VideoCodec, AudioCodec } from '../types/codecs';
import { OutputFormat } from '../types/formats';
import { ScalingAlgorithm } from '../types/filters';

/**
 * Preset configurations for common use cases
 */
export const Presets = {
  /**
   * YouTube upload optimization
   */
  youtube: {
    name: 'YouTube Upload',
    description: 'Optimized for YouTube with high quality H.264',
    config: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        bitrate: '8M',
        preset: 'slow',
        profile: 'high',
        level: '4.2',
        pixelFormat: 'yuv420p',
        fps: 30,
        filters: {
          color: {
            contrast: 1.1,
            saturation: 1.05,
          },
        },
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '192k',
        channels: 2,
        frequency: 48000,
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Instagram post (1:1 square)
   */
  instagramPost: {
    name: 'Instagram Post',
    description: 'Square 1080x1080 for Instagram feed',
    config: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '1080x1080',
        bitrate: '5M',
        preset: 'medium',
        filters: {
          scale: {
            width: 1080,
            height: 1080,
            algorithm: ScalingAlgorithm.LANCZOS,
          },
        },
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
      },
      timing: {
        duration: 60,  // Max 60 seconds
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Instagram Story (9:16 portrait)
   */
  instagramStory: {
    name: 'Instagram Story',
    description: 'Portrait 1080x1920 for Instagram stories',
    config: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '1080x1920',
        bitrate: '4M',
        preset: 'medium',
        filters: {
          scale: {
            width: 1080,
            height: 1920,
            algorithm: ScalingAlgorithm.LANCZOS,
          },
        },
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
      },
      timing: {
        duration: 15,  // Max 15 seconds
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * TikTok optimization
   */
  tiktok: {
    name: 'TikTok',
    description: 'Optimized for TikTok upload',
    config: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '1080x1920',
        bitrate: '6M',
        fps: 30,
        preset: 'medium',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '192k',
        frequency: 44100,
      },
      timing: {
        duration: 60,
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Twitter/X video
   */
  twitter: {
    name: 'Twitter/X',
    description: 'Optimized for Twitter video',
    config: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        bitrate: '5M',
        preset: 'medium',
        profile: 'high',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
      },
      timing: {
        duration: 140,  // Max 2:20
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Web streaming (HLS)
   */
  webStreaming: {
    name: 'Web Streaming',
    description: 'Optimized for HLS web streaming',
    config: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        bitrate: '3M',
        preset: 'veryfast',
        profile: 'main',
        level: '4.0',
        keyframeInterval: 48,  // 2 seconds at 24fps
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
        frequency: 44100,
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * High quality archival
   */
  archive: {
    name: 'Archive Quality',
    description: 'High quality H.265 with lossless audio',
    config: {
      format: OutputFormat.MKV,
      video: {
        codec: VideoCodec.H265,
        quality: 18,  // CRF 18 (high quality)
        preset: 'slow',
        profile: 'main10',
      },
      audio: {
        codec: AudioCodec.FLAC,
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Maximum compression
   */
  smallFile: {
    name: 'Small File Size',
    description: 'Maximum compression with acceptable quality',
    config: {
      format: OutputFormat.WEBM,
      video: {
        codec: VideoCodec.VP9,
        quality: 35,  // Lower quality for smaller size
        preset: 'medium',
      },
      audio: {
        codec: AudioCodec.OPUS,
        bitrate: '96k',
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Audio extraction (no video)
   */
  audioOnly: {
    name: 'Audio Only',
    description: 'Extract audio to MP3',
    config: {
      format: OutputFormat.MP3,
      video: {
        disabled: true,
      },
      audio: {
        codec: AudioCodec.MP3,
        bitrate: '192k',
        frequency: 44100,
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Podcast audio
   */
  podcast: {
    name: 'Podcast',
    description: 'Optimized for podcast distribution',
    config: {
      format: OutputFormat.MP3,
      video: {
        disabled: true,
      },
      audio: {
        codec: AudioCodec.MP3,
        bitrate: '128k',
        channels: 2,
        frequency: 44100,
        volumeNormalization: true,
        filters: {
          denoise: {
            noise_reduction: 0.3,
          },
        },
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * GIF animation
   */
  gif: {
    name: 'GIF Animation',
    description: 'Convert video to GIF',
    config: {
      format: OutputFormat.GIF,
      video: {
        fps: 15,
        size: '480x?',  // Auto height
        filters: {
          scale: {
            width: 480,
            height: -1,
            algorithm: ScalingAlgorithm.LANCZOS,
          },
        },
      },
      audio: {
        disabled: true,
      },
      timing: {
        duration: 10,  // Short clips for GIF
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * 4K upscaling
   */
  upscale4K: {
    name: '4K Upscale',
    description: 'AI-enhanced upscaling to 4K',
    config: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H265,
        bitrate: '20M',
        preset: 'slow',
        upscale: {
          algorithm: ScalingAlgorithm.LANCZOS,
          targetWidth: 3840,
          targetHeight: 2160,
          enhanceSharpness: true,
          denoiseBeforeScale: true,
          sharpnessAmount: 1.5,
        },
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '256k',
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Mobile device compatibility
   */
  mobile: {
    name: 'Mobile Compatible',
    description: 'Maximum compatibility for mobile devices',
    config: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        bitrate: '2M',
        preset: 'medium',
        profile: 'baseline',
        level: '3.1',
        size: '1280x720',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
        frequency: 44100,
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * DVD quality
   */
  dvd: {
    name: 'DVD Quality',
    description: 'Standard DVD quality (NTSC)',
    config: {
      format: OutputFormat.MPEG,
      video: {
        codec: VideoCodec.MPEG2,
        bitrate: '6M',
        size: '720x480',
        fps: 29.97,
      },
      audio: {
        codec: AudioCodec.AC3,
        bitrate: '192k',
        channels: 2,
        frequency: 48000,
      },
    } as Partial<ConversionConfig>,
  },
};

/**
 * Get preset by name
 */
export function getPreset(name: keyof typeof Presets) {
  return Presets[name];
}

/**
 * List all available presets
 */
export function listPresets() {
  return Object.entries(Presets).map(([key, preset]) => ({
    key,
    name: preset.name,
    description: preset.description,
  }));
}

/**
 * Apply preset to base config
 */
export function applyPreset(
  baseConfig: Partial<ConversionConfig>,
  presetName: keyof typeof Presets
): ConversionConfig {
  const preset = Presets[presetName];
  
  return {
    ...preset.config,
    ...baseConfig,
    video: {
      ...preset.config.video,
      ...baseConfig.video,
    },
    audio: {
      ...preset.config.audio,
      ...baseConfig.audio,
    },
  } as ConversionConfig;
}

