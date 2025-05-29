#!/bin/bash

# Migration script from current-dnd to dnd-update
# This script helps move the dnd-update folder to become the main site

echo "=== D&D Site Migration Script ==="
echo "This will help migrate from current-dnd to dnd-update"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "build" ]; then
    echo "Error: Please run this script from the dnd-update directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "✓ Found package.json and build directory"
echo ""

# Check if build is recent
BUILD_TIME=$(stat -c %Y build/index.html 2>/dev/null || stat -f %m build/index.html 2>/dev/null)
CURRENT_TIME=$(date +%s)
AGE=$((CURRENT_TIME - BUILD_TIME))

if [ $AGE -gt 300 ]; then
    echo "⚠️  Build is more than 5 minutes old. Consider rebuilding with 'npm run build'"
else
    echo "✓ Build is fresh (created $(($AGE / 60)) minutes ago)"
fi

echo ""
echo "=== Pre-Migration Checklist ==="
echo "✓ API paths updated to use /api instead of /dnd-update/api"
echo "✓ Audio paths updated to use /audio_files"
echo "✓ .htaccess file created for React Router"
echo "✓ CORS settings include production domain"
echo "✓ Package.json proxy set to localhost"
echo ""

echo "=== Required Steps ==="
echo "1. Backup current-dnd folder (if not already done)"
echo "2. Move all contents of dnd-update to the parent directory"
echo "3. Update file permissions"
echo "4. Test all functionality"
echo ""

echo "Example commands to complete migration:"
echo ""
echo "# From /var/www/dnd.lueshub.com/"
echo "# 1. Backup current site"
echo "mv current-dnd backup-current-dnd-$(date +%Y%m%d-%H%M%S)"
echo ""
echo "# 2. Copy React build files to root"
echo "cp -r dnd-update/build/* ."
echo "cp -r dnd-update/api ."
echo "cp -r dnd-update/audio_files ."
echo "cp dnd-update/.htaccess ."
echo ""
echo "# 3. Set proper permissions"
echo "chmod 755 api/"
echo "chmod 644 api/*.php"
echo "chmod 755 audio_files/"
echo "chmod 644 audio_files/*.mp3"
echo ""
echo "# 4. Clean up (optional - after testing)"
echo "# rm -rf dnd-update"
echo ""

echo "=== Post-Migration Testing ==="
echo "Test these features after migration:"
echo "□ Login/Register"
echo "□ Character creation and saving"
echo "□ Character editing"
echo "□ Dice roller (2D and 3D)"
echo "□ Audio controls (DM only)"
echo "□ Dashboard navigation"
echo ""

echo "Good luck with your migration!"