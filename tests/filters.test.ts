import { describe, it, expect } from 'vitest';
import { FFmpeg } from '../src/ffmpeg';
import { VideoCodec } from '../src/types/codecs';

describe('Filters', () => {
  it('should handle scale filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          scale: {
            width: 1920,
            height: 1080,
            algorithm: 'lanczos',
          },
        },
      },
    });
    
    expect(cmd).toContain('scale');
    expect(cmd).toContain('1920');
    expect(cmd).toContain('1080');
  });
  
  it('should handle crop filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          crop: {
            width: 1280,
            height: 720,
            x: 0,
            y: 0,
          },
        },
      },
    });
    
    expect(cmd).toContain('crop');
  });
  
  it('should handle pad filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          pad: {
            width: 1920,
            height: 1080,
            x: 0,
            y: 0,
            color: 'black',
          },
        },
      },
    });
    
    expect(cmd).toContain('pad');
  });
  
  it('should handle deinterlace filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          deinterlace: {
            mode: 'yadif',
          },
        },
      },
    });
    
    expect(cmd).toContain('yadif');
  });
  
  it('should handle denoise filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          denoise: {
            luma_spatial: 4,
            chroma_spatial: 3,
          },
        },
      },
    });
    
    expect(cmd).toContain('hqdn3d');
  });
  
  it('should handle sharpen filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          sharpen: {
            luma_amount: 1.5,
          },
        },
      },
    });
    
    expect(cmd).toContain('unsharp');
  });
  
  it('should handle color correction', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          color: {
            brightness: 0.1,
            contrast: 1.2,
            saturation: 1.1,
          },
        },
      },
    });
    
    expect(cmd).toContain('eq');
  });
  
  it('should handle rotate filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          rotate: {
            angle: 45,  // Arbitrary angle
          },
        },
      },
    });
    
    expect(cmd).toContain('rotate');
  });
  
  it('should handle flip filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          flip: {
            horizontal: true,
          },
        },
      },
    });
    
    expect(cmd).toContain('hflip');
  });
  
  it('should handle text overlay', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          text: {
            text: 'Hello World',
            x: 10,
            y: 10,
          },
        },
      },
    });
    
    expect(cmd).toContain('drawtext');
  });
  
  it('should handle fade filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          fade: {
            type: 'in',
            start_time: 0,
            duration: 2,
          },
        },
      },
    });
    
    expect(cmd).toContain('fade');
  });
  
  it('should handle audio volume filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      audio: {
        codec: 'aac',
        filters: {
          volume: {
            level: 150,
          },
        },
      },
    });
    
    expect(cmd).toContain('volume');
  });
  
  it('should handle audio tempo filter', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      audio: {
        codec: 'aac',
        filters: {
          tempo: {
            speed: 1.5,
          },
        },
      },
    });
    
    expect(cmd).toContain('atempo');
  });
  
  it('should handle multiple filters', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          scale: {
            width: 1920,
            height: 1080,
          },
          sharpen: {
            luma_amount: 1.2,
          },
          color: {
            brightness: 0.05,
          },
        },
      },
    });
    
    expect(cmd).toContain('scale');
    expect(cmd).toContain('unsharp');
    expect(cmd).toContain('eq');
  });
  
  it('should handle custom filters', () => {
    const ffmpeg = new FFmpeg();
    
    const cmd = ffmpeg.buildCommand({
      input: 'input.mp4',
      output: 'output.mp4',
      video: {
        codec: VideoCodec.H264,
        filters: {
          custom: ['hqdn3d=4:3:6:4.5', 'format=yuv420p'],
        },
      },
    });
    
    expect(cmd).toContain('hqdn3d');
    expect(cmd).toContain('format');
  });
});

