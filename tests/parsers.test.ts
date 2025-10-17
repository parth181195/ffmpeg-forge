import { describe, it, expect } from 'vitest';
import { parseVersion, parseFormats, parseEncoders, parseDecoders } from '../src/parsers';

describe('Parsers', () => {
  describe('parseVersion', () => {
    it('should parse version output correctly', () => {
      const mockOutput = `ffmpeg version 4.4.2 Copyright (c) 2000-2021 the FFmpeg developers
built with gcc 11.2.0
configuration: --prefix=/usr --enable-gpl
libavutil      56. 70.100 / 56. 70.100
libavcodec     58.134.100 / 58.134.100
libavformat    58. 76.100 / 58. 76.100`;

      const result = parseVersion(mockOutput);

      expect(result.version).toBe('4.4.2');
      expect(result.copyright).toContain('2000-2021');
      expect(result.libVersions).toHaveProperty('libavutil');
      expect(result.libVersions).toHaveProperty('libavcodec');
      expect(result.libVersions).toHaveProperty('libavformat');
    });
  });

  describe('parseFormats', () => {
    it('should parse formats output correctly', () => {
      const mockOutput = `File formats:
 D. = Demuxing supported
 .E = Muxing supported
 --
 D  3dostr          3DO STR
  E 3g2             3GP2 (3GPP2 file format)
  E 3gp             3GP (3GPP file format)
 DE matroska        Matroska
 DE mp4             MP4 (MPEG-4 Part 14)`;

      const result = parseFormats(mockOutput);

      expect(result.demuxing).toContain('3dostr');
      expect(result.demuxing).toContain('matroska');
      expect(result.demuxing).toContain('mp4');

      expect(result.muxing).toContain('3g2');
      expect(result.muxing).toContain('3gp');
      expect(result.muxing).toContain('matroska');
      expect(result.muxing).toContain('mp4');
    });
  });

  describe('parseEncoders', () => {
    it('should parse encoders output correctly', () => {
      const mockOutput = `Encoders:
 V..... = Video
 A..... = Audio
 S..... = Subtitle
 ------
 V..... libx264              libx264 H.264 / AVC
 V..... libx265              libx265 H.265 / HEVC
 A..... aac                  AAC (Advanced Audio Coding)`;

      const result = parseEncoders(mockOutput);

      expect(result.video).toContain('libx264');
      expect(result.video).toContain('libx265');
      expect(result.audio).toContain('aac');
    });
  });

  describe('parseDecoders', () => {
    it('should parse decoders output correctly', () => {
      const mockOutput = `Decoders:
 V..... = Video
 A..... = Audio
 S..... = Subtitle
 ------
 V..... h264                 H.264 / AVC / MPEG-4 AVC
 V..... hevc                 HEVC (High Efficiency Video Coding)
 A..... aac                  AAC (Advanced Audio Coding)`;

      const result = parseDecoders(mockOutput);

      expect(result.video).toContain('h264');
      expect(result.video).toContain('hevc');
      expect(result.audio).toContain('aac');
    });
  });
});
