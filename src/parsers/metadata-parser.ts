import type {
  MediaMetadata,
  StreamMetadata,
  FormatMetadata,
  VideoMetadata,
  ImageMetadata,
} from '../types/metadata';

/**
 * Parse FFprobe JSON output into MediaMetadata
 */
export function parseMediaMetadata(jsonOutput: string): MediaMetadata {
  const data = JSON.parse(jsonOutput);

  const format: FormatMetadata = {
    filename: data.format.filename,
    formatName: data.format.format_name,
    formatLongName: data.format.format_long_name,
    startTime: data.format.start_time,
    duration: data.format.duration,
    size: data.format.size,
    bitRate: data.format.bit_rate,
    probeScore: data.format.probe_score,
    tags: data.format.tags || {},
  };

  const streams: StreamMetadata[] = (data.streams || []).map((stream: any) => ({
    index: stream.index,
    codecName: stream.codec_name,
    codecLongName: stream.codec_long_name,
    codecType: stream.codec_type,
    codecTag: stream.codec_tag_string,

    // Video specific
    width: stream.width,
    height: stream.height,
    codedWidth: stream.coded_width,
    codedHeight: stream.coded_height,
    displayAspectRatio: stream.display_aspect_ratio,
    pixelFormat: stream.pix_fmt,
    frameRate: stream.r_frame_rate,
    avgFrameRate: stream.avg_frame_rate,

    // Audio specific
    sampleRate: stream.sample_rate,
    channels: stream.channels,
    channelLayout: stream.channel_layout,
    bitsPerSample: stream.bits_per_sample,

    // Common
    duration: stream.duration,
    durationTs: stream.duration_ts,
    startTime: stream.start_time,
    startPts: stream.start_pts,
    bitrate: stream.bit_rate,
    tags: stream.tags || {},
    
    // Side data (rotation, etc.)
    sideDataList: stream.side_data_list || stream.sideDataList || undefined,
  }));

  return { format, streams };
}

/**
 * Parse media metadata into VideoMetadata
 */
export function parseVideoMetadata(metadata: MediaMetadata): VideoMetadata {
  const videoStreams = metadata.streams.filter(s => s.codecType === 'video');
  const audioStreams = metadata.streams.filter(s => s.codecType === 'audio');
  const subtitleStreams = metadata.streams.filter(s => s.codecType === 'subtitle');

  if (videoStreams.length === 0) {
    throw new Error('No video stream found in media file');
  }

  const primaryVideo = videoStreams[0];
  const primaryAudio = audioStreams[0];

  // Parse frame rate
  let frameRate = 0;
  if (primaryVideo.avgFrameRate) {
    const [num, den] = primaryVideo.avgFrameRate.split('/').map(Number);
    frameRate = den > 0 ? num / den : 0;
  }

  // Parse duration
  const duration = parseFloat(metadata.format.duration || '0');

  // Parse bitrate
  const bitrate = parseInt(metadata.format.bitRate || '0', 10) / 1000; // Convert to kbps

  // Parse size
  const size = parseInt(metadata.format.size || '0', 10);

  // Extract rotation from tags or side_data
  let rotation: number | undefined = undefined;
  
  // First check stream tags (older formats)
  if (primaryVideo.tags?.rotate) {
    rotation = parseInt(primaryVideo.tags.rotate, 10) || undefined;
  }
  
  // Then check side_data (MOV files from iOS devices)
  if (rotation === undefined && primaryVideo.sideDataList && primaryVideo.sideDataList.length > 0) {
    const displayMatrix = primaryVideo.sideDataList.find(
      (data: any) => data.side_data_type === 'Display Matrix' || data.sideDataType === 'Display Matrix'
    );
    if (displayMatrix && displayMatrix.rotation !== undefined) {
      rotation = Math.round(displayMatrix.rotation);
    }
  }

  return {
    format: metadata.format,
    videoStreams,
    audioStreams,
    subtitleStreams,
    duration,
    width: primaryVideo.width || 0,
    height: primaryVideo.height || 0,
    frameRate,
    videoCodec: primaryVideo.codecName,
    audioCodec: primaryAudio?.codecName,
    bitrate,
    size,
    rotation,
  };
}

/**
 * Parse media metadata into ImageMetadata
 */
export function parseImageMetadata(metadata: MediaMetadata): ImageMetadata {
  const videoStreams = metadata.streams.filter(s => s.codecType === 'video');

  if (videoStreams.length === 0) {
    throw new Error('No image stream found in file');
  }

  const primaryStream = videoStreams[0];
  const size = parseInt(metadata.format.size || '0', 10);

  return {
    format: metadata.format,
    width: primaryStream.width || 0,
    height: primaryStream.height || 0,
    pixelFormat: primaryStream.pixelFormat || 'unknown',
    codec: primaryStream.codecName,
    size,
  };
}
