import { FFmpeg, VideoCodec, AudioCodec } from '../src/index';
import { existsSync, mkdirSync } from 'fs';

async function main() {
  console.log('🎬 Complete Feature Test Suite\n');
  
  const ffmpeg = new FFmpeg();
  
  // Setup
  const shortVideo = 'tests/fixtures/short/mp4/h264/720p.mp4';
  const longVideo = 'tests/fixtures/long/mp4/h264/1080p-3min.mp4';
  const outputDir = 'tests/output/features';
  
  if (!existsSync(shortVideo)) {
    console.error('❌ Test files not found. Run: npm run fixtures:generate');
    return;
  }
  
  mkdirSync(outputDir, { recursive: true });
  
  // ============================================
  // SCREENSHOTS
  // ============================================
  
  console.log('=== 📸 SCREENSHOTS ===\n');
  
  // Test 1: Single screenshot
  console.log('Test 1: Extract single screenshot at 5s...');
  const screenshot1 = await ffmpeg.extractScreenshot({
    input: shortVideo,
    output: `${outputDir}/screenshot-single.jpg`,
    time: 5,
    size: '1280x720',
    quality: 2,
  });
  console.log(`  ✓ ${screenshot1}`);
  console.log('');
  
  // Test 2: Multiple screenshots
  console.log('Test 2: Extract 5 screenshots...');
  const screenshots = await ffmpeg.extractScreenshots({
    input: longVideo,
    folder: `${outputDir}/screenshots`,
    filename: 'frame-%i.jpg',
    count: 5,
    size: '640x360',
  });
  console.log(`  ✓ Extracted ${screenshots.count} screenshots`);
  console.log(`  Files: ${screenshots.files.slice(0, 3).join(', ')}...`);
  console.log('');
  
  // ============================================
  // VIDEO CONCATENATION
  // ============================================
  
  console.log('=== 🔗 VIDEO CONCATENATION ===\n');
  
  // Test 3: Simple concat (same codec)
  console.log('Test 3: Concatenate 2 videos (fast, no re-encode)...');
  const concat1 = await ffmpeg.concatenate({
    inputs: [shortVideo, shortVideo],  // Same video twice
    output: `${outputDir}/concat-simple.mp4`,
    method: 'concat',
  });
  console.log(`  ✓ Created ${concat1.duration.toFixed(1)}s video from ${concat1.inputCount} inputs`);
  console.log('');
  
  // Test 4: Complex concat with normalization
  console.log('Test 4: Concatenate with normalization...');
  const concat2 = await ffmpeg.concatenate({
    inputs: [shortVideo, shortVideo, shortVideo],
    output: `${outputDir}/concat-normalized.mp4`,
    method: 'complex',
    normalize: {
      enabled: true,
      video: {
        codec: VideoCodec.H264,
        bitrate: '2M',
        size: '1280x720',
      },
    },
  });
  console.log(`  ✓ Created ${concat2.duration.toFixed(1)}s normalized video`);
  console.log('');
  
  // ============================================
  // MERGE (VIDEO + AUDIO)
  // ============================================
  
  console.log('=== 🎵 MERGE VIDEO + AUDIO ===\n');
  
  // Test 5: Replace audio track
  console.log('Test 5: Merge video with different audio...');
  const merged = await ffmpeg.merge({
    inputs: [
      { source: shortVideo, type: 'video' },
      { source: 'tests/fixtures/audio/mp3/30s-128k.mp3', type: 'audio' },
    ],
    output: `${outputDir}/merged-audio.mp4`,
  });
  console.log(`  ✓ ${merged}`);
  console.log('');
  
  // ============================================
  // PICTURE-IN-PICTURE
  // ============================================
  
  console.log('=== 📺 PICTURE-IN-PICTURE ===\n');
  
  // Test 6: Create PiP video
  console.log('Test 6: Create picture-in-picture...');
  const pip = await ffmpeg.pictureInPicture({
    main: shortVideo,
    overlay: shortVideo,  // Use same video as overlay for demo
    output: `${outputDir}/pip.mp4`,
    position: 'bottom-right',
    overlaySize: '320x180',
    border: {
      width: 2,
      color: 'white',
    },
    video: {
      codec: VideoCodec.H264,
      bitrate: '2M',
    },
    audio: 'main',
  });
  console.log(`  ✓ ${pip}`);
  console.log('');
  
  // ============================================
  // SIDE-BY-SIDE COMPARISON
  // ============================================
  
  console.log('=== ⚖️  SIDE-BY-SIDE COMPARISON ===\n');
  
  // Test 7: Create side-by-side
  console.log('Test 7: Create side-by-side comparison...');
  const sbs = await ffmpeg.sideBySide({
    left: shortVideo,
    right: shortVideo,  // Compare with itself for demo
    output: `${outputDir}/side-by-side.mp4`,
    orientation: 'horizontal',
    matchSize: true,
    targetSize: '960x540',
    video: {
      codec: VideoCodec.H264,
      bitrate: '3M',
    },
    audio: 'left',
  });
  console.log(`  ✓ ${sbs}`);
  console.log('');
  
  
  // ============================================
  // FRAME CONTROL
  // ============================================
  
  console.log('=== 🎞️  FRAME CONTROL ===\n');
  
  // Test 8: Limit frames
  console.log('Test 8: Extract first 100 frames...');
  await ffmpeg.convert({
    input: shortVideo,
    output: `${outputDir}/limited-frames.mp4`,
    video: {
      codec: VideoCodec.COPY,
      frames: 100,  // Only first 100 frames
    },
    audio: {
      disabled: true,
    },
  });
  console.log(`  ✓ Created video with max 100 frames`);
  console.log('');
  
  // Test 9: Looping GIF
  console.log('Test 9: Create looping GIF...');
  await ffmpeg.convert({
    input: shortVideo,
    output: `${outputDir}/loop.gif`,
    video: {
      fps: 15,
      size: '480x270',
      loop: 0,  // 0 = infinite loop for GIF
    },
    audio: {
      disabled: true,
    },
    timing: {
      duration: 3,
    },
  });
  console.log(`  ✓ Created looping GIF`);
  console.log('');
  
  console.log('✅ All feature tests complete!\n');
  console.log(`📁 Output directory: ${outputDir}/\n`);
  
  // Summary
  console.log('📊 Generated Files:');
  const { execSync } = await import('child_process');
  try {
    execSync(`ls -lh ${outputDir}/*.{jpg,mp4,gif} 2>/dev/null | awk '{print "  " $9 ": " $5}'`, { stdio: 'inherit' });
  } catch {
    console.log('  (Use ls to view files)');
  }
  
  console.log('\n🎉 ALL FEATURES WORKING!');
  console.log('\n✨ Features Demonstrated:');
  console.log('  ✓ Screenshots (single + multiple)');
  console.log('  ✓ Video concatenation (simple + complex)');
  console.log('  ✓ Audio merging');
  console.log('  ✓ Picture-in-picture');
  console.log('  ✓ Side-by-side comparison');
  console.log('  ✓ Frame limiting');
  console.log('  ✓ Looping GIF');
}

main().catch(console.error);

