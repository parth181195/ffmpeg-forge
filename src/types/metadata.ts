export interface StreamMetadata {
  index: number;
  codecName: string;
  codecLongName: string;
  codecType: 'video' | 'audio' | 'subtitle' | 'data' | 'attachment';
  codecTag: string;

  // Video specific
  width?: number;
  height?: number;
  codedWidth?: number;
  codedHeight?: number;
  displayAspectRatio?: string;
  pixelFormat?: string;
  frameRate?: string;
  avgFrameRate?: string;
  bitRate?: string;

  // Audio specific
  sampleRate?: string;
  channels?: number;
  channelLayout?: string;
  bitsPerSample?: number;

  // Common
  duration?: string;
  durationTs?: number;
  startTime?: string;
  startPts?: number;
  bitrate?: string;
  tags?: Record<string, string>;
}

export interface FormatMetadata {
  filename: string;
  formatName: string;
  formatLongName: string;
  startTime?: string;
  duration?: string;
  size?: string;
  bitRate?: string;
  probeScore?: number;
  tags?: Record<string, string>;
}

export interface MediaMetadata {
  format: FormatMetadata;
  streams: StreamMetadata[];
}

export interface VideoMetadata {
  format: FormatMetadata;
  videoStreams: StreamMetadata[];
  audioStreams: StreamMetadata[];
  subtitleStreams: StreamMetadata[];
  duration: number; // in seconds
  width: number;
  height: number;
  frameRate: number;
  videoCodec: string;
  audioCodec?: string;
  bitrate: number; // in kbps
  size: number; // in bytes
}

export interface ImageMetadata {
  format: FormatMetadata;
  width: number;
  height: number;
  pixelFormat: string;
  codec: string;
  size: number; // in bytes
}
