import type { VideoCodecValue, AudioCodecValue } from './codecs';
import type { OutputFormatValue } from './formats';

export interface FFmpegOptions {
  videoCodec?: VideoCodecValue;
  audioCodec?: AudioCodecValue;
  videoBitrate?: string;
  audioBitrate?: string;
  format?: OutputFormatValue;
  fps?: number;
  size?: string;
  aspectRatio?: string;
  duration?: number;
  seek?: number;
  noAudio?: boolean;
  noVideo?: boolean;
}

