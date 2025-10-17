export enum OutputFormat {
  // Video Formats
  MP4 = 'mp4',
  WEBM = 'webm',
  MKV = 'matroska',
  AVI = 'avi',
  MOV = 'mov',
  FLV = 'flv',
  MPEG = 'mpeg',
  MPEGTS = 'mpegts',
  OGV = 'ogg',

  // Audio Formats
  MP3 = 'mp3',
  AAC = 'aac',
  OGG = 'ogg',
  OPUS = 'opus',
  FLAC = 'flac',
  WAV = 'wav',
  M4A = 'm4a',

  // Image Formats
  GIF = 'gif',
  APNG = 'apng',
  PNG = 'image2',
  JPEG = 'image2',
}

export type OutputFormatValue = OutputFormat | string;
