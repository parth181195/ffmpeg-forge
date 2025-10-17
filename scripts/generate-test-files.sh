#!/bin/bash

# Fast test file generator with proper directory creation

FIXTURES_DIR="tests/fixtures"
QUIET="-loglevel error -hide_banner"

echo "Generating test media files..."
echo ""

# Helper to create file and its directory
gen() {
    local output=$1
    shift
    mkdir -p "$(dirname "$output")"
    ffmpeg $QUIET "$@" -y "$output"
}

total=0

echo "📹 SHORT VIDEOS (10-20s)..."

# MP4 / H.264 (most popular)
gen "${FIXTURES_DIR}/short/mp4/h264/480p.mp4" -f lavfi -i testsrc=duration=10:size=640x480:rate=24 -f lavfi -i sine=duration=10 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 480p" && ((total++))
gen "${FIXTURES_DIR}/short/mp4/h264/720p.mp4" -f lavfi -i testsrc=duration=15:size=1280x720:rate=30 -f lavfi -i sine=duration=15 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 720p" && ((total++))
gen "${FIXTURES_DIR}/short/mp4/h264/1080p.mp4" -f lavfi -i testsrc=duration=20:size=1920x1080:rate=30 -f lavfi -i sine=duration=20 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 1080p" && ((total++))

# MP4 / H.265
gen "${FIXTURES_DIR}/short/mp4/h265/720p.mp4" -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -f lavfi -i sine=duration=10 -c:v libx265 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.265 720p" && ((total++))

# WebM / VP8
gen "${FIXTURES_DIR}/short/webm/vp8/480p.webm" -f lavfi -i testsrc=duration=10:size=640x480:rate=24 -c:v libvpx -b:v 500k && echo "  ✓ WebM/VP8 480p" && ((total++))

# WebM / VP9
gen "${FIXTURES_DIR}/short/webm/vp9/720p.webm" -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -f lavfi -i sine=duration=10 -c:v libvpx-vp9 -b:v 500k -deadline realtime -c:a libopus && echo "  ✓ WebM/VP9 720p" && ((total++))

# WebM / AV1
(gen "${FIXTURES_DIR}/short/webm/av1/720p.webm" -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -f lavfi -i sine=duration=10 -c:v libsvtav1 -preset 12 -c:a libopus 2>/dev/null || \
 gen "${FIXTURES_DIR}/short/webm/av1/720p.webm" -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -f lavfi -i sine=duration=10 -c:v libaom-av1 -cpu-used 8 -c:a libopus 2>/dev/null) && echo "  ✓ WebM/AV1 720p" && ((total++))

# MKV / H.264
gen "${FIXTURES_DIR}/short/mkv/h264/720p.mkv" -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -f lavfi -i sine=duration=10 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MKV/H.264 720p" && ((total++))

# MOV / H.264 (QuickTime)
gen "${FIXTURES_DIR}/short/mov/h264/720p.mov" -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -f lavfi -i sine=duration=10 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MOV/H.264 720p" && ((total++))
gen "${FIXTURES_DIR}/short/mov/h264/1080p.mov" -f lavfi -i testsrc=duration=15:size=1920x1080:rate=30 -f lavfi -i sine=duration=15 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MOV/H.264 1080p" && ((total++))

# AVI / H.264
gen "${FIXTURES_DIR}/short/avi/h264/480p.avi" -f lavfi -i testsrc=duration=10:size=640x480:rate=30 -f lavfi -i sine=duration=10 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ AVI/H.264 480p" && ((total++))

# FLV / H.264
gen "${FIXTURES_DIR}/short/flv/h264/480p.flv" -f lavfi -i testsrc=duration=10:size=640x480:rate=30 -f lavfi -i sine=duration=10 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ FLV/H.264 480p" && ((total++))

