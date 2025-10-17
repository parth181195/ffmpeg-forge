import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FFmpeg, FFmpegNotFoundError, VideoCodec, AudioCodec, OutputFormat } from '../src/index';

describe('FFmpeg', () => {
  // Store original paths
  let originalFFmpegPath: string;
  let originalFFprobePath: string;

  beforeEach(() => {
    // Save original paths
    originalFFmpegPath = FFmpeg.getFFmpegPath();
    originalFFprobePath = FFmpeg.getFFprobePath();
  });

  afterEach(() => {
    // Restore original paths after each test
    FFmpeg.setFFmpegPath(originalFFmpegPath);
    FFmpeg.setFFprobePath(originalFFprobePath);
  });

  describe('Path Configuration', () => {
    it('should have default paths set', () => {
      expect(FFmpeg.getFFmpegPath()).toBeDefined();
      expect(FFmpeg.getFFprobePath()).toBeDefined();
    });

    it('should allow setting custom paths', () => {
      const customPath = '/custom/path/ffmpeg';
      FFmpeg.setFFmpegPath(customPath);
      expect(FFmpeg.getFFmpegPath()).toBe(customPath);
    });

    it('should create instance with custom paths', () => {
      const instance = new FFmpeg({
        ffmpegPath: '/custom/ffmpeg',
        ffprobePath: '/custom/ffprobe',
      });
      expect(instance).toBeInstanceOf(FFmpeg);
    });
  });

  describe('Version Information', () => {
    it('should get FFmpeg version information', async () => {
      const version = await FFmpeg.getVersion();

      expect(version).toHaveProperty('version');
      expect(version).toHaveProperty('copyright');
      expect(version).toHaveProperty('configuration');
      expect(version).toHaveProperty('libVersions');
      expect(typeof version.version).toBe('string');
      expect(version.version.length).toBeGreaterThan(0);
    });

    it('should have library versions', async () => {
      const version = await FFmpeg.getVersion();

      expect(Object.keys(version.libVersions).length).toBeGreaterThan(0);
      expect(version.libVersions).toHaveProperty('libavcodec');
      expect(version.libVersions).toHaveProperty('libavformat');
    });
  });

  describe('Format Detection', () => {
    it('should get available formats', async () => {
      const formats = await FFmpeg.getFormats();

      expect(formats).toHaveProperty('muxing');
      expect(formats).toHaveProperty('demuxing');
      expect(Array.isArray(formats.muxing)).toBe(true);
      expect(Array.isArray(formats.demuxing)).toBe(true);
      expect(formats.muxing.length).toBeGreaterThan(0);
      expect(formats.demuxing.length).toBeGreaterThan(0);
    });

    it('should support common formats', async () => {
      const formats = await FFmpeg.getFormats();

      expect(formats.muxing).toContain('mp4');
      expect(formats.muxing).toContain('webm');
      // mp4 demuxing might be listed as part of a combined format
      expect(formats.demuxing.some(f => f.includes('mp4'))).toBe(true);
    });

    it('should verify format support', async () => {
      const canMp4 = await FFmpeg.canOutputFormat('mp4');
      expect(canMp4).toBe(true);

      const canInvalid = await FFmpeg.canOutputFormat('invalid_format_xyz');
      expect(canInvalid).toBe(false);
    });
  });

  describe('Codec Detection', () => {
    it('should get available codecs', async () => {
      const codecs = await FFmpeg.getCodecs();

      expect(codecs).toHaveProperty('video');
      expect(codecs).toHaveProperty('audio');
      expect(codecs).toHaveProperty('subtitle');

      expect(codecs.video).toHaveProperty('encoders');
      expect(codecs.video).toHaveProperty('decoders');
      expect(codecs.audio).toHaveProperty('encoders');
      expect(codecs.audio).toHaveProperty('decoders');

      expect(Array.isArray(codecs.video.encoders)).toBe(true);
      expect(codecs.video.encoders.length).toBeGreaterThan(0);
    });

    it('should support common codecs', async () => {
      const codecs = await FFmpeg.getCodecs();

      // Check for H.264 encoder (libx264)
      expect(codecs.video.encoders).toContain('libx264');

      // Check for AAC audio encoder
      expect(codecs.audio.encoders).toContain('aac');
    });

    it('should verify codec support', async () => {
      const canH264 = await FFmpeg.canEncodeWithCodec('libx264', 'video');
      expect(canH264).toBe(true);

      const canInvalid = await FFmpeg.canEncodeWithCodec('invalid_codec', 'video');
      expect(canInvalid).toBe(false);
    });
  });

  describe('Capabilities', () => {
    it('should get all capabilities at once', async () => {
      const capabilities = await FFmpeg.getCapabilities();

      expect(capabilities).toHaveProperty('version');
      expect(capabilities).toHaveProperty('formats');
      expect(capabilities).toHaveProperty('codecs');

      expect(capabilities.version).toHaveProperty('version');
      expect(capabilities.formats).toHaveProperty('muxing');
      expect(capabilities.codecs).toHaveProperty('video');
    });
  });

  describe('Hardware Acceleration', () => {
    it('should detect available hardware acceleration', async () => {
      const hwAccel = await FFmpeg.getAvailableHardwareAcceleration();

      expect(Array.isArray(hwAccel)).toBe(true);
      expect(hwAccel.length).toBeGreaterThan(0);

      // CPU should always be available
      const cpu = hwAccel.find(hw => hw.type === 'cpu');
      expect(cpu).toBeDefined();
      expect(cpu?.available).toBe(true);
      expect(cpu?.encoders.length).toBeGreaterThan(0);
    });

    it('should filter encoders by acceleration type', async () => {
      const cpuEncoders = await FFmpeg.getEncodersByAcceleration('cpu', 'video');

      expect(Array.isArray(cpuEncoders)).toBe(true);
      expect(cpuEncoders.length).toBeGreaterThan(0);

      // CPU encoders should not have GPU-specific patterns
      cpuEncoders.forEach(encoder => {
        expect(encoder).not.toMatch(/_nvenc|_qsv|_amf|_vaapi/);
      });
    });
  });

  describe('Output Verification', () => {
    it('should verify valid output configuration', async () => {
      const result = await FFmpeg.verifyOutputSupport({
        format: OutputFormat.MP4,
        videoCodec: VideoCodec.H264,
        audioCodec: AudioCodec.AAC,
        acceleration: 'cpu',
      });

      expect(result.supported).toBe(true);
      expect(result.unsupported).toHaveLength(0);
      expect(result.details.format?.supported).toBe(true);
      expect(result.details.videoCodec?.supported).toBe(true);
      expect(result.details.audioCodec?.supported).toBe(true);
    });

    it('should detect invalid output configuration', async () => {
      const result = await FFmpeg.verifyOutputSupport({
        format: 'invalid_format',
        videoCodec: 'invalid_codec',
      });

      expect(result.supported).toBe(false);
      expect(result.unsupported.length).toBeGreaterThan(0);
    });

    it('should work with custom string values', async () => {
      const result = await FFmpeg.verifyOutputSupport({
        format: 'webm',
        videoCodec: 'libvpx-vp9',
        audioCodec: 'libopus',
      });

      expect(result.supported).toBe(true);
    });
  });

  describe('Enum Support', () => {
    it('should have VideoCodec enum values', () => {
      expect(VideoCodec.H264).toBe('libx264');
      expect(VideoCodec.H265).toBe('libx265');
      expect(VideoCodec.VP9).toBe('libvpx-vp9');
      expect(VideoCodec.H264_NVENC).toBe('h264_nvenc');
    });

    it('should have AudioCodec enum values', () => {
      expect(AudioCodec.AAC).toBe('aac');
      expect(AudioCodec.MP3).toBe('libmp3lame');
      expect(AudioCodec.OPUS).toBe('libopus');
    });

    it('should have OutputFormat enum values', () => {
      expect(OutputFormat.MP4).toBe('mp4');
      expect(OutputFormat.WEBM).toBe('webm');
      expect(OutputFormat.MKV).toBe('matroska');
    });
  });
});
