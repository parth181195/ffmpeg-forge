/**
 * Video encoding presets (speed vs quality)
 */
export enum VideoPreset {
  ULTRAFAST = 'ultrafast',
  SUPERFAST = 'superfast',
  VERYFAST = 'veryfast',
  FASTER = 'faster',
  FAST = 'fast',
  MEDIUM = 'medium',
  SLOW = 'slow',
  SLOWER = 'slower',
  VERYSLOW = 'veryslow',
}

/**
 * H.264/H.265 encoding profiles
 */
export enum VideoProfile {
  // H.264 profiles
  BASELINE = 'baseline',
  MAIN = 'main',
  HIGH = 'high',
  HIGH10 = 'high10',
  HIGH422 = 'high422',
  HIGH444 = 'high444',
}

/**
 * H.264/H.265 encoding levels
 */
export enum VideoLevel {
  LEVEL_3_0 = '3.0',
  LEVEL_3_1 = '3.1',
  LEVEL_3_2 = '3.2',
  LEVEL_4_0 = '4.0',
  LEVEL_4_1 = '4.1',
  LEVEL_4_2 = '4.2',
  LEVEL_5_0 = '5.0',
  LEVEL_5_1 = '5.1',
  LEVEL_5_2 = '5.2',
}

/**
 * Pixel formats
 */
export enum PixelFormat {
  YUV420P = 'yuv420p',
  YUV422P = 'yuv422p',
  YUV444P = 'yuv444p',
  YUV420P10LE = 'yuv420p10le',
  YUV422P10LE = 'yuv422p10le',
  YUV444P10LE = 'yuv444p10le',
  RGB24 = 'rgb24',
  BGR24 = 'bgr24',
  RGBA = 'rgba',
  BGRA = 'bgra',
  GRAY = 'gray',
  GRAY16LE = 'gray16le',
  NV12 = 'nv12',
  NV21 = 'nv21',
}

/**
 * AAC encoding profiles
 */
export enum AACProfile {
  AAC_LOW = 'aac_low',
  AAC_HE = 'aac_he',
  AAC_HE_V2 = 'aac_he_v2',
  AAC_LD = 'aac_ld',
  AAC_ELD = 'aac_eld',
}

/**
 * Common aspect ratios
 */
export enum AspectRatio {
  RATIO_16_9 = '16:9',
  RATIO_4_3 = '4:3',
  RATIO_21_9 = '21:9',
  RATIO_1_1 = '1:1',
  RATIO_9_16 = '9:16', // Vertical (Instagram Stories, TikTok)
  RATIO_3_2 = '3:2',
  RATIO_5_4 = '5:4',
}

/**
 * Common colors for filters
 */
export enum Color {
  BLACK = 'black',
  WHITE = 'white',
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  YELLOW = 'yellow',
  CYAN = 'cyan',
  MAGENTA = 'magenta',
  TRANSPARENT = 'transparent',
}

/**
 * Video quality presets
 */
export enum QualityPreset {
  ULTRA = 'ultra', // Highest quality, largest file
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low', // Lowest quality, smallest file
}

/**
 * Common resolutions
 */
export enum Resolution {
  // SD
  SD_480P = '854x480',
  SD_576P = '1024x576',
  
  // HD
  HD_720P = '1280x720',
  HD_1080P = '1920x1080',
  
  // 2K
  QHD = '2560x1440',
  
  // 4K
  UHD_4K = '3840x2160',
  DCI_4K = '4096x2160',
  
  // 8K
  UHD_8K = '7680x4320',
  
  // Mobile/Social
  INSTAGRAM_SQUARE = '1080x1080',
  INSTAGRAM_STORY = '1080x1920',
  TIKTOK = '1080x1920',
  YOUTUBE_SHORTS = '1080x1920',
}

/**
 * Frame rates
 */
export enum FrameRate {
  FPS_23_976 = 23.976,
  FPS_24 = 24,
  FPS_25 = 25,
  FPS_29_97 = 29.97,
  FPS_30 = 30,
  FPS_50 = 50,
  FPS_59_94 = 59.94,
  FPS_60 = 60,
  FPS_120 = 120,
}

/**
 * Audio sample rates (Hz)
 */
export enum SampleRate {
  RATE_8000 = 8000,
  RATE_11025 = 11025,
  RATE_16000 = 16000,
  RATE_22050 = 22050,
  RATE_32000 = 32000,
  RATE_44100 = 44100,
  RATE_48000 = 48000,
  RATE_88200 = 88200,
  RATE_96000 = 96000,
  RATE_192000 = 192000,
}

/**
 * Audio channels
 */
export enum AudioChannels {
  MONO = 1,
  STEREO = 2,
  SURROUND_2_1 = 3,
  SURROUND_4_0 = 4,
  SURROUND_5_0 = 5,
  SURROUND_5_1 = 6,
  SURROUND_7_1 = 8,
}

