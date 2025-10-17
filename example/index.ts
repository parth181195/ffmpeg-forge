import { 
  FFmpeg, 
  VideoCodec, 
  AudioCodec, 
  OutputFormat,
} from '../src/index';
import { existsSync, mkdirSync } from 'fs';

async function main() {
  console.log('🎬 FFmpeg Conversion Example\n');
  
  // Create FFmpeg instance
  const ffmpeg = new FFmpeg();
  
  // Test file
  const inputFile = 'tests/fixtures/short/mp4/h264/720p.mp4';
  const outputDir = 'tests/output';
  
  // Ensure test file exists
  if (!existsSync(inputFile)) {
    console.error('❌ Test file not found. Run: npm run fixtures:generate');
    return;
  }
  
  // Create output directory
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`Input: ${inputFile}\n`);
  
  // Step 1: Analyze the video and get suggestions
  console.log('📊 Step 1: Analyzing video for conversion options...');
  const suggestions = await ffmpeg.getConversionSuggestions(inputFile);
  
  console.log(`\nCurrent format: ${suggestions.currentFormat}`);
  console.log(`Current codec: ${suggestions.currentVideoCodec} / ${suggestions.currentAudioCodec}`);
  console.log(`Resolution: ${suggestions.currentResolution}`);
  console.log(`Can remux: ${suggestions.canRemux}`);
  console.log(`Suggested formats: ${suggestions.suggestedFormats.slice(0, 5).join(', ')}`);
  
  // Step 2: Get recommendations for different use cases
  console.log('\n\n🎯 Step 2: Getting optimized recommendations...');
  
  const webRec = await ffmpeg.getConversionRecommendation(inputFile, 'web');
  console.log(`\nFor WEB:`);
  console.log(`  ${webRec.format} / ${webRec.videoCodec} / ${webRec.audioCodec}`);
  console.log(`  Reason: ${webRec.reason}`);
  
  const qualityRec = await ffmpeg.getConversionRecommendation(inputFile, 'quality');
  console.log(`\nFor QUALITY:`);
  console.log(`  ${qualityRec.format} / ${qualityRec.videoCodec} / ${qualityRec.audioCodec}`);
  console.log(`  Reason: ${qualityRec.reason}`);
  
  const sizeRec = await ffmpeg.getConversionRecommendation(inputFile, 'size');
  console.log(`\nFor SIZE:`);
  console.log(`  ${sizeRec.format} / ${sizeRec.videoCodec} / ${sizeRec.audioCodec}`);
  console.log(`  Reason: ${sizeRec.reason}`);
  
  // Step 3: Check compatibility for a specific conversion
  console.log('\n\n🔍 Step 3: Checking compatibility for WebM/VP9 conversion...');
  
  const compat = await ffmpeg.checkConversionCompatibility(
    inputFile,
    'webm',
    'vp9',
    'opus'
  );
  
  console.log(`\nCompatible: ${compat.compatible}`);
  console.log(`Requires transcode: ${compat.requiresTranscode}`);
  console.log(`Can direct copy: ${compat.canDirectCopy}`);
  console.log(`Quality: ${compat.estimatedQuality}`);
  if (compat.warnings.length > 0) {
    console.log(`Warnings: ${compat.warnings.join(', ')}`);
  }
  
  // Step 4: Check remux capabilities
  console.log('\n\n🔄 Step 4: Checking remux (lossless) capabilities...');
  
  const remuxFormats = await ffmpeg.getRemuxableFormats(inputFile);
  console.log(`\nCan remux to: ${remuxFormats.join(', ')}`);
  console.log(`Can remux to MKV: ${await ffmpeg.canRemux(inputFile, 'mkv')}`);
  console.log(`Can remux to WebM: ${await ffmpeg.canRemux(inputFile, 'webm')}`);
  
  // Step 5: Example conversions (commented out to avoid long execution)
  console.log('\n\n⚙️  Step 5: Example conversion commands...\n');
  
  console.log('// Example 1: Convert to WebM for web');
  console.log(`/*
const ffmpeg1 = new FFmpeg();
ffmpeg1.input('${inputFile}')
  .videoCodec('${VideoCodec.VP9}')
  .audioCodec('${AudioCodec.OPUS}')
  .output('${outputDir}/output-web.webm')
  .execute();
*/`);
  
  console.log('\n// Example 2: High quality conversion');
  console.log(`/*
const ffmpeg2 = new FFmpeg();
ffmpeg2.input('${inputFile}')
  .videoCodec('${VideoCodec.H265}')
  .audioBitrate('192k')
  .output('${outputDir}/output-quality.mp4')
  .execute();
*/`);
  
  console.log('\n// Example 3: Fast remux (change container only)');
  console.log(`/*
const ffmpeg3 = new FFmpeg();
ffmpeg3.input('${inputFile}')
  .videoCodec('${VideoCodec.COPY}')  // No re-encoding!
  .audioCodec('${AudioCodec.COPY}')
  .output('${outputDir}/output-remux.mkv')
  .execute();
*/`);
  
  console.log('\n// Example 4: Resize and convert');
  console.log(`/*
const ffmpeg4 = new FFmpeg();
ffmpeg4.input('${inputFile}')
  .size('1280x720')
  .videoCodec('${VideoCodec.H264}')
  .videoBitrate('2M')
  .output('${outputDir}/output-720p.mp4')
  .execute();
*/`);
  
  console.log('\n\n✅ Conversion analysis complete!');
  console.log('\n💡 Tips:');
  console.log('  - Use remux (codec=copy) when possible for lossless & fast conversion');
  console.log('  - WebM/VP9 offers better compression than H.264 at similar quality');
  console.log('  - H.265 provides ~50% better compression than H.264');
  console.log('  - For web: Use H.264/AAC in MP4 for maximum compatibility');
  console.log('  - For quality: Use H.265/FLAC in MKV');
  console.log('  - For size: Use VP9/Opus in WebM');
}

main().catch(console.error);
