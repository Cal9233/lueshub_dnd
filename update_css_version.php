#!/usr/bin/env php
<?php
/**
 * Script to update CSS version numbers in HTML files
 * Run this after making CSS changes to bust cache
 */

$version = date('YmdHis'); // Format: YYYYMMDDHHMMSS
$files = [
    'index.html',
    'login.html',
    'dashboard.html',
    'characters.html',
    'character.html',
    'dice_roller.html',
    'campaigns.html',
    'profile.html',
    'settings.html',
    'notes.html',
    'character_edit.php',
    'master_controls.html',
    'ambient_music_plugin.html'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        
        // Update custom.css version
        $content = preg_replace(
            '/custom\.css\?v=[\d]+/', 
            'custom.css?v=' . $version, 
            $content
        );
        
        // Update dashboard.css version
        $content = preg_replace(
            '/dashboard\.css\?v=[\d]+/', 
            'dashboard.css?v=' . $version, 
            $content
        );
        
        // Update character.css version
        $content = preg_replace(
            '/character\.css\?v=[\d]+/', 
            'character.css?v=' . $version, 
            $content
        );
        
        // If no version found, add it
        $content = preg_replace(
            '/(custom\.css|dashboard\.css|character\.css|login\.css|dice_roller\.css)(?!")/', 
            '$1?v=' . $version, 
            $content
        );
        
        file_put_contents($file, $content);
        echo "Updated $file with version $version\n";
    }
}

echo "\nCache version updated successfully!\n";
echo "New version: $version\n";