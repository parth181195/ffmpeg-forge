import { FFmpeg, VideoCodec, AudioCodec, HardwareAcceleration } from '../src/index';
import { 
  detectHardwareAcceleration, 
  getHardwareAccelerationInfo,
  autoSelectHardwareEncoding,
} from '../src/utils/hardware-acceleration-helper';
import { existsSync, mkdirSync } from 'fs';

async function main() {
  console.log('🎮 Hardware Acceleration Test\n');
  
  const ffmpeg = new FFmpeg();
  const ffmpegPath = FFmpeg.getFFmpegPath();
  
  // Test file
  const inputFile = 'tests/fixtures/short/mp4/h264/720p.mp4';
  const outputDir = 'tests/output';
  
  if (!existsSync(inputFile)) {
    console.error('❌ Test file not found. Run: npm run fixtures:generate');
    return;
  }
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Step 1: Detect available hardware acceleration
  console.log('=== Step 1: Hardware Detection ===\n');
  
  const hwInfo = getHardwareAccelerationInfo(ffmpegPath);
  
  console.log('Available hardware acceleration:');
  if (hwInfo.available.length === 0) {
    console.log('  ⚠️  No hardware acceleration detected');
    console.log('  Using CPU encoding only\n');
  } else {
    hwInfo.available.forEach(hw => {
      console.log(`  ✓ ${hw}`);
      const codecs = hwInfo.capabilities[hw];
      if (codecs && codecs.length > 0) {
        console.log(`    Codecs: ${codecs.slice(0, 5).join(', ')}${codecs.length > 5 ? '...' : ''}`);
      }
    });
    console.log('');
    console.log(`Best available: ${hwInfo.best}`);
    console.log('');
  }
  
  // Step 2: Auto-select hardware encoding
  console.log('=== Step 2: Auto-Selection Test ===\n');
  
  const h264Selection = autoSelectHardwareEncoding(VideoCodec.H264, ffmpegPath);
  console.log('H.264 encoding:');
  console.log(`  Codec: ${h264Selection.codec}`);
  console.log(`  Hardware: ${h264Selection.isHardware ? 'Yes' : 'No'}`);
  if (h264Selection.acceleration) {
    console.log(`  Acceleration: ${h264Selection.acceleration}`);
  }
  console.log('');
  
  const h265Selection = autoSelectHardwareEncoding(VideoCodec.H265, ffmpegPath);
  console.log('H.265 encoding:');
  console.log(`  Codec: ${h265Selection.codec}`);
  console.log(`  Hardware: ${h265Selection.isHardware ? 'Yes' : 'No'}`);
  if (h265Selection.acceleration) {
    console.log(`  Acceleration: ${h265Selection.acceleration}`);
  }
  console.log('');
  
  // Step 3: CPU vs GPU conversion benchmark
  if (hwInfo.available.length > 0) {
    console.log('=== Step 3: CPU vs GPU Benchmark ===\n');
    
    // CPU conversion
    console.log('Converting with CPU (H.264)...');
    const cpuStart = Date.now();
    
    await ffmpeg.convert(
      {
        input: inputFile,
        output: `${outputDir}/cpu-h264.mp4`,
        video: {
          codec: VideoCodec.H264,
          bitrate: '2M',
          preset: 'ultrafast',
        },
        audio: {
          codec: AudioCodec.AAC,
          bitrate: '128k',
        },
      },
      {
        onProgress: (progress) => {
          if (progress?.percent !== undefined) {
            process.stdout.write(`\r  ⏳ CPU: ${progress.percent.toFixed(1)}% | ${progress.currentFps || 0} fps`);
          }
        },
      }
    );
    
    const cpuTime = Date.now() - cpuStart;
    console.log(`\n  ⏱️  CPU time: ${(cpuTime / 1000).toFixed(2)}s\n`);
    
    // GPU conversion
    console.log('Converting with GPU (Hardware Accelerated)...');
    const gpuStart = Date.now();
    
    await ffmpeg.convert(
      {
        input: inputFile,
        output: `${outputDir}/gpu-h264.mp4`,
        video: {
          codec: VideoCodec.H264,
          bitrate: '2M',
          preset: 'fast',
        },
        audio: {
          codec: AudioCodec.AAC,
          bitrate: '128k',
        },
        hardwareAcceleration: {
          enabled: true,
          preferHardware: true,
          fallbackToCPU: true,
        },
      },
      {
        onStart: (cmd) => {
          const codecMatch = cmd.match(/-c:v\s+(\S+)/);
          if (codecMatch) {
            console.log(`  Using codec: ${codecMatch[1]}`);
          }
        },
        onProgress: (progress) => {
          if (progress?.percent !== undefined) {
            process.stdout.write(`\r  ⏳ GPU: ${progress.percent.toFixed(1)}% | ${progress.currentFps || 0} fps`);
          }
        },
      }
    );
    
    const gpuTime = Date.now() - gpuStart;
    console.log(`\n  ⏱️  GPU time: ${(gpuTime / 1000).toFixed(2)}s`);
    
    // Show speedup
    const speedup = cpuTime / gpuTime;
    console.log(`  🚀 Speedup: ${speedup.toFixed(2)}x faster${speedup > 1 ? ' with GPU!' : ''}\n`);
  }
  
  // Step 4: Explicit hardware acceleration
  if (hwInfo.available.includes(HardwareAcceleration.NVIDIA)) {
    console.log('=== Step 4: Explicit NVIDIA NVENC Encoding ===\n');
    
    await ffmpeg.convert(
      {
        input: inputFile,
        output: `${outputDir}/nvenc-h265.mp4`,
        video: {
          codec: VideoCodec.HEVC_NVENC,
          bitrate: '3M',
        },
        audio: {
          codec: AudioCodec.AAC,
          bitrate: '128k',
        },
        hardwareAcceleration: HardwareAcceleration.NVIDIA,
      },
      {
        onProgress: (progress) => {
          if (progress?.percent !== undefined) {
            process.stdout.write(`\r  ⏳ NVENC H.265: ${progress.percent.toFixed(1)}%`);
          }
        },
        onEnd: () => {
          console.log('\n  ✅ NVENC encoding complete!\n');
        },
      }
    );
  }
  
  if (hwInfo.available.includes(HardwareAcceleration.INTEL)) {
    console.log('=== Step 4: Explicit Intel QSV Encoding ===\n');
    
    const qsvFFmpeg = new FFmpeg();
    
    // Add error listener to prevent unhandled error events
    qsvFFmpeg.on('error', () => {
      // Error will be caught in catch block
    });
    
    try {
      await qsvFFmpeg.convert(
        {
          input: inputFile,
          output: `${outputDir}/qsv-h264.mp4`,
          video: {
            codec: VideoCodec.H264_QSV,
            bitrate: '2M',
          },
          audio: {
            codec: AudioCodec.AAC,
            bitrate: '128k',
          },
          hardwareAcceleration: HardwareAcceleration.INTEL,
        },
        {
          onProgress: (progress) => {
            if (progress?.percent !== undefined) {
              process.stdout.write(`\r  ⏳ QSV H.264: ${progress.percent.toFixed(1)}%`);
            }
          },
          onEnd: () => {
            console.log('\n  ✅ QSV encoding complete!\n');
          },
          onError: (error) => {
            // Error will also be thrown as rejection
          },
        }
      );
    } catch (error) {
      console.log(`  ⚠️  QSV encoding failed (hardware may not be properly configured)\n`);
    }
  } else {
    console.log('⚠️  Intel QSV not detected, skipping test\n');
  }
  
  // Step 5: Show recommendations with hardware
  console.log('=== Step 5: Hardware-Aware Recommendations ===\n');
  
  const recommendations = await ffmpeg.getConversionRecommendation(inputFile, 'web');
  console.log('Standard web recommendation:');
  console.log(`  Format: ${recommendations.format}`);
  console.log(`  Codec: ${recommendations.videoCodec}`);
  console.log('');
  
  if (hwInfo.best) {
    const hwSelection = autoSelectHardwareEncoding(recommendations.videoCodec, ffmpegPath);
    console.log('Hardware-accelerated version:');
    console.log(`  Codec: ${hwSelection.codec}`);
    console.log(`  Acceleration: ${hwSelection.acceleration || 'N/A'}`);
    console.log(`  Is Hardware: ${hwSelection.isHardware ? 'Yes' : 'No'}`);
  }
  
  console.log('\n✅ Hardware acceleration tests complete!');
  console.log(`\n💡 Output files in: ${outputDir}/`);
}

main().catch(console.error);

