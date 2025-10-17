import { describe, it, expect, beforeAll } from 'vitest';
import { FFmpeg } from '../src/ffmpeg';
import { existsSync, mkdirSync } from 'fs';

describe('Concatenation', () => {
  const shortVideo = 'tests/fixtures/short/mp4/h264/720p.mp4';
  const outputDir = 'tests/output/concat-test';

  beforeAll(() => {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
  });

  it('should concatenate videos (simple)', async () => {
    if (!existsSync(shortVideo)) return;

    const ffmpeg = new FFmpeg();
    const result = await ffmpeg.concatenate({
      inputs: [shortVideo, shortVideo],
      output: `${outputDir}/concat-simple.mp4`,
      method: 'concat',
    });

    expect(result.output).toBe(`${outputDir}/concat-simple.mp4`);
    expect(result.inputCount).toBe(2);
    expect(result.duration).toBeGreaterThan(0);
    expect(existsSync(result.output)).toBe(true);
  }, 30000);

  it('should concatenate videos with normalization', async () => {
    if (!existsSync(shortVideo)) return;

    const ffmpeg = new FFmpeg();
    const result = await ffmpeg.concatenate({
      inputs: [shortVideo, shortVideo],
      output: `${outputDir}/concat-normalized.mp4`,
      method: 'complex',
      normalize: {
        enabled: true,
        video: {
          codec: 'libx264',
          bitrate: '1M',
          size: '1280x720',
        },
      },
    });

    expect(result.output).toBe(`${outputDir}/concat-normalized.mp4`);
    expect(result.inputCount).toBe(2);
    expect(existsSync(result.output)).toBe(true);
  }, 40000);
});
