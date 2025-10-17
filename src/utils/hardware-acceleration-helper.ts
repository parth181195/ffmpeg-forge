import { HardwareAcceleration, type HardwareAccelerationValue } from '../types/hardware';
import { VideoCodec, type VideoCodecValue } from '../types/codecs';
import { execSync } from 'child_process';

/**
 * Hardware-accelerated codec mapping
 */
export const HARDWARE_CODEC_MAP: Record<string, Record<string, string>> = {
  // NVIDIA NVENC
  [HardwareAcceleration.NVIDIA]: {
    'h264': VideoCodec.H264_NVENC,
    'libx264': VideoCodec.H264_NVENC,
    'h265': VideoCodec.HEVC_NVENC,
    'libx265': VideoCodec.HEVC_NVENC,
    'hevc': VideoCodec.HEVC_NVENC,
    'av1': VideoCodec.AV1_NVENC,
  },
  'nvenc': {
    'h264': VideoCodec.H264_NVENC,
    'libx264': VideoCodec.H264_NVENC,
    'h265': VideoCodec.HEVC_NVENC,
    'libx265': VideoCodec.HEVC_NVENC,
    'hevc': VideoCodec.HEVC_NVENC,
    'av1': VideoCodec.AV1_NVENC,
  },
  'cuda': {
    'h264': VideoCodec.H264_NVENC,
    'libx264': VideoCodec.H264_NVENC,
    'h265': VideoCodec.HEVC_NVENC,
    'libx265': VideoCodec.HEVC_NVENC,
    'hevc': VideoCodec.HEVC_NVENC,
    'av1': VideoCodec.AV1_NVENC,
  },
  
  // Intel Quick Sync
  [HardwareAcceleration.INTEL]: {
    'h264': VideoCodec.H264_QSV,
    'libx264': VideoCodec.H264_QSV,
    'h265': VideoCodec.HEVC_QSV,
    'libx265': VideoCodec.HEVC_QSV,
    'hevc': VideoCodec.HEVC_QSV,
    'av1': VideoCodec.AV1_QSV,
    'vp9': 'vp9_qsv',
  },
  'qsv': {
    'h264': VideoCodec.H264_QSV,
    'libx264': VideoCodec.H264_QSV,
    'h265': VideoCodec.HEVC_QSV,
    'libx265': VideoCodec.HEVC_QSV,
    'hevc': VideoCodec.HEVC_QSV,
    'av1': VideoCodec.AV1_QSV,
    'vp9': 'vp9_qsv',
  },
  
  // AMD AMF
  [HardwareAcceleration.AMD]: {
    'h264': VideoCodec.H264_AMF,
    'libx264': VideoCodec.H264_AMF,
    'h265': VideoCodec.HEVC_AMF,
    'libx265': VideoCodec.HEVC_AMF,
    'hevc': VideoCodec.HEVC_AMF,
  },
  'amf': {
    'h264': VideoCodec.H264_AMF,
    'libx264': VideoCodec.H264_AMF,
    'h265': VideoCodec.HEVC_AMF,
    'libx265': VideoCodec.HEVC_AMF,
    'hevc': VideoCodec.HEVC_AMF,
  },
  
  // VAAPI (Linux)
  [HardwareAcceleration.VAAPI]: {
    'h264': VideoCodec.H264_VAAPI,
    'libx264': VideoCodec.H264_VAAPI,
    'h265': VideoCodec.HEVC_VAAPI,
    'libx265': VideoCodec.HEVC_VAAPI,
    'hevc': VideoCodec.HEVC_VAAPI,
    'vp8': VideoCodec.VP8_VAAPI,
    'vp9': VideoCodec.VP9_VAAPI,
    'av1': VideoCodec.AV1_VAAPI,
  },
  
  // VideoToolbox (macOS)
  [HardwareAcceleration.VIDEOTOOLBOX]: {
    'h264': VideoCodec.H264_VIDEOTOOLBOX,
    'libx264': VideoCodec.H264_VIDEOTOOLBOX,
    'h265': VideoCodec.HEVC_VIDEOTOOLBOX,
    'libx265': VideoCodec.HEVC_VIDEOTOOLBOX,
    'hevc': VideoCodec.HEVC_VIDEOTOOLBOX,
  },
};

/**
 * Detect available hardware acceleration
 */
