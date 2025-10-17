import { FFmpeg, VideoCodec, AudioCodec, ScalingAlgorithm, Presets } from '../src/index';
import { existsSync, mkdirSync } from 'fs';

async function main() {
  console.log('🎬 Real FFmpeg Conversion Test\n');
  
  const ffmpeg = new FFmpeg();
  
  // Setup
  const inputFile = 'tests/fixtures/short/mp4/h264/720p.mp4';
  const outputDir = 'tests/output';
  
  if (!existsSync(inputFile)) {
    console.error('❌ Test file not found. Run: npm run fixtures:generate');
    return;
  }
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Test 1: Simple conversion with progress
  console.log('=== Test 1: Simple Conversion with Progress ===\n');
  
  try {
    await ffmpeg.convert(
      {
        input: inputFile,
        output: `${outputDir}/simple.mp4`,
        video: {
          codec: VideoCodec.H264,
          bitrate: '1M',
          preset: 'ultrafast',
        },
        audio: {
          codec: AudioCodec.AAC,
          bitrate: '128k',
        },
      },
      {
        onStart: (command) => {
          console.log('Starting conversion...');
          console.log(`Command: ${command.substring(0, 100)}...`);
          console.log('');
        },
        onProgress: (progress) => {
          // Update same line
          if (progress?.percent !== undefined) {
            process.stdout.write(`\r⏳ Progress: ${progress.percent.toFixed(1)}% | FPS: ${progress.currentFps || 0} | Time: ${progress.timemark || '00:00:00'}`);
          }
        },
        onEnd: () => {
          console.log('\n✅ Conversion complete!\n');
        },
        onError: (error) => {
          console.error('\n❌ Error:', error.message);
        },
      }
    );
  } catch (error) {
    console.error('Conversion failed:', (error as Error).message);
  }
  
  // Test 2: Extract audio only
  console.log('=== Test 2: Extract Audio Only ===\n');
  
  try {
    await ffmpeg.convert(
      {
        input: inputFile,
        output: `${outputDir}/audio.mp3`,
        video: {
          disabled: true,
        },
        audio: {
          codec: AudioCodec.MP3,
          bitrate: '192k',
        },
      },
      {
        onProgress: (progress) => {
          if (progress?.percent !== undefined) {
            process.stdout.write(`\r⏳ Extracting: ${progress.percent.toFixed(1)}%`);
          }
        },
        onEnd: () => {
          console.log('\n✅ Audio extracted!\n');
        },
      }
    );
  } catch (error) {
    console.error('Failed:', (error as Error).message);
  }
  
  // Test 3: Trim video (fast with copy)
  console.log('=== Test 3: Trim Video (No Re-encode) ===\n');
  
  try {
    await ffmpeg.convert(
      {
        input: inputFile,
        output: `${outputDir}/trimmed.mp4`,
        timing: {
          seek: 5,
          duration: 5,
          fastSeek: true,
        },
        video: {
          codec: VideoCodec.COPY,
        },
        audio: {
          codec: AudioCodec.COPY,
        },
      },
      {
        onProgress: (progress) => {
          if (progress?.percent !== undefined) {
            process.stdout.write(`\r⏳ Trimming: ${progress.percent.toFixed(1)}%`);
          }
        },
        onEnd: () => {
          console.log('\n✅ Video trimmed (super fast with copy)!\n');
        },
      }
    );
  } catch (error) {
    console.error('Failed:', (error as Error).message);
  }
  
  // Test 4: Resize and enhance
  console.log('=== Test 4: Resize with Enhancement ===\n');
  
  try {
    await ffmpeg.convert(
      {
        input: inputFile,
        output: `${outputDir}/enhanced-480p.mp4`,
        video: {
          codec: VideoCodec.H264,
          preset: 'ultrafast',
          filters: {
            scale: {
              width: 854,
              height: 480,
              algorithm: ScalingAlgorithm.LANCZOS,
            },
            color: {
              contrast: 1.1,
              saturation: 1.05,
            },
            sharpen: {
              luma_amount: 1.0,
            },
          },
        },
        audio: {
          codec: AudioCodec.AAC,
          bitrate: '128k',
        },
      },
      {
        onProgress: (progress) => {
          if (progress?.percent !== undefined) {
            process.stdout.write(`\r⏳ Enhancing: ${progress.percent.toFixed(1)}% | ${progress.currentFps || 0} fps`);
          }
        },
        onEnd: () => {
          console.log('\n✅ Video enhanced!\n');
        },
      }
    );
  } catch (error) {
    console.error('Failed:', (error as Error).message);
  }
  
  // Test 5: Using preset
  console.log('=== Test 5: Using Preset (Instagram Story) ===\n');
  
  try {
    await ffmpeg.convert(
      {
        input: inputFile,
        output: `${outputDir}/story.mp4`,
        ...Presets.instagramStory.config,
      },
      {
        onProgress: (progress) => {
          if (progress?.percent !== undefined) {
            process.stdout.write(`\r⏳ Creating story: ${progress.percent.toFixed(1)}%`);
          }
        },
        onEnd: () => {
          console.log('\n✅ Instagram story ready!\n');
        },
      }
    );
  } catch (error) {
    console.error('Failed:', (error as Error).message);
  }
  
  // Test 6: Validate before converting
  console.log('=== Test 6: Validation Test ===\n');
  
  const invalidConfig = {
    input: inputFile,
    output: `${outputDir}/test.mp4`,
    video: {
      upscale: {
        algorithm: ScalingAlgorithm.LANCZOS,
        targetWidth: 1920,
        targetHeight: 1080,
      },
      downscale: {
        algorithm: ScalingAlgorithm.LANCZOS,
        targetWidth: 640,
        targetHeight: 480,
      },
    },
  };
  
  const validation = ffmpeg.validateConfig(invalidConfig as any);
  console.log('Valid:', validation.valid);
  if (!validation.valid) {
    console.log('Errors:', validation.errors);
  }
  console.log('');
  
  // Test 7: Dry run (build command without executing)
  console.log('=== Test 7: Dry Run (Command Preview) ===\n');
  
  const command = ffmpeg.buildCommand({
    input: inputFile,
    output: `${outputDir}/preview.mp4`,
    video: {
      codec: VideoCodec.H265,
      bitrate: '2M',
    },
    audio: {
      codec: AudioCodec.AAC,
    },
  });
  
  console.log('Command that would be executed:');
  console.log(command);
  console.log('');
  
  // Test 8: Batch conversion
  console.log('=== Test 8: Batch Conversion ===\n');
  
  try {
    await ffmpeg.convertBatch(
      [
        {
          input: inputFile,
          output: `${outputDir}/batch-1.mp4`,
          video: { codec: VideoCodec.H264, bitrate: '500k', preset: 'ultrafast' },
          audio: { codec: AudioCodec.AAC, bitrate: '64k' },
        },
        {
          input: inputFile,
          output: `${outputDir}/batch-2.mp4`,
          video: { codec: VideoCodec.H264, bitrate: '1M', preset: 'ultrafast' },
          audio: { codec: AudioCodec.AAC, bitrate: '128k' },
        },
      ],
      {
        onProgress: (index, progress) => {
          if (progress?.percent !== undefined) {
            process.stdout.write(`\r⏳ File ${index + 1}/2: ${progress.percent.toFixed(1)}%`);
          }
        },
        onFileComplete: (index) => {
          console.log(`\n✅ File ${index + 1} complete!`);
        },
        onComplete: () => {
          console.log('✅ All batch conversions complete!\n');
        },
      }
    );
  } catch (error) {
    console.error('Batch failed:', (error as Error).message);
  }
  
  console.log('🎉 All tests complete!');
  console.log(`\nCheck output files in: ${outputDir}/`);
}

main().catch(console.error);

