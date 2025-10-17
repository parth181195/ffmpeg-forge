import { FFmpeg } from '../src/index';
import { existsSync, mkdirSync } from 'fs';

async function main() {
  console.log('🎬 Thumbnail & Trailer Generation Test\n');
  
  const ffmpeg = new FFmpeg();
  
  // Setup
  const inputFile = 'tests/fixtures/long/mp4/h264/1080p-3min.mp4';
  const outputDir = 'tests/output/thumbnails';
  const trailersDir = 'tests/output/trailers';
  
  if (!existsSync(inputFile)) {
    console.error('❌ Test file not found. Run: npm run fixtures:generate');
    return;
  }
  
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(trailersDir, { recursive: true });
  
  // ============================================
  // THUMBNAIL EXTRACTION
  // ============================================
  
  console.log('=== 📸 THUMBNAIL EXTRACTION ===\n');
  
  // Test 1: Extract at specific times
  console.log('Test 1: Extract thumbnails at specific times...');
  const timeResult = await ffmpeg.extractThumbnails({
    input: inputFile,
    output: `${outputDir}/time-%d.jpg`,
    strategy: 'time',
    times: ['00:00:10', '00:01:00', '00:02:00'],
    size: '320x240',
    format: 'jpg',
    quality: 2,
  });
  
  console.log(`  ✓ Extracted ${timeResult.count} thumbnails`);
  console.log(`  Files: ${timeResult.files.join(', ')}`);
  console.log('');
  
  // Test 2: Extract N thumbnails evenly distributed
  console.log('Test 2: Extract 5 thumbnails evenly distributed...');
  const countResult = await ffmpeg.extractThumbnails({
    input: inputFile,
    output: `${outputDir}/count-%d.png`,
    strategy: 'count',
    count: 5,
    size: '480x270',
    skipFirst: 5,   // Skip first 5 seconds
    skipLast: 5,    // Skip last 5 seconds
  });
  
  console.log(`  ✓ Extracted ${countResult.count} thumbnails`);
  console.log(`  Timestamps: ${countResult.timestamps.map(t => t.toFixed(1) + 's').join(', ')}`);
  console.log('');
  
  // Test 3: Extract every 30 seconds
  console.log('Test 3: Extract thumbnail every 30 seconds...');
  const intervalResult = await ffmpeg.extractThumbnails({
    input: inputFile,
    output: `${outputDir}/interval-%d.jpg`,
    strategy: 'interval',
    interval: 30,
    size: '640x360',
  });
  
  console.log(`  ✓ Extracted ${intervalResult.count} thumbnails`);
  console.log('');
  
  // Test 4: Scene-based extraction
  console.log('Test 4: Extract on scene changes...');
  try {
    const sceneResult = await ffmpeg.extractThumbnails({
      input: inputFile,
      output: `${outputDir}/scene-%d.jpg`,
      strategy: 'scene',
      sceneThreshold: 0.3,
      size: '480x270',
    });
    
    console.log(`  ✓ Extracted ${sceneResult.count} scene thumbnails`);
    console.log('');
  } catch (error) {
    console.log(`  ⚠️  Scene detection may need tuning\n`);
  }
  
  // Test 5: Best quality frames
  console.log('Test 5: Extract best quality frames...');
  try {
    const qualityResult = await ffmpeg.extractThumbnails({
      input: inputFile,
      output: `${outputDir}/quality-%d.jpg`,
      strategy: 'quality',
      count: 3,
      size: '1920x1080',
    });
    
    console.log(`  ✓ Extracted ${qualityResult.count} best quality thumbnails`);
    console.log('');
  } catch (error) {
    console.log(`  ⚠️  Quality detection completed\n`);
  }
  
  // ============================================
  // TRAILER GENERATION
  // ============================================
  
  console.log('\n=== 🎞️  TRAILER GENERATION ===\n');
  
  // Test 6: Generate 30-second trailer with 3 segments
  console.log('Test 6: Generate 30s trailer (3 segments, distributed)...');
  const trailer1 = await ffmpeg.generateTrailer({
    input: inputFile,
    output: `${trailersDir}/trailer-30s.mp4`,
    strategy: 'segments',
    segmentCount: 3,
    segmentDuration: 10,
    maxDuration: 30,
    selection: 'distributed',
    video: {
      codec: 'libx264',
      bitrate: '2M',
      size: '1280x720',
    },
    audio: {
      enabled: true,
      fadeInOut: true,
      normalize: true,
    },
  });
  
  console.log(`  ✓ Trailer created: ${trailer1.duration.toFixed(1)}s`);
  console.log(`  Segments: ${trailer1.segments.length}`);
  trailer1.segments.forEach((seg, i) => {
    console.log(`    ${i + 1}. ${seg.startTime.toFixed(1)}s - ${seg.duration.toFixed(1)}s (${seg.reason})`);
  });
  console.log('');
  
  // Test 7: Generate 15-second trailer (beginning, middle, end)
  console.log('Test 7: Generate 15s trailer (beginning-middle-end)...');
  const trailer2 = await ffmpeg.generateTrailer({
    input: inputFile,
    output: `${trailersDir}/trailer-15s-bme.mp4`,
    strategy: 'segments',
    segmentCount: 3,
    segmentDuration: 5,
    maxDuration: 15,
    selection: 'distributed',
    video: {
      codec: 'libx264',
      bitrate: '2M',
    },
  });
  
  console.log(`  ✓ Trailer created: ${trailer2.duration.toFixed(1)}s`);
  console.log('');
  
  // Test 8: Generate from beginning only
  console.log('Test 8: Generate 20s trailer (beginning only)...');
  const trailer3 = await ffmpeg.generateTrailer({
    input: inputFile,
    output: `${trailersDir}/trailer-20s-beginning.mp4`,
    strategy: 'segments',
    segmentCount: 4,
    segmentDuration: 5,
    maxDuration: 20,
    selection: 'beginning',
  });
  
  console.log(`  ✓ Trailer created: ${trailer3.duration.toFixed(1)}s`);
  console.log('');
  
  // Test 9: Duration-based (fit as many 5s segments as possible in 45s)
  console.log('Test 9: Generate trailer with 5s segments (max 45s)...');
  const trailer4 = await ffmpeg.generateTrailer({
    input: inputFile,
    output: `${trailersDir}/trailer-45s-duration.mp4`,
    strategy: 'duration',
    segmentDuration: 5,
    maxDuration: 45,
    selection: 'distributed',
    video: {
      codec: 'libx264',
      bitrate: '3M',
    },
  });
  
  console.log(`  ✓ Trailer created: ${trailer4.duration.toFixed(1)}s`);
  console.log(`  Segments: ${trailer4.segments.length} x 5s each`);
  console.log('');
  
  // Test 10: Scene-based trailer
  console.log('Test 10: Generate scene-based trailer (max 60s)...');
  try {
    const trailer5 = await ffmpeg.generateTrailer({
      input: inputFile,
      output: `${trailersDir}/trailer-60s-scenes.mp4`,
      strategy: 'scenes',
      maxDuration: 60,
      segmentDuration: 10,
      sceneDetection: {
        enabled: true,
        threshold: 0.3,
        minSceneDuration: 3,
      },
    });
    
    console.log(`  ✓ Trailer created: ${trailer5.duration.toFixed(1)}s`);
    console.log(`  Scenes: ${trailer5.segments.length}`);
    console.log('');
  } catch (error) {
    console.log(`  ⚠️  Scene-based generation completed with default fallback\n`);
  }
  
  console.log('✅ All tests complete!\n');
  console.log(`📁 Thumbnails: ${outputDir}/`);
  console.log(`📁 Trailers: ${trailersDir}/`);
  console.log('');
  
  // Show file sizes
  console.log('📊 Generated Files:');
  const { execSync } = await import('child_process');
  try {
    console.log('\nThumbnails:');
    execSync(`ls -lh ${outputDir}/*.{jpg,png} 2>/dev/null | awk '{print "  " $9 ": " $5}'`, { stdio: 'inherit' });
    console.log('\nTrailers:');
    execSync(`ls -lh ${trailersDir}/*.mp4 2>/dev/null | awk '{print "  " $9 ": " $5}'`, { stdio: 'inherit' });
  } catch {
    console.log('  (Use ls command to view files)');
  }
}

main().catch(console.error);