export function detectHardwareAcceleration(ffmpegPath: string = 'ffmpeg'): HardwareAccelerationValue[] {
  try {
    const output = execSync(`${ffmpegPath} -hide_banner -hwaccels`, { encoding: 'utf-8' });
    const lines = output.split('\n');
    
    const available: HardwareAccelerationValue[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed === 'cuda' || trimmed.includes('nvenc')) {
        if (!available.includes(HardwareAcceleration.NVIDIA)) {
          available.push(HardwareAcceleration.NVIDIA);
        }
      } else if (trimmed === 'qsv') {
        available.push(HardwareAcceleration.INTEL);
      } else if (trimmed === 'amf' || trimmed === 'd3d11va') {
        if (!available.includes(HardwareAcceleration.AMD)) {
          available.push(HardwareAcceleration.AMD);
        }
      } else if (trimmed === 'vaapi') {
        available.push(HardwareAcceleration.VAAPI);
      } else if (trimmed === 'videotoolbox') {
        available.push(HardwareAcceleration.VIDEOTOOLBOX);
      } else if (trimmed === 'dxva2') {
        // Windows DirectX acceleration
        available.push('dxva2' as HardwareAccelerationValue);
      }
    }
    
    return available;
  } catch {
    return [];
  }
}

/**
 * Get hardware-accelerated codec for a given CPU codec
 */
export function getHardwareCodec(
  cpuCodec: VideoCodecValue,
  acceleration: HardwareAccelerationValue
): VideoCodecValue | null {
  const codecMap = HARDWARE_CODEC_MAP[acceleration];
  if (!codecMap) return null;
  
  // Normalize codec name
  const normalizedCodec = cpuCodec.toLowerCase().replace('lib', '');
  
  return codecMap[normalizedCodec] || codecMap[cpuCodec] || null;
}

/**
 * Check if hardware acceleration is available
 */
export function isHardwareAccelerationAvailable(
  acceleration: HardwareAccelerationValue,
  ffmpegPath: string = 'ffmpeg'
): boolean {
  const available = detectHardwareAcceleration(ffmpegPath);
  return available.includes(acceleration);
}

/**
 * Get best available hardware acceleration for current system
 */
export function getBestHardwareAcceleration(ffmpegPath: string = 'ffmpeg'): HardwareAccelerationValue | null {
  const available = detectHardwareAcceleration(ffmpegPath);
  
  if (available.length === 0) {
    return null;
  }
  
  // Priority order: NVIDIA > INTEL > AMD > VAAPI > VideoToolbox
  const priority = [
    HardwareAcceleration.NVIDIA,
    HardwareAcceleration.INTEL,
    HardwareAcceleration.AMD,
    HardwareAcceleration.VAAPI,
    HardwareAcceleration.VIDEOTOOLBOX,
  ];
  
  for (const hwAccel of priority) {
    if (available.includes(hwAccel)) {
      return hwAccel;
    }
  }
  
  return available[0];
}

/**
 * Auto-select hardware acceleration and codec
 */
export function autoSelectHardwareEncoding(
  desiredCodec: VideoCodecValue,
  ffmpegPath: string = 'ffmpeg'
): {
  codec: VideoCodecValue;
  acceleration?: HardwareAccelerationValue;
  ffmpegHwaccel?: string;  // Actual FFmpeg hwaccel flag value
  isHardware: boolean;
} {
  // Map acceleration types to FFmpeg hwaccel names
  const hwaccelMap: Record<string, string> = {
    [HardwareAcceleration.NVIDIA]: 'cuda',
    [HardwareAcceleration.INTEL]: 'qsv',
    [HardwareAcceleration.AMD]: 'amf',
    [HardwareAcceleration.VAAPI]: 'vaapi',
    [HardwareAcceleration.VIDEOTOOLBOX]: 'videotoolbox',
    [HardwareAcceleration.V4L2]: 'v4l2m2m',
  };
  
  // Try to find best hardware acceleration
  const hwAccel = getBestHardwareAcceleration(ffmpegPath);
  
  if (!hwAccel) {
    // No hardware acceleration available
    return {
      codec: desiredCodec,
      isHardware: false,
    };
  }
  
  // Get hardware-accelerated version of codec
  const hwCodec = getHardwareCodec(desiredCodec, hwAccel);
  
  if (hwCodec) {
    return {
      codec: hwCodec,
      acceleration: hwAccel,
      ffmpegHwaccel: hwaccelMap[hwAccel] || hwAccel,
      isHardware: true,
    };
  }
  
  // Hardware acceleration available but codec not supported
  return {
    codec: desiredCodec,
    isHardware: false,
  };
}

/**
 * Get hardware acceleration info for display
 */
export function getHardwareAccelerationInfo(ffmpegPath: string = 'ffmpeg'): {
  available: HardwareAccelerationValue[];
  best: HardwareAccelerationValue | null;
  capabilities: Record<HardwareAccelerationValue, string[]>;
} {
  const available = detectHardwareAcceleration(ffmpegPath);
  const best = getBestHardwareAcceleration(ffmpegPath);
  const capabilities: Record<string, string[]> = {};
  
  // Get codecs for each hardware acceleration
  available.forEach(hwAccel => {
    capabilities[hwAccel] = Object.values(HARDWARE_CODEC_MAP[hwAccel] || {});
  });
  
  return {
    available,
    best,
    capabilities: capabilities as Record<HardwareAccelerationValue, string[]>,
  };
}

