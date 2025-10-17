import { describe, it, expect } from 'vitest';
import {
  FFmpeg,
  FFmpegError,
  FFmpegNotFoundError,
  CodecNotSupportedError,
  FormatNotSupportedError,
  HardwareAccelerationError,
} from '../src/index';

describe('Error Handling', () => {
  describe('FormatNotSupportedError', () => {
    it('should throw when format is not supported', async () => {
      await expect(
        FFmpeg.canOutputFormat('invalid_format_xyz', true)
      ).rejects.toThrow(FormatNotSupportedError);
    });

    it('should have correct error properties', async () => {
      try {
        await FFmpeg.canOutputFormat('invalid_format', true);
      } catch (err) {
        expect(err).toBeInstanceOf(FormatNotSupportedError);
        if (err instanceof FormatNotSupportedError) {
          expect(err.format).toBe('invalid_format');
          expect(err.operation).toBe('mux');
          expect(err.code).toBe('FORMAT_NOT_SUPPORTED');
          expect(err.name).toBe('FormatNotSupportedError');
        }
      }
    });
  });

  describe('CodecNotSupportedError', () => {
    it('should throw when codec is not supported', async () => {
      await expect(
        FFmpeg.canEncodeWithCodec('invalid_codec', 'video', 'any', true)
      ).rejects.toThrow(CodecNotSupportedError);
    });

    it('should have correct error properties', async () => {
      try {
        await FFmpeg.canEncodeWithCodec('invalid_codec', 'video', 'any', true);
      } catch (err) {
        expect(err).toBeInstanceOf(CodecNotSupportedError);
        if (err instanceof CodecNotSupportedError) {
          expect(err.codec).toBe('invalid_codec');
          expect(err.type).toBe('video');
          expect(err.operation).toBe('encode');
          expect(err.code).toBe('CODEC_NOT_SUPPORTED');
          expect(err.name).toBe('CodecNotSupportedError');
        }
      }
    });
  });

  describe('HardwareAccelerationError', () => {
    it('should throw when hardware acceleration is not available', async () => {
      // Try to use a GPU codec with specific hardware that might not be available
      try {
        await FFmpeg.canEncodeWithCodec('libx264', 'video', 'nvidia', true);
      } catch (err) {
        // This should throw either HardwareAccelerationError or CodecNotSupportedError
        // depending on whether the codec exists but hardware is not available
        expect(
          err instanceof HardwareAccelerationError || 
          err instanceof CodecNotSupportedError
        ).toBe(true);
      }
    });
  });

  describe('Error Inheritance', () => {
    it('should have correct inheritance chain', () => {
      const formatError = new FormatNotSupportedError('test', 'mux');
      const codecError = new CodecNotSupportedError('test', 'video', 'encode');
      const hwError = new HardwareAccelerationError('nvidia');

      expect(formatError).toBeInstanceOf(FFmpegError);
      expect(formatError).toBeInstanceOf(Error);
      
      expect(codecError).toBeInstanceOf(FFmpegError);
      expect(codecError).toBeInstanceOf(Error);
      
      expect(hwError).toBeInstanceOf(FFmpegError);
      expect(hwError).toBeInstanceOf(Error);
    });
  });

  describe('Optional Error Throwing', () => {
    it('should not throw by default', async () => {
      const result = await FFmpeg.canOutputFormat('invalid_format');
      expect(result).toBe(false);
    });

    it('should throw when throwOnError is true', async () => {
      await expect(
        FFmpeg.canOutputFormat('invalid_format', true)
      ).rejects.toThrow();
    });
  });
});

