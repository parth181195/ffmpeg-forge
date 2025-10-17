#!/bin/bash

# Script to download Big Buck Bunny test videos (optional)
# These downloads may take some time depending on your connection

FIXTURES_DIR="tests/fixtures"
mkdir -p "${FIXTURES_DIR}"

echo "Downloading Big Buck Bunny videos..."
echo "Note: This may take a few minutes depending on your connection"
echo ""

# Download 720p version (small, ~1MB)
echo "1. Downloading 720p version (~1MB)..."
curl -L --progress-bar -o "${FIXTURES_DIR}/bigbuckbunny-720p.mp4" \
  "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"

if [ $? -eq 0 ]; then
  echo "✓ bigbuckbunny-720p.mp4 downloaded"
else
  echo "✗ Failed to download 720p version"
fi

# Download 1080p version (larger, ~10MB)
echo "2. Downloading 1080p version (~10MB)..."
curl -L --progress-bar -o "${FIXTURES_DIR}/bigbuckbunny-1080p.mp4" \
  "https://sample-videos.com/video123/mp4/1080/big_buck_bunny_1080p_10mb.mp4"

if [ $? -eq 0 ]; then
  echo "✓ bigbuckbunny-1080p.mp4 downloaded"
else
  echo "✗ Failed to download 1080p version"
fi

echo ""
echo "Download complete!"
ls -lh "${FIXTURES_DIR}"/bigbuckbunny*.mp4 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

