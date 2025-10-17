export enum VideoCodec {
  // CPU Codecs
  H264 = 'libx264',
  H264_RGB = 'libx264rgb',
  H265 = 'libx265',
  VP8 = 'libvpx',
  VP9 = 'libvpx-vp9',
  AV1_LIBAOM = 'libaom-av1',
  AV1_SVT = 'libsvtav1',
  MPEG4 = 'mpeg4',
  MPEG2 = 'mpeg2video',
  
  // NVIDIA GPU Codecs
  H264_NVENC = 'h264_nvenc',
  HEVC_NVENC = 'hevc_nvenc',
  AV1_NVENC = 'av1_nvenc',
  
  // Intel QSV Codecs
  H264_QSV = 'h264_qsv',
  HEVC_QSV = 'hevc_qsv',
  AV1_QSV = 'av1_qsv',
  
  // AMD AMF Codecs
  H264_AMF = 'h264_amf',
  HEVC_AMF = 'hevc_amf',
  
  // VAAPI Codecs
  H264_VAAPI = 'h264_vaapi',
  HEVC_VAAPI = 'hevc_vaapi',
  VP8_VAAPI = 'vp8_vaapi',
  VP9_VAAPI = 'vp9_vaapi',
  AV1_VAAPI = 'av1_vaapi',
  
  // VideoToolbox (macOS)
  H264_VIDEOTOOLBOX = 'h264_videotoolbox',
  HEVC_VIDEOTOOLBOX = 'hevc_videotoolbox',
  
  // Copy (no re-encoding)
  COPY = 'copy',
}

export enum AudioCodec {
  // Common Audio Codecs
  AAC = 'aac',
  MP3 = 'libmp3lame',
  OPUS = 'libopus',
  VORBIS = 'libvorbis',
  FLAC = 'flac',
  AC3 = 'ac3',
  EAC3 = 'eac3',
  DTS = 'dca',
  
  // Copy (no re-encoding)
  COPY = 'copy',
}

export type VideoCodecValue = VideoCodec | string;
export type AudioCodecValue = AudioCodec | string;

