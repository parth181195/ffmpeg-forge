import type { ConversionConfig } from '../types/conversion-config';
import { VideoCodec, AudioCodec } from '../types/codecs';
import { OutputFormat } from '../types/formats';

/**
 * Preset configurations for common use cases
 * Usage: import { presets } from 'ffmpeg-forge';
 *        ffmpeg.convert({ ...presets.youtube.hd1080, input: 'in.mp4', output: 'out.mp4' })
 */
export const presets = {
  /**
   * Web-optimized presets
   */
  web: {
    /** 1080p HD for web streaming */
    hd: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '1920x1080',
        bitrate: '5M',
        preset: 'medium',
        profile: 'high',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
      },
    } as Partial<ConversionConfig>,

    /** 720p SD for web */
    sd: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '1280x720',
        bitrate: '3M',
        preset: 'medium',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '96k',
      },
    } as Partial<ConversionConfig>,

    /** Mobile optimized */
    mobile: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '854x480',
        bitrate: '1.5M',
        preset: 'medium',
        profile: 'baseline',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '64k',
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * YouTube upload presets
   */
  youtube: {
    /** 1080p HD for YouTube */
    hd1080: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '1920x1080',
        bitrate: '8M',
        preset: 'slow',
        profile: 'high',
        level: '4.2',
        pixelFormat: 'yuv420p',
        fps: 30,
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '192k',
        channels: 2,
        frequency: 48000,
      },
    } as Partial<ConversionConfig>,

    /** 720p HD for YouTube */
    hd720: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '1280x720',
        bitrate: '5M',
        preset: 'medium',
        profile: 'high',
        level: '4.0',
        fps: 30,
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
        frequency: 48000,
      },
    } as Partial<ConversionConfig>,

    /** 4K UHD for YouTube */
    uhd4k: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '3840x2160',
        bitrate: '45M',
        preset: 'slow',
        profile: 'high',
        level: '5.2',
        fps: 30,
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '192k',
        frequency: 48000,
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Instagram presets
   */
  instagram: {
    /** Square feed post (1:1) */
    feed: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '1080x1080',
        bitrate: '5M',
        preset: 'medium',
        fps: 30,
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
      },
    } as Partial<ConversionConfig>,

    /** Vertical story (9:16) */
    story: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        size: '1080x1920',
        bitrate: '4M',
        preset: 'medium',
        fps: 30,
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * TikTok preset (vertical video)
   */
  tiktok: {
    format: OutputFormat.MP4,
    video: {
      codec: VideoCodec.H264,
      size: '1080x1920',
      bitrate: '6M',
      preset: 'medium',
      fps: 30,
    },
    audio: {
      codec: AudioCodec.AAC,
      bitrate: '192k',
      frequency: 44100,
    },
  } as Partial<ConversionConfig>,

  /**
   * Quality-focused presets
   */
  quality: {
    /** Ultra high quality */
    high: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H265,
        quality: 18,
        preset: 'slow',
        profile: 'main',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '256k',
      },
    } as Partial<ConversionConfig>,

    /** Medium quality */
    medium: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        quality: 23,
        preset: 'medium',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
      },
    } as Partial<ConversionConfig>,

    /** Lower quality for smaller files */
    low: {
      format: OutputFormat.MP4,
      video: {
        codec: VideoCodec.H264,
        quality: 28,
        preset: 'fast',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '96k',
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * Size-optimized presets
   */
  size: {
    /** Very small file size */
    small: {
      format: OutputFormat.WEBM,
      video: {
        codec: VideoCodec.VP9,
        quality: 35,
        preset: 'medium',
      },
      audio: {
        codec: AudioCodec.OPUS,
        bitrate: '96k',
      },
    } as Partial<ConversionConfig>,

    /** Extremely small file size */
    tiny: {
      format: OutputFormat.WEBM,
      video: {
        codec: VideoCodec.VP9,
        quality: 40,
        size: '640x360',
        fps: 24,
      },
      audio: {
        codec: AudioCodec.OPUS,
        bitrate: '64k',
      },
    } as Partial<ConversionConfig>,
  },

  /**
   * DVD quality (legacy format)
   */
  dvd: {
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
};

// Export legacy Presets for backward compatibility
export const Presets = presets;

/**
 * Get preset by path
 * @example getPreset('youtube', 'hd1080')
 * @example getPreset('web', 'mobile')
 */
export function getPreset(category: string, name: string): Partial<ConversionConfig> | undefined {
  const cat = presets[category as keyof typeof presets];
  if (!cat) return undefined;
  
  if (typeof cat === 'object' && 'format' in cat) {
    return cat as Partial<ConversionConfig>;
  }
  
  return cat[name as keyof typeof cat] as Partial<ConversionConfig>;
}

/**
 * List all available presets
 */
export function listPresets() {
  const result: Array<{ category: string; name: string; config: Partial<ConversionConfig> }> = [];
  
  for (const [category, value] of Object.entries(presets)) {
    if (typeof value === 'object' && 'format' in value) {
      result.push({ category, name: category, config: value as Partial<ConversionConfig> });
    } else {
      for (const [name, config] of Object.entries(value)) {
        result.push({ category, name, config: config as Partial<ConversionConfig> });
      }
    }
  }
  
  return result;
}
