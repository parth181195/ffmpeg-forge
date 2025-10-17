import { describe, it, expect } from 'vitest';
import {
  isGPUCodec,
  isCPUCodec,
  detectHardwareType,
  filterCodecsByAcceleration,
} from '../src/utils/hardware-detection';

describe('Hardware Detection', () => {
  describe('isGPUCodec', () => {
    it('should detect NVIDIA codecs', () => {
      expect(isGPUCodec('h264_nvenc')).toBe(true);
      expect(isGPUCodec('hevc_nvenc')).toBe(true);
      expect(isGPUCodec('av1_nvenc')).toBe(true);
    });

    it('should detect Intel QSV codecs', () => {
      expect(isGPUCodec('h264_qsv')).toBe(true);
      expect(isGPUCodec('hevc_qsv')).toBe(true);
    });

    it('should detect VAAPI codecs', () => {
      expect(isGPUCodec('h264_vaapi')).toBe(true);
      expect(isGPUCodec('vp9_vaapi')).toBe(true);
    });

    it('should not detect CPU codecs as GPU', () => {
      expect(isGPUCodec('libx264')).toBe(false);
      expect(isGPUCodec('libx265')).toBe(false);
      expect(isGPUCodec('libvpx-vp9')).toBe(false);
    });
  });

  describe('isCPUCodec', () => {
    it('should detect CPU codecs', () => {
      expect(isCPUCodec('libx264')).toBe(true);
      expect(isCPUCodec('libx265')).toBe(true);
      expect(isCPUCodec('libvpx-vp9')).toBe(true);
    });

    it('should not detect GPU codecs as CPU', () => {
      expect(isCPUCodec('h264_nvenc')).toBe(false);
      expect(isCPUCodec('h264_qsv')).toBe(false);
    });
  });

  describe('detectHardwareType', () => {
    it('should detect NVIDIA acceleration', () => {
      expect(detectHardwareType('h264_nvenc')).toBe('nvidia');
      expect(detectHardwareType('hevc_nvenc')).toBe('nvidia');
    });

    it('should detect Intel acceleration', () => {
      expect(detectHardwareType('h264_qsv')).toBe('intel');
      expect(detectHardwareType('av1_qsv')).toBe('intel');
    });

    it('should detect VAAPI acceleration', () => {
      expect(detectHardwareType('h264_vaapi')).toBe('vaapi');
    });

    it('should default to CPU for unknown codecs', () => {
      expect(detectHardwareType('libx264')).toBe('cpu');
      expect(detectHardwareType('libx265')).toBe('cpu');
    });
  });

  describe('filterCodecsByAcceleration', () => {
    const testCodecs = ['libx264', 'libx265', 'h264_nvenc', 'hevc_nvenc', 'h264_qsv', 'h264_vaapi'];

    it('should return all codecs for "any"', () => {
      const result = filterCodecsByAcceleration(testCodecs, 'any');
      expect(result).toEqual(testCodecs);
    });

    it('should filter CPU codecs', () => {
      const result = filterCodecsByAcceleration(testCodecs, 'cpu');
      expect(result).toContain('libx264');
      expect(result).toContain('libx265');
      expect(result).not.toContain('h264_nvenc');
      expect(result).not.toContain('h264_qsv');
    });

    it('should filter NVIDIA codecs', () => {
      const result = filterCodecsByAcceleration(testCodecs, 'nvidia');
      expect(result).toContain('h264_nvenc');
      expect(result).toContain('hevc_nvenc');
      expect(result).not.toContain('libx264');
      expect(result).not.toContain('h264_qsv');
    });

    it('should filter Intel QSV codecs', () => {
      const result = filterCodecsByAcceleration(testCodecs, 'intel');
      expect(result).toContain('h264_qsv');
      expect(result).not.toContain('libx264');
      expect(result).not.toContain('h264_nvenc');
    });

    it('should filter VAAPI codecs', () => {
      const result = filterCodecsByAcceleration(testCodecs, 'vaapi');
      expect(result).toContain('h264_vaapi');
      expect(result).not.toContain('libx264');
    });
  });
});
