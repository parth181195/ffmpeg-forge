export interface FFmpegVersionInfo {
  version: string;
  copyright: string;
  configuration: string[];
  libVersions: {
    [key: string]: string;
  };
}

export interface FFmpegCapabilities {
  version: FFmpegVersionInfo;
  formats: {
    demuxing: string[];
    muxing: string[];
  };
  codecs: {
    video: {
      encoders: string[];
      decoders: string[];
    };
    audio: {
      encoders: string[];
      decoders: string[];
    };
    subtitle: {
      encoders: string[];
      decoders: string[];
    };
  };
}
