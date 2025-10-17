# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-10-18

### Added
- Initial release
- 80 features for video/audio processing
- Hardware acceleration support (6 platforms)
- 17 filters (12 video + 5 audio)
- 15 production presets
- Screenshot extraction
- Thumbnail extraction (5 strategies)
- Trailer generation (4 strategies)
- Video concatenation
- Batch processing (sequential & parallel)
- Progress tracking with events
- Smart conversion recommendations
- Picture-in-picture
- Side-by-side comparison
- Buffer and Stream input support
- Zero dependencies
- Full TypeScript support
- Comprehensive documentation

### Features by Category

#### Core Conversion
- Video/audio conversion with full control
- Multiple input formats support
- Flexible I/O (files, Buffers, ReadStreams)
- Real-time progress tracking
- Event-driven architecture
- Cancellation support

#### Hardware Acceleration
- NVIDIA NVENC
- Intel Quick Sync
- AMD AMF
- VAAPI (Linux)
- VideoToolbox (macOS)
- V4L2 (ARM)
- Auto-detection and selection

#### Video Processing
- Scale with 10 algorithms
- Crop, pad, rotate, flip
- Deinterlace (3 modes)
- Denoise (4 algorithms)
- Sharpen, color correction
- Text overlay, watermarks
- Fade effects

#### Audio Processing
- Volume control
- Denoise
- Equalizer
- Tempo adjustment
- Pitch shift

#### Media Extraction
- Screenshots (single & multiple)
- Thumbnails (5 strategies)
- Trailer generation (4 strategies)
- Frame extraction

#### Advanced Features
- Video concatenation
- Audio merging
- Picture-in-picture
- Side-by-side comparison
- Batch processing
- Smart recommendations

### Technical
- TypeScript native (100%)
- Zero runtime dependencies
- Bundle size: 25.5 KB gzipped
- Test coverage: 57.6%
- 90 tests passing
- 2,327 lines of documentation

[0.1.0]: https://github.com/parth181195/ffmpeg-forge/releases/tag/v0.1.0
