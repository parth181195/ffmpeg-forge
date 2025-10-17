import {
  GPU_CODEC_PATTERNS,
  HardwareAcceleration,
  type HardwareAccelerationValue,
} from '../types/hardware';

/**
 * Check if a codec uses GPU acceleration
 */
export function isGPUCodec(codec: string): boolean {
  return Object.values(GPU_CODEC_PATTERNS)
    .flat()
    .some(pattern => codec.includes(pattern));
}

/**
 * Check if a codec uses CPU
 */
export function isCPUCodec(codec: string): boolean {
  return !isGPUCodec(codec);
}

/**
 * Detect which hardware acceleration type a codec uses
 */
export function detectHardwareType(codec: string): HardwareAccelerationValue {
  for (const [type, patterns] of Object.entries(GPU_CODEC_PATTERNS)) {
    if (patterns.some(pattern => codec.includes(pattern))) {
      return type as HardwareAccelerationValue;
    }
  }
  return HardwareAcceleration.CPU;
}

/**
 * Filter codecs by acceleration type
 */
export function filterCodecsByAcceleration(
  codecs: string[],
  acceleration: HardwareAccelerationValue
): string[] {
  const accelValue = typeof acceleration === 'string' ? acceleration : acceleration;

  if (accelValue === HardwareAcceleration.ANY || accelValue === 'any') {
    return codecs;
  }

  if (accelValue === HardwareAcceleration.CPU || accelValue === 'cpu') {
    return codecs.filter(isCPUCodec);
  }

  const patterns = GPU_CODEC_PATTERNS[accelValue as keyof typeof GPU_CODEC_PATTERNS];
  if (!patterns) {
    return [];
  }

  return codecs.filter(codec => patterns.some(pattern => codec.includes(pattern)));
}
