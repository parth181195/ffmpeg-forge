import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import type {
  ConversionConfig,
  ConversionCallbacks,
  ProgressInfo,
} from '../types/conversion-config';
import { CommandGenerator } from './command-generator';
import { ProgressParser } from './progress-parser';
import { prepareInput, cleanupInput, getInputPath } from './input-handler';
import { FFmpegExecutionError } from '../errors/ffmpeg-errors';

/**
 * FFmpeg execution engine with progress tracking
 */
export class ExecutionEngine extends EventEmitter {
  private process: ChildProcess | null = null;
  private progressParser: ProgressParser;
  private ffmpegPath: string;
  private killed: boolean = false;

  constructor(ffmpegPath: string = 'ffmpeg') {
    super();
    this.ffmpegPath = ffmpegPath;
    this.progressParser = new ProgressParser();
  }

  /**
   * Execute FFmpeg conversion with progress tracking
   */
  async execute(config: ConversionConfig, callbacks?: ConversionCallbacks): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Validate config
        const validation = CommandGenerator.validate(config);
        if (!validation.valid) {
          throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
        }

        // Prepare input (handle Buffer/Stream)
        const inputInfo = await prepareInput(config.input);
        const inputPath = getInputPath(inputInfo);

        // Generate command arguments
        const args = CommandGenerator.generate({
          ...config,
          input: inputPath,
        });

        // Emit/callback start event
        const commandString = `${this.ffmpegPath} ${args.join(' ')}`;
        this.emit('start', commandString);
        callbacks?.onStart?.(commandString);

        // Spawn FFmpeg process
        this.process = spawn(this.ffmpegPath, args);
        this.killed = false;

        // Collect stderr for progress and errors
        let stderrData = '';

        // Handle stdout (usually not used, but capture just in case)
        this.process.stdout?.on('data', (_data: Buffer) => {
          // FFmpeg outputs to stderr, not stdout usually
        });

        // Handle stderr (progress and errors)
        this.process.stderr?.on('data', (data: Buffer) => {
          const text = data.toString();
          stderrData += text;

          // Parse each line
          const lines = text.split('\n');
          lines.forEach(line => {
            if (!line.trim()) return;

            // Parse duration from metadata
            this.progressParser.parseDuration(line);

            // Parse progress
            const progress = this.progressParser.parseProgress(line);
            if (progress) {
              this.emit('progress', progress);
              callbacks?.onProgress?.(progress);
            }

            // Check for errors
            if (this.progressParser.isError(line)) {
              // Don't emit error yet, wait for process exit
              // Some "errors" are just warnings
            }
          });
        });

        // Handle process exit
        this.process.on('close', (code: number | null) => {
          // Cleanup temporary files
          if (inputInfo.tempPath) {
            cleanupInput(inputInfo);
          }

          // Check if process was killed by user
          if (this.killed) {
            const error = new FFmpegExecutionError(
              'Conversion was cancelled',
              commandString,
              'Process killed by user'
            );
            this.emit('error', error);
            callbacks?.onError?.(error);
            reject(error);
            return;
          }

          // Check exit code
          if (code === 0) {
            // Success
            this.emit('end');
            callbacks?.onEnd?.();
            resolve();
          } else {
            // Error
            const error = new FFmpegExecutionError(
              `FFmpeg process exited with code ${code}`,
              commandString,
              stderrData
            );
            this.emit('error', error);
            callbacks?.onError?.(error);
            reject(error);
          }

          this.process = null;
        });

        // Handle process errors
        this.process.on('error', (err: Error) => {
          // Cleanup temporary files
          if (inputInfo.tempPath) {
            cleanupInput(inputInfo);
          }

          const error = new FFmpegExecutionError(
            `Failed to start FFmpeg: ${err.message}`,
            commandString
          );
          this.emit('error', error);
          callbacks?.onError?.(error);
          reject(error);
        });