# OGV / Theora
gen "${FIXTURES_DIR}/short/ogv/theora/480p.ogv" -f lavfi -i testsrc=duration=10:size=640x480:rate=30 -f lavfi -i sine=duration=10 -c:v libtheora -b:v 500k -c:a libvorbis && echo "  ✓ OGV/Theora 480p" && ((total++))

# MPG / MPEG-2
gen "${FIXTURES_DIR}/short/mpg/mpeg2/480p.mpg" -f lavfi -i testsrc=duration=10:size=720x480:rate=30 -f lavfi -i sine=duration=10 -c:v mpeg2video -b:v 2M -c:a mp2 && echo "  ✓ MPG/MPEG-2 480p" && ((total++))

# 3GP / MPEG-4
gen "${FIXTURES_DIR}/short/3gp/mpeg4/240p.3gp" -f lavfi -i testsrc=duration=10:size=320x240:rate=15 -f lavfi -i sine=duration=10 -c:v mpeg4 -b:v 300k -c:a aac && echo "  ✓ 3GP/MPEG-4 240p" && ((total++))

# TS / H.264
gen "${FIXTURES_DIR}/short/ts/h264/720p.ts" -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 -f lavfi -i sine=duration=10 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ TS/H.264 720p" && ((total++))

# Additional variations
gen "${FIXTURES_DIR}/short/mp4/mjpeg/480p.mp4" -f lavfi -i testsrc=duration=10:size=640x480:rate=15 -c:v mjpeg -q:v 5 -an && echo "  ✓ MP4/MJPEG 480p" && ((total++))
gen "${FIXTURES_DIR}/short/mp4/mpeg4/480p.mp4" -f lavfi -i testsrc=duration=10:size=640x480:rate=30 -f lavfi -i sine=duration=10 -c:v mpeg4 -b:v 800k -c:a aac && echo "  ✓ MP4/MPEG-4 480p" && ((total++))
gen "${FIXTURES_DIR}/short/mp4/h264/2160p-4k.mp4" -f lavfi -i testsrc=duration=15:size=3840x2160:rate=30 -f lavfi -i sine=duration=15 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 4K" && ((total++))
gen "${FIXTURES_DIR}/short/mp4/h264/720p-60fps.mp4" -f lavfi -i testsrc=duration=10:size=1280x720:rate=60 -f lavfi -i sine=duration=10 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 60fps" && ((total++))
gen "${FIXTURES_DIR}/short/mp4/h264/720x1280-portrait.mp4" -f lavfi -i testsrc=duration=15:size=720x1280:rate=30 -f lavfi -i sine=duration=15 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 portrait" && ((total++))

echo ""
echo "📹 MEDIUM VIDEOS (1-2min)..."

gen "${FIXTURES_DIR}/medium/mp4/h264/720p-1min.mp4" -f lavfi -i testsrc=duration=60:size=1280x720:rate=30 -f lavfi -i sine=duration=60 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 720p" && ((total++))
gen "${FIXTURES_DIR}/medium/mp4/h264/1080p-90s.mp4" -f lavfi -i testsrc=duration=90:size=1920x1080:rate=30 -f lavfi -i sine=duration=90 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 1080p" && ((total++))
gen "${FIXTURES_DIR}/medium/mp4/h265/1080p-1min.mp4" -f lavfi -i testsrc=duration=60:size=1920x1080:rate=30 -f lavfi -i sine=duration=60 -c:v libx265 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.265 1080p" && ((total++))
gen "${FIXTURES_DIR}/medium/mov/h264/720p-1min.mov" -f lavfi -i testsrc=duration=60:size=1280x720:rate=30 -f lavfi -i sine=duration=60 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MOV/H.264 720p" && ((total++))
gen "${FIXTURES_DIR}/medium/webm/vp9/720p-1min.webm" -f lavfi -i testsrc=duration=60:size=1280x720:rate=30 -f lavfi -i sine=duration=60 -c:v libvpx-vp9 -b:v 500k -deadline realtime -c:a libopus && echo "  ✓ WebM/VP9 720p" && ((total++))

