/**
 * Base class for all FFmpeg-related errors
 */
export class FFmpegError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'FFmpegError';
    Object.setPrototypeOf(this, FFmpegError.prototype);
  }
}

/**
 * Thrown when FFmpeg binary is not found or not accessible
 */
export class FFmpegNotFoundError extends FFmpegError {
  constructor(path: string) {
    super(`FFmpeg binary not found at: ${path}`, 'FFMPEG_NOT_FOUND');
    this.name = 'FFmpegNotFoundError';
    Object.setPrototypeOf(this, FFmpegNotFoundError.prototype);
  }
}

/**
 * Thrown when FFprobe binary is not found or not accessible
 */
export class FFprobeNotFoundError extends FFmpegError {
  constructor(path: string) {
    super(`FFprobe binary not found at: ${path}`, 'FFPROBE_NOT_FOUND');
    this.name = 'FFprobeNotFoundError';
    Object.setPrototypeOf(this, FFprobeNotFoundError.prototype);
  }
}

/**
 * Thrown when FFmpeg command execution fails
 */
export class FFmpegExecutionError extends FFmpegError {
  constructor(
    message: string,
    public readonly command?: string,
    public readonly stderr?: string
  ) {
    super(message, 'EXECUTION_FAILED');
    this.name = 'FFmpegExecutionError';
    Object.setPrototypeOf(this, FFmpegExecutionError.prototype);
  }
}

/**
 * Thrown when a codec is not supported
 */
export class CodecNotSupportedError extends FFmpegError {
  constructor(
    public readonly codec: string,
    public readonly type: 'video' | 'audio' | 'subtitle',
    public readonly operation: 'encode' | 'decode'
  ) {
    super(`Codec '${codec}' is not supported for ${operation}ing ${type}`, 'CODEC_NOT_SUPPORTED');
    this.name = 'CodecNotSupportedError';
    Object.setPrototypeOf(this, CodecNotSupportedError.prototype);
  }
}

/**
 * Thrown when a format is not supported
 */
export class FormatNotSupportedError extends FFmpegError {
  constructor(
    public readonly format: string,
    public readonly operation: 'mux' | 'demux'
  ) {
    super(`Format '${format}' is not supported for ${operation}ing`, 'FORMAT_NOT_SUPPORTED');
    this.name = 'FormatNotSupportedError';
    Object.setPrototypeOf(this, FormatNotSupportedError.prototype);
  }
}

/**
 * Thrown when input file is invalid or not found
 */
export class InvalidInputError extends FFmpegError {
  constructor(
    public readonly inputPath: string,
    reason: string
  ) {
    super(`Invalid input file '${inputPath}': ${reason}`, 'INVALID_INPUT');
    this.name = 'InvalidInputError';
    Object.setPrototypeOf(this, InvalidInputError.prototype);
  }
}

/**
 * Thrown when output configuration is invalid
 */
export class InvalidOutputError extends FFmpegError {
  constructor(
    public readonly outputPath: string,
    reason: string
  ) {
    super(`Invalid output configuration for '${outputPath}': ${reason}`, 'INVALID_OUTPUT');
    this.name = 'InvalidOutputError';
    Object.setPrototypeOf(this, InvalidOutputError.prototype);
  }
}

/**
 * Thrown when hardware acceleration is not available
 */
export class HardwareAccelerationError extends FFmpegError {
  constructor(public readonly accelerationType: string) {
    super(
      `Hardware acceleration '${accelerationType}' is not available`,
      'HARDWARE_ACCEL_NOT_AVAILABLE'
    );
    this.name = 'HardwareAccelerationError';
    Object.setPrototypeOf(this, HardwareAccelerationError.prototype);
  }
}
