# Test Video Generation Scripts

Scripts for generating comprehensive test fixtures for `ffmpeg-forge`.

---

## Available Scripts

### 1. `generate-comprehensive-test-videos.sh`

**Purpose**: Generate 100+ test videos across 20+ formats and 4 duration categories using FFmpeg directly.

**Features**:
- ✅ **20 format/codec combinations**
- ✅ **4 duration categories**: 10s, 1min, 5min, 10min
- ✅ **30+ special test cases**
- ✅ **Multiple resolutions**: 480p, 720p, 1080p, 4K, 8K
- ✅ **Multiple frame rates**: 24, 30, 60 fps
- ✅ **Multiple aspect ratios**: 16:9, 4:3, 21:9, portrait
- ✅ **Multiple audio codecs**: AAC, MP3, Opus, Vorbis, FLAC
- ✅ **Multiple pixel formats**: yuv420p, yuv422p, yuv420p10le

**Usage**:
```bash
# From project root
./scripts/generate-comprehensive-test-videos.sh

# Or from scripts directory
cd scripts
./generate-comprehensive-test-videos.sh
```

**Output**: `tests/fixtures/comprehensive/`

**Time**: ~10-30 minutes depending on system (longer videos take time)

**Disk Space**: ~2-5 GB

---

### 2. `generate-test-files.sh` (Existing)

**Purpose**: Quick test file generation for development.

**Features**:
- ✅ Fast generation (~2-5 minutes)
- ✅ Covers common formats
- ✅ Short, medium, long videos
- ✅ Images and audio files

**Usage**:
```bash
./scripts/generate-test-files.sh
```

**Output**: `tests/fixtures/`

**Disk Space**: ~500 MB - 1 GB

---

### 3. `generate-test-videos.ts` (TypeScript)

**Purpose**: Generate test videos using the `ffmpeg-forge` API (template for future implementation).

**Note**: Currently a template/placeholder. Requires lavfi input support to be fully functional.

**Usage**:
```bash
npm run build
node scripts/generate-test-videos.ts
```

---

## Format/Codec Matrix

### Video Formats Generated

| Container | Codecs | Durations | Special Cases |
|-----------|--------|-----------|---------------|
| MP4 | H.264, H.265, MPEG-4, MJPEG | 10s, 1min, 5min, 10min | 4K, 8K, 60fps, Portrait |
| WebM | VP8, VP9, AV1 | 10s, 1min, 5min, 10min | - |
| MKV | H.264, H.265, VP9 | 10s, 1min, 5min, 10min | Multi-audio, HDR |
| MOV | H.264, H.265 | 10s, 1min, 5min, 10min | - |
| AVI | H.264, MPEG-4 | 10s, 1min, 5min, 10min | - |
| FLV | H.264 | 10s, 1min, 5min, 10min | - |
| OGV | Theora | 10s, 1min, 5min, 10min | - |
| MPG | MPEG-2 | 10s, 1min, 5min, 10min | - |
| 3GP | H.263, MPEG-4 | 10s, 1min, 5min, 10min | - |
| TS | H.264, H.265 | 10s, 1min, 5min, 10min | - |
| WMV | WMV2 | 10s, 1min, 5min, 10min | - |

### Resolution/Duration Matrix

| Duration | Resolution | Frame Rate | Size (approx) |
|----------|-----------|------------|---------------|
| Short (10s) | 640x480 | 24 fps | ~5-10 MB |
| Medium (1min) | 1280x720 | 30 fps | ~30-60 MB |
| Long (5min) | 1920x1080 | 30 fps | ~150-300 MB |
| Extra-long (10min) | 1920x1080 | 30 fps | ~300-600 MB |

### Special Test Cases

