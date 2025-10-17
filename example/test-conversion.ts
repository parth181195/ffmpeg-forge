import { FFmpeg } from '../src/index';

async function main() {
  const ffmpeg = new FFmpeg();
  
  // Test file (ensure it exists first by running: npm run fixtures:generate)
  const testVideo = 'tests/fixtures/short/mp4/h264/720p.mp4';
  
  console.log('🎬 Conversion Analysis Demo\n');
  console.log('Analyzing:', testVideo);
  console.log('');
  
  try {
    // Get conversion suggestions
    console.log('--- Conversion Suggestions ---');
    const suggestions = await ffmpeg.getConversionSuggestions(testVideo);
    
    console.log(`Current: ${suggestions.currentFormat} / ${suggestions.currentVideoCodec} / ${suggestions.currentAudioCodec}`);
    console.log(`Resolution: ${suggestions.currentResolution}`);
    console.log('');
    console.log(`Can transcode: ${suggestions.canTranscode}`);
    console.log(`Can remux: ${suggestions.canRemux}`);
    console.log('');
    console.log(`Suggested formats (${suggestions.suggestedFormats.length}):`);
    console.log(`  ${suggestions.suggestedFormats.slice(0, 10).join(', ')}`);
    console.log('');
    console.log(`CPU codecs (${suggestions.suggestedVideoCodecs.cpu.length}):`);
    console.log(`  ${suggestions.suggestedVideoCodecs.cpu.slice(0, 10).join(', ')}`);
    console.log('');
    console.log(`GPU codecs (${suggestions.suggestedVideoCodecs.gpu.length}):`);
    console.log(`  ${suggestions.suggestedVideoCodecs.gpu.slice(0, 5).join(', ')}`);
    console.log('');
    console.log(`Audio codecs (${suggestions.suggestedAudioCodecs.length}):`);
    console.log(`  ${suggestions.suggestedAudioCodecs.slice(0, 10).join(', ')}`);
    
    // Check specific conversion compatibility
    console.log('\n--- Compatibility Check ---');
    const compat = await ffmpeg.checkConversionCompatibility(
      testVideo,
      'webm',
      'vp9',
      'opus'
    );
    
    console.log(`${compat.sourceFormat}/${compat.sourceVideoCodec} → ${compat.targetFormat}/${compat.targetVideoCodec}`);
    console.log(`Compatible: ${compat.compatible}`);
    console.log(`Requires transcode: ${compat.requiresTranscode}`);
    console.log(`Can direct copy: ${compat.canDirectCopy}`);
    console.log(`Estimated quality: ${compat.estimatedQuality}`);
    if (compat.warnings.length > 0) {
      console.log(`Warnings: ${compat.warnings.join(', ')}`);
    }
    
    // Get recommendations for different use cases
    console.log('\n--- Conversion Recommendations ---');
    
    const useCases: Array<'web' | 'mobile' | 'quality' | 'size' | 'compatibility'> = 
      ['web', 'mobile', 'quality', 'size', 'compatibility'];
    
    for (const useCase of useCases) {
      const rec = await ffmpeg.getConversionRecommendation(testVideo, useCase);
      console.log(`\n${useCase.toUpperCase()}:`);
      console.log(`  Format: ${rec.format}`);
      console.log(`  Video: ${rec.videoCodec}`);
      console.log(`  Audio: ${rec.audioCodec}`);
      console.log(`  Reason: ${rec.reason}`);
    }
    
    // Check remux capabilities
    console.log('\n--- Remux Capabilities ---');
    const remuxFormats = await ffmpeg.getRemuxableFormats(testVideo);
    console.log(`Can remux to: ${remuxFormats.join(', ')}`);
    console.log(`Can remux to WebM: ${await ffmpeg.canRemux(testVideo, 'webm')}`);
    console.log(`Can remux to MKV: ${await ffmpeg.canRemux(testVideo, 'mkv')}`);
    
  } catch (err) {
    console.error('Error:', (err as Error).message);
    console.log('\n💡 Make sure to run: npm run fixtures:generate');
  }
  
  console.log('\n✅ Conversion analysis complete!');
}

main().catch(console.error);

