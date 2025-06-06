#!/bin/bash

# Script to convert SVG favicon to ICO format
# Requires ImageMagick to be installed

echo "Converting dragon-favicon.svg to favicon.ico..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    exit 1
fi

# Convert SVG to multiple sizes and combine into ICO
convert dragon-favicon.svg -resize 16x16 favicon-16.png
convert dragon-favicon.svg -resize 32x32 favicon-32.png
convert dragon-favicon.svg -resize 48x48 favicon-48.png
convert dragon-favicon.svg -resize 64x64 favicon-64.png

# Combine into ICO file
convert favicon-16.png favicon-32.png favicon-48.png favicon-64.png favicon.ico

# Clean up temporary files
rm favicon-16.png favicon-32.png favicon-48.png favicon-64.png

echo "✅ Conversion complete! favicon.ico has been created."
echo "🐉 Your D&D dragon favicon is ready!"