1. **Resolution variants**: 240p, 360p, 480p, 720p, 1080p, 1440p, 4K, 8K
2. **Frame rate variants**: 15fps, 24fps, 30fps, 60fps, variable
3. **Aspect ratios**: 16:9, 4:3, 21:9, portrait (9:16)
4. **Bitrate variants**: Low (500k), normal (2M), high (20M)
5. **Audio variants**: Mono, stereo, 5.1 surround
6. **Sample rates**: 22050Hz, 44100Hz, 48000Hz
7. **Pixel formats**: yuv420p, yuv422p, yuv420p10le
8. **Special content**: Color bars, Mandelbrot, gradients
9. **Track variants**: Video-only, audio-only, multi-audio
10. **Encoding features**: Interlaced, HDR metadata, variable FPS

---

## Usage Examples

### Generate All Test Fixtures

```bash
# Fast generation (existing fixtures)
./scripts/generate-test-files.sh

# Comprehensive generation (new comprehensive fixtures)
./scripts/generate-comprehensive-test-videos.sh

# Both
./scripts/generate-test-files.sh && ./scripts/generate-comprehensive-test-videos.sh
```

### Generate Specific Durations Only

Edit `generate-comprehensive-test-videos.sh` and comment out unwanted durations:

```bash
# In the script, comment out durations you don't need:
declare -A DURATIONS=(
    ["short"]=10
    ["medium"]=60
    # ["long"]=300          # Comment out long videos
    # ["extra-long"]=600    # Comment out extra-long videos
)
```

### Generate Specific Formats Only

Edit the `FORMATS` array in the script:

```bash
# Only generate MP4 and WebM
declare -a FORMATS=(
    "MP4-H264:mp4:libx264:aac:mp4:2M:ultrafast"
    "WebM-VP9:webm:libvpx-vp9:libopus:webm:1M:realtime"
)
```

---

## File Structure

```
tests/fixtures/
├── comprehensive/               # New comprehensive test suite
│   ├── short/                   # 10 second videos
│   │   ├── mp4/
│   │   │   ├── MP4-H264.mp4
│   │   │   ├── MP4-H265.mp4
│   │   │   └── ...
│   │   ├── webm/
│   │   ├── mkv/
│   │   └── ...
│   ├── medium/                  # 1 minute videos
│   │   └── ...
│   ├── long/                    # 5 minute videos
│   │   └── ...
│   ├── extra-long/              # 10 minute videos
│   │   └── ...
│   └── special/                 # Special test cases
│       ├── mp4/
│       │   ├── portrait-720x1280.mp4
│       │   ├── 60fps-1080p.mp4
│       │   ├── 4k-2160p.mp4
│       │   └── ...
│       ├── audio-codecs/
│       ├── audio-sample-rates/
│       └── audio-channels/
│
├── short/                       # Existing quick test fixtures
├── medium/
├── long/
├── images/
└── audio/
```

---

## Performance Considerations

### Generation Time

| Script | Time | Files | Size |
|--------|------|-------|------|
| `generate-test-files.sh` | 2-5 min | 50+ | ~500 MB - 1 GB |
| `generate-comprehensive-test-videos.sh` | 10-30 min | 100+ | ~2-5 GB |
| Both | 15-35 min | 150+ | ~3-6 GB |

**Factors affecting time**:
- CPU/GPU performance
- Disk I/O speed
- Encoder presets (ultrafast is fastest)
- Video duration (10min videos take longer)
- Resolution (4K/8K take much longer)

### Optimization Tips

1. **Use SSD**: Significantly faster I/O
2. **Parallel generation**: Not implemented yet, but could speed up 2-4x
3. **Skip long videos**: Comment out long/extra-long durations
4. **Reduce special cases**: Comment out special cases you don't need
5. **Use hardware encoding**: If available (requires modifying script)

---

## Testing Use Cases

### What to Use Where

#### Unit Tests (Fast)
Use: `generate-test-files.sh` → `tests/fixtures/short/`
- Quick feedback
- Small files
- Common formats

#### Integration Tests (Medium)
Use: `generate-comprehensive-test-videos.sh` → `short/` + `medium/`
- More coverage
- Reasonable size
- Multiple formats

