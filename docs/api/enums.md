# Enums Reference

All available enums for type-safe configuration.

## VideoCodec

```typescript
enum VideoCodec {
  // Software (CPU)
  H264 = 'libx264',
  H265 = 'libx265',
  VP8 = 'libvpx',
  VP9 = 'libvpx-vp9',
  AV1 = 'libaom-av1',
  AV1_SVT = 'libsvtav1',
  MPEG4 = 'mpeg4',
  MPEG2 = 'mpeg2video',
  
  // Hardware - NVIDIA
  H264_NVENC = 'h264_nvenc',
  HEVC_NVENC = 'hevc_nvenc',
  AV1_NVENC = 'av1_nvenc',
  
  // Hardware - Intel QSV
  H264_QSV = 'h264_qsv',
  HEVC_QSV = 'hevc_qsv',
  
  // Hardware - AMD AMF
  H264_AMF = 'h264_amf',
  HEVC_AMF = 'hevc_amf',
  
  // Hardware - VAAPI
  H264_VAAPI = 'h264_vaapi',
  HEVC_VAAPI = 'hevc_vaapi',
  
  // Hardware - VideoToolbox
  H264_VIDEOTOOLBOX = 'h264_videotoolbox',
  HEVC_VIDEOTOOLBOX = 'hevc_videotoolbox',
  
  COPY = 'copy',
}
```

## AudioCodec

```typescript
enum AudioCodec {
  AAC = 'aac',
  MP3 = 'libmp3lame',
  OPUS = 'libopus',
  VORBIS = 'libvorbis',
  FLAC = 'flac',
  AC3 = 'ac3',
  COPY = 'copy',
}
```

## OutputFormat

```typescript
enum OutputFormat {
  MP4 = 'mp4',
  WEBM = 'webm',
  MKV = 'matroska',
  AVI = 'avi',
  MOV = 'mov',
  FLV = 'flv',
  MP3 = 'mp3',
  WAV = 'wav',
}
```

## Resolution

```typescript
enum Resolution {
  UHD8K = '7680x4320',
  UHD4K = '3840x2160',
  QHD = '2560x1440',
  HD1080 = '1920x1080',
  HD720 = '1280x720',
  SD480 = '854x480',
  SD360 = '640x360',
}
```

## VideoPreset

```typescript
enum VideoPreset {
  ULTRAFAST = 'ultrafast',
  SUPERFAST = 'superfast',
  VERYFAST = 'veryfast',
  FASTER = 'faster',
  FAST = 'fast',
  MEDIUM = 'medium',
  SLOW = 'slow',
  SLOWER = 'slower',
  VERYSLOW = 'veryslow',
}
```

## VideoProfile

```typescript
enum VideoProfile {
  BASELINE = 'baseline',
  MAIN = 'main',
  HIGH = 'high',
  HIGH10 = 'high10',
  HIGH422 = 'high422',
  HIGH444 = 'high444',
}
```

## PixelFormat

```typescript
enum PixelFormat {
  YUV420P = 'yuv420p',
  YUV422P = 'yuv422p',
  YUV444P = 'yuv444p',
  YUV420P10LE = 'yuv420p10le',
  RGB24 = 'rgb24',
  RGBA = 'rgba',
}
```

## Color

```typescript
enum Color {
  WHITE = 'white',
  BLACK = 'black',
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  YELLOW = 'yellow',
  CYAN = 'cyan',
  MAGENTA = 'magenta',
}
```

## FrameRate

```typescript
enum FrameRate {
  FPS15 = 15,
  FPS24 = 24,
  FPS25 = 25,
  FPS30 = 30,
  FPS60 = 60,
  FPS120 = 120,
}
```

## SampleRate

```typescript
enum SampleRate {
  HZ8000 = 8000,
  HZ11025 = 11025,
  HZ22050 = 22050,
  HZ44100 = 44100,
  HZ48000 = 48000,
  HZ96000 = 96000,
}
```

## AudioChannels

```typescript
enum AudioChannels {
  MONO = 1,
  STEREO = 2,
  SURROUND_5_1 = 6,
  SURROUND_7_1 = 8,
}
```

## See Also

- [Video Configuration](/api/video-config)
- [Audio Configuration](/api/audio-config)
- [Conversion Config](/api/conversion-config)