echo ""
echo "📹 LONG VIDEOS (2-5min)..."

gen "${FIXTURES_DIR}/long/mp4/h264/720p-2min.mp4" -f lavfi -i testsrc=duration=120:size=1280x720:rate=30 -f lavfi -i sine=duration=120 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 720p" && ((total++))
gen "${FIXTURES_DIR}/long/mp4/h264/1080p-3min.mp4" -f lavfi -i testsrc=duration=180:size=1920x1080:rate=30 -f lavfi -i sine=duration=180 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 1080p 3min" && ((total++))
gen "${FIXTURES_DIR}/long/mp4/h264/1080p-5min.mp4" -f lavfi -i testsrc=duration=300:size=1920x1080:rate=30 -f lavfi -i sine=duration=300 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 1080p 5min" && ((total++))
gen "${FIXTURES_DIR}/long/mp4/h264/1440p-2min.mp4" -f lavfi -i testsrc=duration=120:size=2560x1440:rate=30 -f lavfi -i sine=duration=120 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 1440p (2K)" && ((total++))
gen "${FIXTURES_DIR}/long/mp4/h264/2160p-3min.mp4" -f lavfi -i testsrc=duration=180:size=3840x2160:rate=30 -f lavfi -i sine=duration=180 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.264 2160p (4K)" && ((total++))
gen "${FIXTURES_DIR}/long/mp4/h265/1080p-2min.mp4" -f lavfi -i testsrc=duration=120:size=1920x1080:rate=30 -f lavfi -i sine=duration=120 -c:v libx265 -preset ultrafast -c:a aac && echo "  ✓ MP4/H.265 1080p" && ((total++))
gen "${FIXTURES_DIR}/long/mov/h264/1080p-2min.mov" -f lavfi -i testsrc=duration=120:size=1920x1080:rate=30 -f lavfi -i sine=duration=120 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MOV/H.264 1080p" && ((total++))
gen "${FIXTURES_DIR}/long/webm/vp9/720p-2min.webm" -f lavfi -i testsrc=duration=120:size=1280x720:rate=30 -f lavfi -i sine=duration=120 -c:v libvpx-vp9 -b:v 500k -deadline realtime -c:a libopus && echo "  ✓ WebM/VP9 720p" && ((total++))
gen "${FIXTURES_DIR}/long/flv/h264/480p-2min.flv" -f lavfi -i testsrc=duration=120:size=640x480:rate=30 -f lavfi -i sine=duration=120 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ FLV/H.264 480p" && ((total++))
gen "${FIXTURES_DIR}/long/ogv/theora/480p-2min.ogv" -f lavfi -i testsrc=duration=120:size=640x480:rate=30 -f lavfi -i sine=duration=120 -c:v libtheora -b:v 500k -c:a libvorbis && echo "  ✓ OGV/Theora 480p" && ((total++))
gen "${FIXTURES_DIR}/long/ts/h264/720p-2min.ts" -f lavfi -i testsrc=duration=120:size=1280x720:rate=30 -f lavfi -i sine=duration=120 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ TS/H.264 720p" && ((total++))
gen "${FIXTURES_DIR}/long/mkv/h264/720p-2min.mkv" -f lavfi -i testsrc=duration=120:size=1280x720:rate=30 -f lavfi -i sine=duration=120 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ MKV/H.264 720p" && ((total++))
gen "${FIXTURES_DIR}/long/avi/h264/480p-2min.avi" -f lavfi -i testsrc=duration=120:size=640x480:rate=30 -f lavfi -i sine=duration=120 -c:v libx264 -preset ultrafast -c:a aac && echo "  ✓ AVI/H.264 480p" && ((total++))

echo ""
echo "🖼️  IMAGES (10 formats)..."