        // Note: Streams are already written to tempPath by prepareInput
      } catch (err) {
        const error =
          err instanceof Error
            ? new FFmpegExecutionError(err.message)
            : new FFmpegExecutionError('Unknown error during execution');

        this.emit('error', error);
        callbacks?.onError?.(error);
        reject(error);
      }
    });
  }

  /**
   * Execute and return output as Buffer
   */
  async executeToBuffer(
    config: Omit<ConversionConfig, 'output'>,
    callbacks?: ConversionCallbacks
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const chunks: Buffer[] = [];

      // Configure to output to pipe
      const pipeConfig: ConversionConfig = {
        ...config,
        output: 'pipe:1',
      };

      try {
        // Validate and generate command
        const validation = CommandGenerator.validate(pipeConfig);
        if (!validation.valid) {
          throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
        }

        const inputInfo = await prepareInput(config.input);
        const inputPath = getInputPath(inputInfo);
        const args = CommandGenerator.generate({
          ...pipeConfig,
          input: inputPath,
        });

        const commandString = `${this.ffmpegPath} ${args.join(' ')}`;
        this.emit('start', commandString);
        callbacks?.onStart?.(commandString);

        // Spawn process
        this.process = spawn(this.ffmpegPath, args);
        this.killed = false;

        // Collect stdout (actual video data)
        this.process.stdout?.on('data', (data: Buffer) => {
          chunks.push(data);
        });

        // Handle stderr (progress)
        let stderrData = '';
        this.process.stderr?.on('data', (data: Buffer) => {
          const text = data.toString();
          stderrData += text;

          const lines = text.split('\n');
          lines.forEach(line => {
            if (!line.trim()) return;

            this.progressParser.parseDuration(line);
            const progress = this.progressParser.parseProgress(line);
            if (progress) {
              this.emit('progress', progress);
              callbacks?.onProgress?.(progress);
            }
          });
        });

        // Handle completion
        this.process.on('close', (code: number | null) => {
          if (inputInfo.tempPath) {
            cleanupInput(inputInfo);
          }

          if (this.killed) {
            reject(new FFmpegExecutionError('Conversion was cancelled'));
            return;
          }

          if (code === 0) {
            const buffer = Buffer.concat(chunks);
            this.emit('end');
            callbacks?.onEnd?.();
            resolve(buffer);
          } else {
            const error = new FFmpegExecutionError(
              `FFmpeg process exited with code ${code}`,
              commandString,
              stderrData
            );
            this.emit('error', error);
            callbacks?.onError?.(error);
            reject(error);
          }

          this.process = null;
        });

        // Handle errors
        this.process.on('error', (err: Error) => {
          if (inputInfo.tempPath) {
            cleanupInput(inputInfo);
          }

          const error = new FFmpegExecutionError(
            `Failed to start FFmpeg: ${err.message}`,
            commandString
          );
          reject(error);
        });

        // Note: Streams are already written to tempPath by prepareInput
      } catch (err) {
        const error =
          err instanceof Error
            ? new FFmpegExecutionError(err.message)
            : new FFmpegExecutionError('Unknown error');
        reject(error);
      }
    });
  }

  /**
   * Cancel running conversion
   */
  cancel(): void {
    if (this.process && !this.killed) {
      this.killed = true;

      // Send 'q' to FFmpeg for graceful shutdown
      this.process.stdin?.write('q');

      // If it doesn't respond in 2 seconds, force kill
      setTimeout(() => {
        if (this.process) {
          this.process.kill('SIGKILL');
        }
      }, 2000);
    }
  }

  /**
   * Check if conversion is running
   */
  isRunning(): boolean {
    return this.process !== null && !this.killed;
  }
}

/**
 * Batch execution engine for multiple conversions
 */
export class BatchExecutionEngine {
  private ffmpegPath: string;

  constructor(ffmpegPath: string = 'ffmpeg') {
    this.ffmpegPath = ffmpegPath;
  }

  /**
   * Execute multiple conversions sequentially
   */
  async executeBatch(
    configs: ConversionConfig[],
    callbacks?: {
      onProgress?: (index: number, progress: ProgressInfo) => void;
      onFileComplete?: (index: number) => void;
      onFileError?: (index: number, error: Error) => void;
      onComplete?: () => void;
    }
  ): Promise<void> {
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const engine = new ExecutionEngine(this.ffmpegPath);

      try {
        await engine.execute(config, {
          onProgress: progress => {
            callbacks?.onProgress?.(i, progress);
          },
        });

        callbacks?.onFileComplete?.(i);
      } catch (error) {
        callbacks?.onFileError?.(i, error as Error);
        // Continue with next file even if one fails
      }
    }

    callbacks?.onComplete?.();
  }

  /**
   * Execute multiple conversions in parallel
   */
  async executeBatchParallel(
    configs: ConversionConfig[],
    maxConcurrent: number = 2,
    callbacks?: {
      onProgress?: (index: number, progress: ProgressInfo) => void;
      onFileComplete?: (index: number) => void;
      onFileError?: (index: number, error: Error) => void;
      onComplete?: () => void;
    }
  ): Promise<void> {
    const results: Promise<void>[] = [];
    const executing: Promise<void>[] = [];

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      const engine = new ExecutionEngine(this.ffmpegPath);

      const promise = engine
        .execute(config, {
          onProgress: progress => {
            callbacks?.onProgress?.(i, progress);
          },
        })
        .then(() => {
          callbacks?.onFileComplete?.(i);
        })
        .catch(error => {
          callbacks?.onFileError?.(i, error);
        });

      results.push(promise);
      executing.push(promise);

      // Remove from executing when done
      promise.finally(() => {
        executing.splice(executing.indexOf(promise), 1);
      });

      // Wait if we've hit max concurrent
      if (executing.length >= maxConcurrent) {
        await Promise.race(executing);
      }
    }

    // Wait for all to complete
    await Promise.all(results);
    callbacks?.onComplete?.();
  }
}
