import { describe, it, expect } from 'vitest';
import { getInputType, prepareInput, cleanupInput, getInputPath } from '../src/utils/input-handler';
import { existsSync, readFileSync } from 'fs';
import { createReadStream } from 'fs';

describe('Input Handler', () => {
  describe('getInputType', () => {
    it('should identify path string', () => {
      const result = getInputType('/path/to/file.mp4');
      expect(result).toBe('path');
    });

    it('should identify buffer', () => {
      const buffer = Buffer.from('test data');
      const result = getInputType(buffer);
      expect(result).toBe('buffer');
    });

    it('should identify stream', () => {
      const stream = createReadStream(__filename);
      const result = getInputType(stream);
      expect(result).toBe('stream');
      stream.close();
    });
  });

  describe('prepareInput', () => {
    it('should handle path input without creating temp file', async () => {
      const inputInfo = await prepareInput('/path/to/file.mp4');

      expect(inputInfo.type).toBe('path');
      expect(inputInfo.source).toBe('/path/to/file.mp4');
      expect(inputInfo.tempPath).toBeUndefined();
    });

    it('should create temp file for buffer', async () => {
      const buffer = Buffer.from('test data');
      const inputInfo = await prepareInput(buffer);

      expect(inputInfo.type).toBe('buffer');
      expect(inputInfo.tempPath).toBeDefined();
      expect(existsSync(inputInfo.tempPath!)).toBe(true);

      // Verify content
      const content = readFileSync(inputInfo.tempPath!, 'utf-8');
      expect(content).toBe('test data');

      // Cleanup
      cleanupInput(inputInfo);
      expect(existsSync(inputInfo.tempPath!)).toBe(false);
    });

    it('should create temp file for stream', async () => {
      const stream = createReadStream(__filename);
      const inputInfo = await prepareInput(stream);

      expect(inputInfo.type).toBe('stream');
      expect(inputInfo.tempPath).toBeDefined();
      expect(existsSync(inputInfo.tempPath!)).toBe(true);

      // Cleanup
      cleanupInput(inputInfo);
      expect(existsSync(inputInfo.tempPath!)).toBe(false);
    });
  });

  describe('getInputPath', () => {
    it('should return original path for path input', async () => {
      const inputInfo = await prepareInput('/path/to/file.mp4');
      const path = getInputPath(inputInfo);
      expect(path).toBe('/path/to/file.mp4');
    });

    it('should return temp path for buffer input', async () => {
      const buffer = Buffer.from('test');
      const inputInfo = await prepareInput(buffer);
      const path = getInputPath(inputInfo);

      expect(path).toBe(inputInfo.tempPath);
      expect(path).not.toBe(buffer);

      cleanupInput(inputInfo);
    });
  });

  describe('cleanupInput', () => {
    it('should do nothing for path input', async () => {
      const inputInfo = await prepareInput('/path/to/file.mp4');

      // Should not throw
      expect(() => cleanupInput(inputInfo)).not.toThrow();
    });

    it('should remove temp file for buffer input', async () => {
      const buffer = Buffer.from('test');
      const inputInfo = await prepareInput(buffer);

      expect(existsSync(inputInfo.tempPath!)).toBe(true);
      cleanupInput(inputInfo);
      expect(existsSync(inputInfo.tempPath!)).toBe(false);
    });

    it('should handle cleanup errors gracefully', () => {
      const inputInfo = {
        type: 'buffer' as const,
        source: Buffer.from('test'),
        tempPath: '/nonexistent/path/file.tmp',
      };

      // Should not throw even if file doesn't exist
      expect(() => cleanupInput(inputInfo)).not.toThrow();
    });
  });
});
