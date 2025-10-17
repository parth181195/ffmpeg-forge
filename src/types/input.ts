import type { ReadStream } from 'fs';

export type InputSource = string | Buffer | ReadStream;

export interface InputInfo {
  type: 'path' | 'buffer' | 'stream';
  source: InputSource;
  tempPath?: string;
}

