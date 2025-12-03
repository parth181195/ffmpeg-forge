# Changelog

All notable changes to this project will be documented in this file.

## [0.3.9] - 2025-12-03

### Added

- Added `getDetailedVideoMetadata()` method to extract rotation metadata from video files
- Added `rotation` field to `VideoMetadata` interface
- Added `sideDataList` field to `StreamMetadata` interface for Display Matrix data
- Added `SideDataItem` interface for rotation and display matrix metadata
- Enhanced `buildProbeCommand()` with `includeAllData` parameter to include side_data

### Fixed

- Fixed rotation detection for MOV files from iOS devices (reads from Display Matrix)
- Fixed missing rotation metadata from stream tags and side_data

## [0.3.8] - 2025-10-21\n\n### Changed\n\n- Auto-bump patch version on push to main\n

## [0.3.7] - 2025-10-21\n\n### Changed\n\n- Auto-bump patch version on push to main\n

## [0.3.6] - 2025-10-17\n\n### Changed\n\n- Auto-bump patch version on push to main\n

## [0.3.5] - 2025-10-17\n\n### Changed\n\n- Auto-bump patch version on push to main\n

## [0.3.4] - 2025-10-17\n\n### Changed\n\n- Auto-bump patch version on push to main\n

## [0.3.3] - 2025-10-17\n\n### Changed\n\n- Auto-bump patch version on push to main\n

## [0.3.2] - 2025-10-17\n\n### Changed\n\n- Auto-bump patch version on push to main\n

## [0.3.1] - 2025-10-17

### Changed

- Unified GitHub Actions workflow: single workflow now handles build, npm publish, and docs deployment
- Simplified CI: removed multiple OS/Node version matrix, now uses single ubuntu-latest with Node 20
- Removed code formatting checks from CI and pre-commit hooks (still available manually)
- Removed test execution from CI (tests run in pre-commit hooks locally)
- Fixed TypeScript configuration: set `module: "Node16"` to match `moduleResolution: "node16"`
- Implemented proper event-based conversion API with EventEmitter pattern
- Fixed type errors in test files and examples
- Created separate `tsconfig.test.json` for test files

### Added

- Per-conversion event tracking with `start`, `progress`, `end`, `error` events
- `ConversionResult` and `ConversionResultBuffer` interfaces for better type safety
- Unified `main.yml` workflow replacing `ci.yml`, `docs.yml`, `publish.yml`, and `release.yml`
- Automatic version detection in workflow (only publishes if version changed)

### Fixed

- Import errors in test files (`OutputFormat` from `formats.ts`)
- `VolumeFilter` and `TempoFilter` property names in tests
- Event emitter implementation in `convert()` and `convertToBuffer()` methods

## [0.2.0] - 2025-10-17

### Features

- Manual version bump

## [0.1.0] - 2025-10-18

### Added

- Initial release
- Modern TypeScript alternative to fluent-ffmpeg (which is deprecated)
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

### Tested On

- FFmpeg 7.1.1 (Ubuntu)
- Node.js 18+
- Hardware: AMD Ryzen 5 5600X, NVIDIA RTX 4070
- NVIDIA NVENC hardware acceleration verified working

[0.1.0]: https://github.com/parth181195/ffmpeg-forge/releases/tag/v0.1.0
