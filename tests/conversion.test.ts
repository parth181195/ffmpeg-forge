import { describe, it, expect, beforeAll } from 'vitest';
import { FFmpeg } from '../src/ffmpeg';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { VideoCodec, AudioCodec, OutputFormat } from '../src/types/codecs';

describe('Conversion', () => {
  const shortVideo = 'tests/fixtures/short/mp4/h264/720p.mp4';
  const outputDir = 'tests/output';
  
  beforeAll(() => {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
  });
  
  it('should convert video with basic config', async () => {
    if (!existsSync(shortVideo)) return;
    
    const ffmpeg = new FFmpeg();
    const output = `${outputDir}/basic-conversion-test.mp4`;
    
    await ffmpeg.convert({
      input: shortVideo,
      output,
      video: {
        codec: VideoCodec.H264,
        bitrate: '1M',
      },
      audio: {
        codec: AudioCodec.AAC,
        bitrate: '128k',
      },
    });
    
    expect(existsSync(output)).toBe(true);
    if (existsSync(output)) unlinkSync(output);
  }, 30000);
  
  it('should validate config before conversion', () => {
    const ffmpeg = new FFmpeg();
    
    // Build command validates the config
    const cmd = ffmpeg.buildCommand({
      input: shortVideo,
      output: `${outputDir}/test.mp4`,
      video: {
        codec: VideoCodec.H264,
      },
    });
    
    expect(cmd).toBeTruthy();
    expect(cmd).toContain('libx264');
  });
  
  it('should build command without executing', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: shortVideo,
      output: `${outputDir}/test.mp4`,
      video: {
        codec: VideoCodec.H264,
        bitrate: '2M',
      },
    });
    
    expect(cmd).toContain('-c:v');
    expect(cmd).toContain('libx264');
    expect(cmd).toContain('-b:v');
    expect(cmd).toContain('2M');
  });
  
  it('should handle video filters', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: shortVideo,
      output: `${outputDir}/test.mp4`,
      video: {
        codec: VideoCodec.H264,
        size: '1280x720',
        filters: {
          scale: {
            width: 1280,
            height: 720,
            algorithm: 'lanczos',
          },
        },
      },
    });
    
    expect(cmd).toContain('scale');
    expect(cmd).toContain('1280');
    expect(cmd).toContain('720');
  });
  
  it('should handle audio filters', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: shortVideo,
      output: `${outputDir}/test.mp4`,
      audio: {
        codec: AudioCodec.AAC,
        filters: {
          volume: {
            level: 150,
          },
        },
      },
    });
    
    expect(cmd).toContain('volume');
  });
  
  it('should handle timing options', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: shortVideo,
      output: `${outputDir}/test.mp4`,
      timing: {
        seek: 5,
        duration: 10,
      },
    });
    
    expect(cmd).toContain('-ss');
    expect(cmd).toContain('-t');
  });
  
  it('should handle format and output options', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: shortVideo,
      output: `${outputDir}/test.webm`,
      format: 'webm',
      video: {
        codec: VideoCodec.VP9,
      },
    });
    
    expect(cmd).toContain('-f');
    expect(cmd).toContain('webm');
  });
});

