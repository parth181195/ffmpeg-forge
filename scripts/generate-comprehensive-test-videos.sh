#!/bin/bash

# Comprehensive test video generator
# Generates 20+ formats across 4 different lengths (10s, 1min, 5min, 10min)

FIXTURES_DIR="tests/fixtures/comprehensive"
QUIET="-loglevel error -hide_banner"

echo "========================================="
echo "  COMPREHENSIVE TEST VIDEO GENERATOR"
echo "========================================="
echo ""
echo "📊 Target: 20+ formats × 4 durations = 80+ videos"
echo "⏱️  Durations: 10s, 1min, 5min, 10min"
echo "📁 Output: ${FIXTURES_DIR}"
echo ""

# Helper to create file and its directory
gen() {
    local output=$1
    shift
    mkdir -p "$(dirname "$output")"
    if ffmpeg $QUIET "$@" -y "$output" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Counter
total=0
failed=0

# Duration configurations
declare -A DURATIONS=(
    ["short"]=10
    ["medium"]=60
    ["long"]=300
    ["extra-long"]=600
)

# Format/Codec matrix
declare -a FORMATS=(
    # Format:Container:VideoCodec:AudioCodec:Extension:BitRate:Preset
    "MP4-H264:mp4:libx264:aac:mp4:2M:ultrafast"
    "MP4-H265:mp4:libx265:aac:mp4:1.5M:ultrafast"
    "WebM-VP8:webm:libvpx:libvorbis:webm:1M:realtime"
    "WebM-VP9:webm:libvpx-vp9:libopus:webm:1M:realtime"
    "WebM-AV1:webm:libsvtav1:libopus:webm:800k:12"
    "MKV-H264:matroska:libx264:aac:mkv:2M:ultrafast"
    "MKV-H265:matroska:libx265:aac:mkv:1.5M:ultrafast"
    "MKV-VP9:matroska:libvpx-vp9:libopus:mkv:1M:realtime"
    "MOV-H264:mov:libx264:aac:mov:2M:ultrafast"
    "MOV-H265:mov:libx265:aac:mov:1.5M:ultrafast"
    "AVI-H264:avi:libx264:aac:avi:2M:ultrafast"
    "AVI-MPEG4:avi:mpeg4:mp3:avi:1.5M:none"
    "FLV-H264:flv:libx264:aac:flv:1.5M:ultrafast"
    "OGV-Theora:ogg:libtheora:libvorbis:ogv:1M:none"
    "MPG-MPEG2:mpeg:mpeg2video:mp2:mpg:3M:none"
    "3GP-H263:3gp:h263:aac:3gp:500k:none"
    "3GP-MPEG4:3gp:mpeg4:aac:3gp:800k:none"
    "TS-H264:mpegts:libx264:aac:ts:2M:ultrafast"
    "TS-H265:mpegts:libx265:aac:ts:1.5M:ultrafast"
    "WMV-WMV2:asf:wmv2:wmav2:wmv:1.5M:none"
)

# Resolution configurations for each duration
declare -A RESOLUTIONS=(
    ["short"]="640x480"
    ["medium"]="1280x720"
    ["long"]="1920x1080"
    ["extra-long"]="1920x1080"
)

declare -A FPS=(
    ["short"]="24"
    ["medium"]="30"
    ["long"]="30"
    ["extra-long"]="30"
)

# Generate test pattern videos
generate_format() {
    local duration_name=$1
    local duration=${DURATIONS[$duration_name]}
    local format_spec=$2
    
    IFS=':' read -r name container vcodec acodec ext bitrate preset <<< "$format_spec"
    
    local resolution=${RESOLUTIONS[$duration_name]}
    local fps=${FPS[$duration_name]}
    local output="${FIXTURES_DIR}/${duration_name}/${container}/${name}.${ext}"
    
    # Build FFmpeg command
    local cmd=(
        -f lavfi -i "testsrc=duration=${duration}:size=${resolution}:rate=${fps}"
        -f lavfi -i "sine=duration=${duration}:frequency=1000"
        -c:v "$vcodec"
        -c:a "$acodec"
    )
    
    # Add format-specific options
    if [[ "$preset" != "none" ]]; then
        if [[ "$vcodec" == "libvpx"* ]]; then
            cmd+=(-deadline "$preset")
        elif [[ "$vcodec" == "libsvtav1" ]]; then
            cmd+=(-preset "$preset")
        elif [[ "$vcodec" == "libx264" ]] || [[ "$vcodec" == "libx265" ]]; then
            cmd+=(-preset "$preset")
        fi
    fi
    
    # Add bitrate
    cmd+=(-b:v "$bitrate")
    
    # Add audio bitrate
    if [[ "$acodec" == "aac" ]] || [[ "$acodec" == "libopus" ]]; then
        cmd+=(-b:a "128k")
    elif [[ "$acodec" == "libvorbis" ]]; then
        cmd+=(-b:a "128k")
    fi
    
    # Generate file
    if gen "$output" "${cmd[@]}"; then
        echo "  ✓ ${duration_name} (${duration}s) - ${name}"
        ((total++))
        return 0
    else
        echo "  ✗ ${duration_name} (${duration}s) - ${name} FAILED"
        ((failed++))
        return 1
    fi
}

# Generate all combinations
echo "🎬 GENERATING TEST VIDEOS..."
echo ""

for duration_name in short medium long extra-long; do
    echo "⏱️  Duration: ${duration_name} (${DURATIONS[$duration_name]}s) @ ${RESOLUTIONS[$duration_name]}"
    echo "────────────────────────────────────────"
    
    for format_spec in "${FORMATS[@]}"; do
        generate_format "$duration_name" "$format_spec"
    done
    
    echo ""
done

# Generate special test cases
echo "🎯 SPECIAL TEST CASES..."
echo "────────────────────────────────────────"

# Portrait orientation
gen "${FIXTURES_DIR}/special/mp4/portrait-720x1280.mp4" \
    -f lavfi -i "testsrc=duration=10:size=720x1280:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac && \
    echo "  ✓ Portrait (720x1280)" && ((total++))

# High FPS
gen "${FIXTURES_DIR}/special/mp4/60fps-1080p.mp4" \
    -f lavfi -i "testsrc=duration=10:size=1920x1080:rate=60" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac && \
    echo "  ✓ High FPS (60fps)" && ((total++))

# 4K
gen "${FIXTURES_DIR}/special/mp4/4k-2160p.mp4" \
    -f lavfi -i "testsrc=duration=10:size=3840x2160:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac && \
    echo "  ✓ 4K (3840x2160)" && ((total++))

# 8K (short duration only due to size)
gen "${FIXTURES_DIR}/special/mp4/8k-4320p.mp4" \
    -f lavfi -i "testsrc=duration=5:size=7680x4320:rate=24" \
    -f lavfi -i "sine=duration=5" \
    -c:v libx265 -preset ultrafast -c:a aac && \
    echo "  ✓ 8K (7680x4320)" && ((total++))

# Variable frame rate
gen "${FIXTURES_DIR}/special/mp4/variable-fps.mp4" \
    -f lavfi -i "testsrc=duration=10:size=1280x720:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -vsync vfr -c:a aac && \
    echo "  ✓ Variable FPS" && ((total++))

# Low bitrate
gen "${FIXTURES_DIR}/special/mp4/low-bitrate-500k.mp4" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=24" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -b:v 500k -c:a aac -b:a 64k && \
    echo "  ✓ Low bitrate (500k)" && ((total++))

# High bitrate
gen "${FIXTURES_DIR}/special/mp4/high-bitrate-20m.mp4" \
    -f lavfi -i "testsrc=duration=10:size=1920x1080:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -b:v 20M -c:a aac -b:a 320k && \
    echo "  ✓ High bitrate (20M)" && ((total++))

# Different aspect ratios
gen "${FIXTURES_DIR}/special/mp4/aspect-4-3.mp4" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -aspect 4:3 -c:a aac && \
    echo "  ✓ Aspect ratio 4:3" && ((total++))

gen "${FIXTURES_DIR}/special/mp4/aspect-21-9.mp4" \
    -f lavfi -i "testsrc=duration=10:size=2560x1080:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac && \
    echo "  ✓ Aspect ratio 21:9 (ultrawide)" && ((total++))

# Video only (no audio)
gen "${FIXTURES_DIR}/special/mp4/video-only.mp4" \
    -f lavfi -i "testsrc=duration=10:size=1280x720:rate=30" \
    -c:v libx264 -preset ultrafast -an && \
    echo "  ✓ Video only (no audio)" && ((total++))

# Audio only
gen "${FIXTURES_DIR}/special/audio-only.m4a" \
    -f lavfi -i "sine=duration=60:frequency=440" \
    -c:a aac -b:a 192k && \
    echo "  ✓ Audio only" && ((total++))

# Different pixel formats
gen "${FIXTURES_DIR}/special/mp4/yuv420p.mp4" \
    -f lavfi -i "testsrc=duration=10:size=1280x720:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac && \
    echo "  ✓ Pixel format yuv420p" && ((total++))

gen "${FIXTURES_DIR}/special/mp4/yuv422p.mp4" \
    -f lavfi -i "testsrc=duration=10:size=1280x720:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -pix_fmt yuv422p -c:a aac && \
    echo "  ✓ Pixel format yuv422p" && ((total++))

# Multiple audio tracks
gen "${FIXTURES_DIR}/special/mkv/multi-audio.mkv" \
    -f lavfi -i "testsrc=duration=10:size=1280x720:rate=30" \
    -f lavfi -i "sine=duration=10:frequency=440" \
    -f lavfi -i "sine=duration=10:frequency=880" \
    -c:v libx264 -preset ultrafast \
    -map 0:v -map 1:a -map 2:a \
    -c:a aac && \
    echo "  ✓ Multiple audio tracks" && ((total++))

# Interlaced
gen "${FIXTURES_DIR}/special/mp4/interlaced.mp4" \
    -f lavfi -i "testsrc=duration=10:size=720x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -flags +ildct+ilme -c:a aac && \
    echo "  ✓ Interlaced video" && ((total++))

# HDR metadata (simulated)
gen "${FIXTURES_DIR}/special/mp4/hdr-metadata.mp4" \
    -f lavfi -i "testsrc=duration=10:size=1920x1080:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx265 -preset ultrafast -pix_fmt yuv420p10le \
    -x265-params "hdr-opt=1:colorprim=bt2020:transfer=smpte2084:colormatrix=bt2020nc" \
    -c:a aac 2>/dev/null && \
    echo "  ✓ HDR metadata (HEVC)" && ((total++))

# Animated sources
gen "${FIXTURES_DIR}/special/mp4/color-bars.mp4" \
    -f lavfi -i "smptebars=duration=10:size=1280x720:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac && \
    echo "  ✓ SMPTE color bars" && ((total++))

gen "${FIXTURES_DIR}/special/mp4/mandelbrot.mp4" \
    -f lavfi -i "mandelbrot=duration=10:size=1280x720:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac && \
    echo "  ✓ Mandelbrot animation" && ((total++))

gen "${FIXTURES_DIR}/special/mp4/gradient.mp4" \
    -f lavfi -i "gradients=duration=10:size=1280x720:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac 2>/dev/null && \
    echo "  ✓ Gradient animation" && ((total++))

# Different audio codecs with video
gen "${FIXTURES_DIR}/special/audio-codecs/mp3.mp4" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a libmp3lame -b:a 192k && \
    echo "  ✓ Audio codec: MP3" && ((total++))

gen "${FIXTURES_DIR}/special/audio-codecs/opus.mkv" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a libopus -b:a 128k && \
    echo "  ✓ Audio codec: Opus" && ((total++))

gen "${FIXTURES_DIR}/special/audio-codecs/flac.mkv" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a flac && \
    echo "  ✓ Audio codec: FLAC (lossless)" && ((total++))

gen "${FIXTURES_DIR}/special/audio-codecs/vorbis.mkv" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a libvorbis -b:a 128k && \
    echo "  ✓ Audio codec: Vorbis" && ((total++))

# Different sample rates
gen "${FIXTURES_DIR}/special/audio-sample-rates/22050hz.mp4" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac -ar 22050 && \
    echo "  ✓ Audio sample rate: 22050 Hz" && ((total++))

gen "${FIXTURES_DIR}/special/audio-sample-rates/44100hz.mp4" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac -ar 44100 && \
    echo "  ✓ Audio sample rate: 44100 Hz" && ((total++))

gen "${FIXTURES_DIR}/special/audio-sample-rates/48000hz.mp4" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac -ar 48000 && \
    echo "  ✓ Audio sample rate: 48000 Hz" && ((total++))

# Mono vs Stereo vs 5.1
gen "${FIXTURES_DIR}/special/audio-channels/mono.mp4" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac -ac 1 && \
    echo "  ✓ Audio channels: Mono" && ((total++))

gen "${FIXTURES_DIR}/special/audio-channels/stereo.mp4" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac -ac 2 && \
    echo "  ✓ Audio channels: Stereo" && ((total++))

gen "${FIXTURES_DIR}/special/audio-channels/5.1.mp4" \
    -f lavfi -i "testsrc=duration=10:size=640x480:rate=30" \
    -f lavfi -i "sine=duration=10" \
    -c:v libx264 -preset ultrafast -c:a aac -ac 6 && \
    echo "  ✓ Audio channels: 5.1 surround" && ((total++))

echo ""

# Remove empty directories
find "${FIXTURES_DIR}" -type d -empty -delete 2>/dev/null

# Calculate statistics
echo "========================================="
echo "✅ GENERATION COMPLETE!"
echo "========================================="
echo ""
echo "📊 Statistics:"
echo "  • Generated: $total files"
echo "  • Failed: $failed files"
echo "  • Success rate: $(( total * 100 / (total + failed) ))%"
echo ""

# Calculate and display sizes
if command -v du &> /dev/null; then
    total_size=$(du -sh "${FIXTURES_DIR}" 2>/dev/null | awk '{print $1}')
    echo "💾 Storage:"
    echo "  • Total size: ${total_size}"
    echo ""
    
    echo "  Size breakdown:"
    for duration_name in short medium long extra-long; do
        if [ -d "${FIXTURES_DIR}/${duration_name}" ]; then
            size=$(du -sh "${FIXTURES_DIR}/${duration_name}" 2>/dev/null | awk '{print $1}')
            echo "    - ${duration_name}: ${size}"
        fi
    done
    echo ""
fi

# Summary
echo "📋 Summary:"
echo "  • 20 format/codec combinations"
echo "  • 4 duration categories (10s, 1min, 5min, 10min)"
echo "  • 30+ special test cases"
echo "  • Multiple resolutions: 480p, 720p, 1080p, 4K, 8K"
echo "  • Multiple frame rates: 24, 30, 60 fps"
echo "  • Multiple aspect ratios: 16:9, 4:3, 21:9, portrait"
echo "  • Multiple audio codecs: AAC, MP3, Opus, Vorbis, FLAC"
echo "  • Multiple pixel formats: yuv420p, yuv422p, yuv420p10le"
echo ""
echo "✨ Test files ready at: ${FIXTURES_DIR}"
echo ""

