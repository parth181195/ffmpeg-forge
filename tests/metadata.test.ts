import { describe, it, expect } from 'vitest';
import {
  parseMediaMetadata,
  parseVideoMetadata,
  parseImageMetadata,
} from '../src/parsers/metadata-parser';

describe('Metadata Parsing', () => {
  describe('parseMediaMetadata', () => {
    it('should parse FFprobe JSON output', () => {
      const mockJson = JSON.stringify({
        format: {
          filename: 'test.mp4',
          format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
          format_long_name: 'QuickTime / MOV',
          duration: '10.5',
          size: '1048576',
          bit_rate: '800000',
          probe_score: 100,
          tags: {
            encoder: 'test encoder',
          },
        },
        streams: [
          {
            index: 0,
            codec_name: 'h264',
            codec_long_name: 'H.264 / AVC',
            codec_type: 'video',
            codec_tag_string: 'avc1',
            width: 1920,
            height: 1080,
            pix_fmt: 'yuv420p',
            r_frame_rate: '30/1',
            avg_frame_rate: '30/1',
            duration: '10.5',
            bit_rate: '700000',
            tags: {},
          },
          {
            index: 1,
            codec_name: 'aac',
            codec_long_name: 'AAC (Advanced Audio Coding)',
            codec_type: 'audio',
            codec_tag_string: 'mp4a',
            sample_rate: '48000',
            channels: 2,
            channel_layout: 'stereo',
            duration: '10.5',
            tags: {},
          },
        ],
      });

      const result = parseMediaMetadata(mockJson);

      expect(result.format.filename).toBe('test.mp4');
      expect(result.format.duration).toBe('10.5');
      expect(result.streams).toHaveLength(2);
      expect(result.streams[0].codecType).toBe('video');
      expect(result.streams[0].width).toBe(1920);
      expect(result.streams[0].height).toBe(1080);
      expect(result.streams[1].codecType).toBe('audio');
    });
  });

  describe('parseVideoMetadata', () => {
    it('should parse video metadata correctly', () => {
      const mediaMetadata = {
        format: {
          filename: 'test.mp4',
          formatName: 'mov,mp4',
          formatLongName: 'QuickTime / MOV',
          duration: '10.5',
          size: '1048576',
          bitRate: '800000',
          tags: {},
        },
        streams: [
          {
            index: 0,
            codecName: 'h264',
            codecLongName: 'H.264',
            codecType: 'video' as const,
            codecTag: 'avc1',
            width: 1920,
            height: 1080,
            avgFrameRate: '30/1',
            tags: {},
          },
          {
            index: 1,
            codecName: 'aac',
            codecLongName: 'AAC',
            codecType: 'audio' as const,
            codecTag: 'mp4a',
            channels: 2,
            tags: {},
          },
        ],
      };

      const result = parseVideoMetadata(mediaMetadata);

      expect(result.duration).toBe(10.5);
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.frameRate).toBe(30);
      expect(result.videoCodec).toBe('h264');
      expect(result.audioCodec).toBe('aac');
      expect(result.videoStreams).toHaveLength(1);
      expect(result.audioStreams).toHaveLength(1);
      expect(result.bitrate).toBe(800); // 800000 / 1000 = 800 kbps
    });

    it('should throw error if no video stream', () => {
      const mediaMetadata = {
        format: {
          filename: 'test.mp3',
          formatName: 'mp3',
          formatLongName: 'MP3',
          tags: {},
        },
        streams: [
          {
            index: 0,
            codecName: 'mp3',
            codecLongName: 'MP3',
            codecType: 'audio' as const,
            codecTag: 'mp3',
            tags: {},
          },
        ],
      };

      expect(() => parseVideoMetadata(mediaMetadata)).toThrow('No video stream found');
    });
  });

  describe('parseImageMetadata', () => {
    it('should parse image metadata correctly', () => {
      const mediaMetadata = {
        format: {
          filename: 'test.png',
          formatName: 'png_pipe',
          formatLongName: 'piped png sequence',
          size: '102400',
          tags: {},
        },
        streams: [
          {
            index: 0,
            codecName: 'png',
            codecLongName: 'PNG',
            codecType: 'video' as const,
            codecTag: '0x0000',
            width: 1920,
            height: 1080,
            pixelFormat: 'rgba',
            tags: {},
          },
        ],
      };

      const result = parseImageMetadata(mediaMetadata);

      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.codec).toBe('png');
      expect(result.pixelFormat).toBe('rgba');
      expect(result.size).toBe(102400);
    });

    it('should throw error if no image stream', () => {
      const mediaMetadata = {
        format: {
          filename: 'test.mp3',
          formatName: 'mp3',
          formatLongName: 'MP3',
          tags: {},
        },
        streams: [
          {
            index: 0,
            codecName: 'mp3',
            codecLongName: 'MP3',
            codecType: 'audio' as const,
            codecTag: 'mp3',
            tags: {},
          },
        ],
      };

      expect(() => parseImageMetadata(mediaMetadata)).toThrow('No image stream found');
    });
  });
});
