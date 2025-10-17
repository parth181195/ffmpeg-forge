import { describe, it, expect, beforeAll } from 'vitest';
import { FFmpeg } from '../src/ffmpeg';
import { existsSync, mkdirSync } from 'fs';

describe('Screenshot', () => {
  const shortVideo = 'tests/fixtures/short/mp4/h264/720p.mp4';
  const outputDir = 'tests/output/screenshots-test';
  
  beforeAll(() => {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
  });
  
  it('should extract single screenshot', async () => {
    if (!existsSync(shortVideo)) return;
    
    const ffmpeg = new FFmpeg();
    const output = await ffmpeg.extractScreenshot({
      input: shortVideo,
      output: `${outputDir}/single.jpg`,
      time: 1,
    });
    
    expect(output).toBe(`${outputDir}/single.jpg`);
    expect(existsSync(output)).toBe(true);
  }, 15000);
  
  it('should extract multiple screenshots', async () => {
    if (!existsSync(shortVideo)) return;
    
    const ffmpeg = new FFmpeg();
    const result = await ffmpeg.extractScreenshots({
      input: shortVideo,
      folder: `${outputDir}/multiple`,
      filename: 'frame-%i.jpg',
      count: 3,
    });
    
    expect(result.count).toBe(3);
    expect(result.files).toHaveLength(3);
    expect(result.timestamps).toBeDefined();
  }, 20000);
  
  it('should extract screenshots with custom size', async () => {
    if (!existsSync(shortVideo)) return;
    
    const ffmpeg = new FFmpeg();
    const output = await ffmpeg.extractScreenshot({
      input: shortVideo,
      output: `${outputDir}/resized.jpg`,
      time: 2,
      size: '640x360',
    });
    
    expect(existsSync(output)).toBe(true);
  }, 15000);
});

