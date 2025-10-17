export enum HardwareAcceleration {
  CPU = 'cpu',
  NVIDIA = 'nvidia',
  INTEL = 'intel',
  AMD = 'amd',
  VAAPI = 'vaapi',
  VIDEOTOOLBOX = 'videotoolbox',
  V4L2 = 'v4l2',
  ANY = 'any',
}

export type HardwareAccelerationValue = HardwareAcceleration | string;

export interface HardwareAccelerationInfo {
  type: HardwareAccelerationValue;
  available: boolean;
  encoders: string[];
  decoders: string[];
}

export const GPU_CODEC_PATTERNS = {
  nvidia: ['_nvenc', '_cuvid'],
  intel: ['_qsv'],
  amd: ['_amf'],
  vaapi: ['_vaapi'],
  videotoolbox: ['_videotoolbox'],
  v4l2: ['_v4l2m2m'],
} as const;