#### Comprehensive Tests (Slow)
Use: `generate-comprehensive-test-videos.sh` → All durations
- Complete coverage
- All edge cases
- All formats

#### CI/CD
Use: Pre-generated fixtures from repository or download from CDN
- Don't generate in CI (too slow)
- Use cached fixtures
- Test against subset

---

## Continuous Integration

### Option 1: Pre-commit (Fast)
```bash
# Generate fixtures before committing
./scripts/generate-test-files.sh
git add tests/fixtures
git commit -m "Update test fixtures"
```

### Option 2: Download from CDN (CI)
```bash
# In CI, download pre-generated fixtures
curl -O https://example.com/fixtures.tar.gz
tar -xzf fixtures.tar.gz -C tests/
```

### Option 3: Generate on Demand (Local)
```bash
# Only generate when needed
if [ ! -d "tests/fixtures/comprehensive" ]; then
  ./scripts/generate-comprehensive-test-videos.sh
fi
```

---

## Troubleshooting

### Script Fails Immediately
```bash
# Check FFmpeg is installed
ffmpeg -version

# Check script permissions
chmod +x scripts/generate-comprehensive-test-videos.sh

# Check disk space
df -h
```

### Some Formats Fail
```bash
# Check codec support
ffmpeg -codecs | grep -i hevc
ffmpeg -encoders | grep -i vp9

# Install missing codecs (Ubuntu/Debian)
sudo apt install libx264-dev libx265-dev libvpx-dev

# macOS
brew install x264 x265 libvpx
```

### Out of Disk Space
```bash
# Check current usage
du -sh tests/fixtures/

# Remove old fixtures
rm -rf tests/fixtures/comprehensive/long/
rm -rf tests/fixtures/comprehensive/extra-long/

# Generate only short and medium
# (edit script to comment out long durations)
```

### Too Slow
```bash
# Skip long videos (edit script)
# Comment out "long" and "extra-long" in DURATIONS

# Or generate in parallel (manual)
./generate-comprehensive-test-videos.sh &
# Start multiple instances with different output dirs
```

---

## Future Enhancements

### Planned Features
- [ ] **Parallel generation** (multi-process)
- [ ] **Hardware encoding** support
- [ ] **Streaming input** (HTTP sources)
- [ ] **Cloud generation** (S3, GCS, Azure)
- [ ] **Incremental updates** (only regenerate changed formats)
- [ ] **Checksums** for verification
- [ ] **Metadata validation**
- [ ] **Auto-cleanup** of old fixtures

### API-Based Generation (Future)
Once lavfi input support is added to ffmpeg-forge:
```typescript
import { FFmpeg, VideoCodec, AudioCodec } from 'ffmpeg-forge';

const ffmpeg = new FFmpeg();

await ffmpeg.convert({
  input: {
    type: 'lavfi',
    source: 'testsrc',
    options: { duration: 10, size: '1280x720', rate: 30 },
  },
  output: 'test.mp4',
  video: { codec: VideoCodec.H264, bitrate: '2M' },
  audio: { codec: AudioCodec.AAC, bitrate: '192k' },
}).promise;
```

---

## Contributing

To add new test cases:

1. Edit `generate-comprehensive-test-videos.sh`
2. Add new format to `FORMATS` array
3. Or add special case in the "SPECIAL TEST CASES" section
4. Test locally
5. Submit PR

Example:
```bash
# Add new format
"MP4-ProRes:mov:prores_ks:pcm_s16le:mov:150M:none"

# Add new special case
gen "${FIXTURES_DIR}/special/mp4/my-test.mp4" \
    -f lavfi -i "testsrc=duration=10:size=1280x720:rate=30" \
    -c:v libx264 -preset ultrafast && \
    echo "  ✓ My test case" && ((total++))
```

---

## License

MIT © Parth Jansari

Same license as ffmpeg-forge package.

