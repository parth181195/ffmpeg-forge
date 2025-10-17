#!/usr/bin/env node

/**
 * Example: Event-based conversion with per-conversion progress tracking
 * Similar to fluent-ffmpeg API but with better TypeScript support
 */

import { FFmpeg } from '../src/index';
import type { ConversionConfig } from '../src/types/conversion-config';

async function main() {
  console.log('🎬 Event-based Conversion Example\n');

  const ffmpeg = new FFmpeg();

  // Example 1: Basic event-based conversion
  console.log('📹 Example 1: Basic event-based conversion');
  
  const config: ConversionConfig = {
    input: 'tests/fixtures/short/mp4/h264/480p.mp4',
    output: 'tests/output/event-conversion.mp4',
    video: {
      codec: 'h264',
      quality: 23,
      size: '1280x720'  // Fixed: use proper FFmpeg size format
    }
  };

  const conversion = ffmpeg.convert(config);

  // Listen to events for this specific conversion
  conversion.events.start((command) => {
    console.log('🚀 Conversion started');
    console.log(`📝 Command: ${command}`);
  });

  conversion.events.progress((progress) => {
    console.log(`📊 Progress: ${progress.percent?.toFixed(1) || 0}% - ${progress.timemark || '00:00:00'}`);
  });

  conversion.events.end(() => {
    console.log('✅ Conversion completed successfully');
  });

  conversion.events.error((error) => {
    console.error('❌ Conversion failed:', error.message);
  });

  // Wait for completion
  try {
    await conversion.promise;
    console.log('🎉 Conversion finished!\n');
  } catch (error) {
    console.error('💥 Conversion failed:', error);
  }

  // Example 2: Multiple conversions with individual progress tracking
  console.log('📹 Example 2: Multiple conversions with individual progress');
  
  const conversions = [
    {
      config: {
        input: 'tests/fixtures/short/mp4/h264/480p.mp4',
        output: 'tests/output/conversion-1.mp4',
        video: { codec: 'h264', quality: 23 }
      } as ConversionConfig,
      name: 'Conversion 1'
    },
    {
      config: {
        input: 'tests/fixtures/short/mp4/h264/480p.mp4',
        output: 'tests/output/conversion-2.mp4',
        video: { codec: 'h264', quality: 28 }  // Use h264 instead of h265
      } as ConversionConfig,
      name: 'Conversion 2'
    }
  ];

  const results = conversions.map(({ config, name }) => {
    const conversion = ffmpeg.convert(config);
    
    conversion.events.start(() => {
      console.log(`🚀 ${name} started`);
    });
    
    conversion.events.progress((progress) => {
      console.log(`📊 ${name}: ${progress.percent?.toFixed(1) || 0}%`);
    });
    
    conversion.events.end(() => {
      console.log(`✅ ${name} completed`);
    });
    
    conversion.events.error((error) => {
      console.error(`❌ ${name} failed:`, error.message);
    });
    
    return conversion;
  });

  // Wait for all conversions to complete
  try {
    await Promise.all(results.map(r => r.promise));
    console.log('🎉 All conversions finished!\n');
  } catch (error) {
    console.error('💥 Some conversions failed:', error);
  }

  // Example 3: Conversion with cancellation
  console.log('📹 Example 3: Conversion with cancellation');
  
  const longConversion = ffmpeg.convert({
    input: 'tests/fixtures/long/mp4/h264/1080p.mp4',
    output: 'tests/output/long-conversion.mp4',
    video: { codec: 'h264', quality: 18 } // High quality = slower
  });

  longConversion.events.start(() => {
    console.log('🚀 Long conversion started');
  });

  longConversion.events.progress((progress) => {
    console.log(`📊 Long conversion: ${progress.percent?.toFixed(1) || 0}%`);
    
    // Cancel after 5% progress
    if (progress.percent && progress.percent > 5) {
      console.log('🛑 Cancelling conversion...');
      longConversion.cancel();
    }
  });

  longConversion.events.end(() => {
    console.log('✅ Long conversion completed');
  });

  longConversion.events.error((error) => {
    console.log('❌ Long conversion failed (expected if cancelled):', error.message);
  });

  try {
    await longConversion.promise;
  } catch (error) {
    console.log('🛑 Conversion was cancelled as expected\n');
  }

  // Example 4: Buffer conversion with events
  console.log('📹 Example 4: Buffer conversion with events');
  
  const bufferConversion = ffmpeg.convertToBuffer({
    input: 'tests/fixtures/short/mp4/h264/480p.mp4',
    video: { codec: 'h264', quality: 23 },
    format: 'mp4'  // Specify format for buffer output
  });

  bufferConversion.events.start(() => {
    console.log('🚀 Buffer conversion started');
  });

  bufferConversion.events.progress((progress) => {
    console.log(`📊 Buffer conversion: ${progress.percent?.toFixed(1) || 0}%`);
  });

  bufferConversion.events.end(() => {
    console.log('✅ Buffer conversion completed');
  });

  try {
    const buffer = await bufferConversion.promise;
    console.log(`📦 Buffer size: ${buffer.length} bytes`);
    console.log('🎉 Buffer conversion finished!\n');
  } catch (error) {
    console.error('❌ Buffer conversion failed:', error);
  }

  console.log('✨ All examples completed!');
}

// Run the example
main().catch(console.error);
