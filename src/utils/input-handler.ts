import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import type { InputSource, InputInfo } from '../types/input';
import type { ReadStream } from 'fs';

/**
 * Determine the type of input source
 */
export function getInputType(input: InputSource): 'path' | 'buffer' | 'stream' {
  if (typeof input === 'string') {
    return 'path';
  } else if (Buffer.isBuffer(input)) {
    return 'buffer';
  } else {
    return 'stream';
  }
}

/**
 * Convert input source to a file path that FFmpeg can use
 * For buffers and streams, creates a temporary file
 */
export async function prepareInput(input: InputSource): Promise<InputInfo> {
  const type = getInputType(input);

  if (type === 'path') {
    return {
      type: 'path',
      source: input,
    };
  }

  // Generate temporary file path
  const tempPath = join(tmpdir(), `ffmpeg-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`);

  if (type === 'buffer') {
    // Write buffer to temporary file
    writeFileSync(tempPath, input as Buffer);
    return {
      type: 'buffer',
      source: input,
      tempPath,
    };
  }

  if (type === 'stream') {
    // Write stream to temporary file
    const stream = input as ReadStream;
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      stream.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      
      stream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        writeFileSync(tempPath, buffer);
        resolve({
          type: 'stream',
          source: input,
          tempPath,
        });
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  throw new Error(`Unsupported input type: ${typeof input}`);
}

/**
 * Clean up temporary file if it was created
 */
export function cleanupInput(inputInfo: InputInfo): void {
  if (inputInfo.tempPath) {
    try {
      unlinkSync(inputInfo.tempPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Get the file path from InputInfo
 */
export function getInputPath(inputInfo: InputInfo): string {
  return inputInfo.tempPath || (inputInfo.source as string);
}