gen "${FIXTURES_DIR}/images/png/320x240.png" -f lavfi -i testsrc=size=320x240 -frames:v 1 && echo "  ✓ PNG 320x240" && ((total++))
gen "${FIXTURES_DIR}/images/png/1920x1080.png" -f lavfi -i testsrc=size=1920x1080 -frames:v 1 && echo "  ✓ PNG 1080p" && ((total++))
gen "${FIXTURES_DIR}/images/png/3840x2160.png" -f lavfi -i testsrc=size=3840x2160 -frames:v 1 && echo "  ✓ PNG 4K" && ((total++))
gen "${FIXTURES_DIR}/images/jpg/640x480.jpg" -f lavfi -i testsrc=size=640x480 -frames:v 1 && echo "  ✓ JPEG 640x480" && ((total++))
gen "${FIXTURES_DIR}/images/jpg/1920x1080.jpg" -f lavfi -i testsrc=size=1920x1080 -frames:v 1 && echo "  ✓ JPEG 1080p" && ((total++))
gen "${FIXTURES_DIR}/images/jpg/3840x2160.jpg" -f lavfi -i testsrc=size=3840x2160 -frames:v 1 && echo "  ✓ JPEG 4K" && ((total++))
gen "${FIXTURES_DIR}/images/gif/320x240.gif" -f lavfi -i testsrc=duration=2:size=320x240:rate=10 && echo "  ✓ GIF animated" && ((total++))
gen "${FIXTURES_DIR}/images/webp/1280x720.webp" -f lavfi -i testsrc=size=1280x720 -frames:v 1 && echo "  ✓ WebP 720p" && ((total++))
gen "${FIXTURES_DIR}/images/bmp/640x480.bmp" -f lavfi -i testsrc=size=640x480 -frames:v 1 && echo "  ✓ BMP 640x480" && ((total++))

echo ""
echo "🔊 AUDIO (6 formats)..."

gen "${FIXTURES_DIR}/audio/mp3/30s-128k.mp3" -f lavfi -i sine=duration=30 -c:a libmp3lame -b:a 128k && echo "  ✓ MP3 30s" && ((total++))
gen "${FIXTURES_DIR}/audio/mp3/2min-192k.mp3" -f lavfi -i sine=duration=120 -c:a libmp3lame -b:a 192k && echo "  ✓ MP3 2min" && ((total++))
gen "${FIXTURES_DIR}/audio/aac/30s-128k.m4a" -f lavfi -i sine=duration=30 -c:a aac -b:a 128k && echo "  ✓ AAC 30s" && ((total++))
gen "${FIXTURES_DIR}/audio/opus/30s-128k.opus" -f lavfi -i sine=duration=30 -c:a libopus -b:a 128k && echo "  ✓ Opus 30s" && ((total++))
gen "${FIXTURES_DIR}/audio/vorbis/30s-128k.ogg" -f lavfi -i sine=duration=30 -c:a libvorbis -b:a 128k && echo "  ✓ Vorbis 30s" && ((total++))
gen "${FIXTURES_DIR}/audio/flac/30s.flac" -f lavfi -i sine=duration=30 -c:a flac && echo "  ✓ FLAC 30s" && ((total++))

# Remove empty directories
find "${FIXTURES_DIR}" -type d -empty -delete 2>/dev/null

echo ""
echo "========================================="
echo "✅ COMPLETE!"
echo "========================================="
echo ""
echo "📊 Generated: $total files"
echo "📦 Total size: $(du -sh "${FIXTURES_DIR}" 2>/dev/null | awk '{print $1}')"
echo ""
echo "🎬 Video Formats: MP4, WebM, MKV, MOV, AVI, FLV, OGV, MPG, 3GP, TS (10+)"
echo "🎥 Video Codecs: H.264, H.265, VP8, VP9, AV1, MPEG-4, MPEG-2, Theora, MJPEG (10+)"
echo "🔊 Audio Codecs: AAC, Opus, Vorbis, MP3, MP2, FLAC (6)"
echo "🖼️  Image Formats: PNG, JPEG, GIF, WebP, BMP (5)"
