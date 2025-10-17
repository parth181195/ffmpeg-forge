import { CommandGenerator } from '../src/utils/command-generator';
import { VideoCodec, AudioCodec, OutputFormat, ScalingAlgorithm } from '../src/index';
import { Presets } from '../src/presets';
import type { ConversionConfig } from '../src/types/conversion-config';

console.log('🎬 Command Generator Test\n');

// Test 1: Simple Conversion
console.log('=== Test 1: Simple Conversion ===');
const simpleConfig: ConversionConfig = {
  input: 'input.mp4',
  output: 'output.mp4',
  video: {
    codec: VideoCodec.H264,
    bitrate: '2M',
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '128k',
  },
};

const simpleCmd = CommandGenerator.generateCommandString(simpleConfig);
console.log(simpleCmd);
console.log('');

// Test 2: With Filters and Upscaling
console.log('=== Test 2: Upscale HD to 4K with Enhancement ===');
const upscaleConfig: ConversionConfig = {
  input: 'hd-video.mp4',
  output: '4k-video.mp4',
  video: {
    codec: VideoCodec.H265,
    bitrate: '15M',
    upscale: {
      algorithm: ScalingAlgorithm.LANCZOS,
      targetWidth: 3840,
      targetHeight: 2160,
      enhanceSharpness: true,
      denoiseBeforeScale: true,
      sharpnessAmount: 1.5,
    },
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '192k',
  },
};

const upscaleCmd = CommandGenerator.generateCommandString(upscaleConfig);
console.log(upscaleCmd);
console.log('');

// Test 3: Complete Enhancement Pipeline
console.log('=== Test 3: Complete Video Enhancement ===');
const enhancedConfig: ConversionConfig = {
  input: 'raw-footage.mp4',
  output: 'polished.mp4',
  video: {
    codec: VideoCodec.H264,
    bitrate: '5M',
    preset: 'slow',
    filters: {
      deinterlace: {
        mode: 'yadif',
      },
      denoise: {
        filter: 'hqdn3d',
        luma_spatial: 3,
      },
      color: {
        brightness: 0.05,
        contrast: 1.1,
        saturation: 1.05,
      },
      sharpen: {
        luma_amount: 1.2,
      },
      watermark: {
        input: 'logo.png',
        x: 'main_w-overlay_w-20',
        y: 20,
        opacity: 0.8,
      },
    },
  },
  audio: {
    codec: AudioCodec.AAC,
    bitrate: '192k',
    volumeNormalization: true,
  },
};

const enhancedCmd = CommandGenerator.generateCommandString(enhancedConfig);
console.log(enhancedCmd);
console.log('');

// Test 4: Extract Audio Only
console.log('=== Test 4: Extract Audio ===');
const audioConfig: ConversionConfig = {
  input: 'video.mp4',
  output: 'audio.mp3',
  video: {
    disabled: true,
  },
  audio: {
    codec: AudioCodec.MP3,
    bitrate: '192k',
  },
};

const audioCmd = CommandGenerator.generateCommandString(audioConfig);
console.log(audioCmd);
console.log('');

// Test 5: Trim Video (with fast seek)
console.log('=== Test 5: Trim Video (Fast) ===');
const trimConfig: ConversionConfig = {
  input: 'long-video.mp4',
  output: 'clip.mp4',
  timing: {
    seek: '00:01:30',
    duration: '00:00:30',
    fastSeek: true,
  },
  video: {
    codec: VideoCodec.COPY,  // No re-encoding
  },
  audio: {
    codec: AudioCodec.COPY,
  },
};

const trimCmd = CommandGenerator.generateCommandString(trimConfig);
console.log(trimCmd);
console.log('');

// Test 6: YouTube Preset
console.log('=== Test 6: YouTube Preset ===');
const youtubeConfig: ConversionConfig = {
  input: 'video.mp4',
  output: 'youtube.mp4',
  ...Presets.youtube.config,
};

const youtubeCmd = CommandGenerator.generateCommandString(youtubeConfig);
console.log(youtubeCmd);
console.log('');

// Test 7: Instagram Story Preset
console.log('=== Test 7: Instagram Story Preset ===');
const storyConfig: ConversionConfig = {
  input: 'video.mp4',
  output: 'story.mp4',
  ...Presets.instagramStory.config,
};

const storyCmd = CommandGenerator.generateCommandString(storyConfig);
console.log(storyCmd);
console.log('');

// Test 8: GIF Conversion
console.log('=== Test 8: GIF Animation ===');
const gifConfig: ConversionConfig = {
  input: 'video.mp4',
  output: 'animation.gif',
  ...Presets.gif.config,
};

const gifCmd = CommandGenerator.generateCommandString(gifConfig);
console.log(gifCmd);
console.log('');

// Test 9: Complex Filters
console.log('=== Test 9: Picture-in-Picture ===');
const pipConfig: ConversionConfig = {
  input: 'main.mp4',
  output: 'pip.mp4',
  complexFilters: [
    {
      inputs: ['0:v', '1:v'],
      filter: 'overlay',
      options: {
        x: 'main_w-overlay_w-10',
        y: 'main_h-overlay_h-10',
      },
      outputs: ['v'],
    },
  ],
};

const pipCmd = CommandGenerator.generateCommandString(pipConfig);
console.log(pipCmd);
console.log('');

// Test 10: Validation
console.log('=== Test 10: Config Validation ===');
const invalidConfig: ConversionConfig = {
  input: 'video.mp4',
  output: 'output.mp4',
  video: {
    upscale: {
      algorithm: ScalingAlgorithm.LANCZOS,
      targetWidth: 3840,
      targetHeight: 2160,
    },
    downscale: {  // Invalid: both upscale and downscale
      algorithm: ScalingAlgorithm.LANCZOS,
      targetWidth: 1920,
      targetHeight: 1080,
    },
  },
};

const validation = CommandGenerator.validate(invalidConfig);
console.log('Valid:', validation.valid);
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}
console.log('');

// List all presets
console.log('=== Available Presets ===');
import { listPresets } from '../src/presets';
const presets = listPresets();
presets.forEach(preset => {
  console.log(`- ${preset.key}: ${preset.name}`);
  console.log(`  ${preset.description}`);
});

console.log('\n✅ Command generator tests complete!');

