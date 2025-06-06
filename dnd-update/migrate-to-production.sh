#!/bin/bash

# Migration script to replace current-dnd with dnd-update
# This script should be run from /var/www/dnd.lueshub.com

echo "Starting migration of D&D site from current-dnd to dnd-update..."

# Safety check - ensure we're in the right directory
if [ ! -d "current-dnd" ] || [ ! -d "dnd-update" ]; then
    echo "Error: Must be run from /var/www/dnd.lueshub.com directory"
    exit 1
fi

# Check if backup exists
if [ ! -f "current-dnd-backup-*.tar.gz" ]; then
    echo "Creating backup of current-dnd..."
    tar -czf "current-dnd-backup-$(date +%Y%m%d-%H%M%S).tar.gz" current-dnd/
fi

echo "Removing old current-dnd directory..."
rm -rf current-dnd

echo "Moving dnd-update contents to root directory..."

# Copy API directory
cp -r dnd-update/api .

# Copy build contents (this is the React app)
cp -r dnd-update/build/* .

# Copy any other necessary files
cp dnd-update/.htaccess . 2>/dev/null || true

# Create symlink for audio_files if needed
if [ ! -e "audio_files" ] && [ -e "../audio_files" ]; then
    ln -s ../audio_files audio_files
fi

echo "Setting proper permissions..."
chown -R dnd:www-data .
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Make PHP files in api directory executable by web server
find api -name "*.php" -exec chmod 644 {} \;

echo "Migration complete!"
echo ""
echo "Next steps:"
echo "1. Update Apache/Nginx configuration if needed"
echo "2. Test the site at https://dnd.lueshub.com"
echo "3. Check that all features are working"
echo ""
echo "To rollback if needed:"
echo "  tar -xzf current-dnd-backup-*.tar.gz"
echo "  rm -rf api index.html static/ etc."
echo "  mv current-dnd/* ."