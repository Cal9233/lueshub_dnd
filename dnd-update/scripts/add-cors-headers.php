#!/usr/bin/env php
<?php
/**
 * Script to add CORS headers to API PHP files
 * Run this to update the backend API files with proper CORS headers
 */

$apiDir = '/var/www/dnd.lueshub.com/current-dnd/api/';
$corsHeaders = '<?php
// CORS headers for React app
$allowed_origin = $_SERVER[\'HTTP_HOST\'] === \'localhost\' ? \'http://localhost:3000\' : \'https://\' . $_SERVER[\'HTTP_HOST\'];
header(\'Access-Control-Allow-Origin: \' . $allowed_origin);
header(\'Access-Control-Allow-Methods: GET, POST, OPTIONS\');
header(\'Access-Control-Allow-Headers: Content-Type\');
header(\'Access-Control-Allow-Credentials: true\');

// Handle preflight requests
if ($_SERVER[\'REQUEST_METHOD\'] === \'OPTIONS\') {
    http_response_code(200);
    exit();
}

// Original file content follows...
?>';

$files = [
    'login.php',
    'register.php',
    'session_check.php',
    'character.php',
    'campaigns.php',
    'save_spells.php',
    'rest.php',
    'roll.php'
];

echo "Adding CORS headers to API files...\n\n";

foreach ($files as $file) {
    $filePath = $apiDir . $file;
    
    if (!file_exists($filePath)) {
        echo "❌ File not found: $file\n";
        continue;
    }
    
    // Read current content
    $content = file_get_contents($filePath);
    
    // Check if CORS headers already exist
    if (strpos($content, 'Access-Control-Allow-Origin') !== false) {
        echo "⏭️  CORS headers already exist in: $file\n";
        continue;
    }
    
    // Remove opening PHP tag from content
    $content = preg_replace('/^<\?php\s*/', '', $content, 1);
    
    // Add CORS headers
    $newContent = $corsHeaders . "\n" . $content;
    
    // Create backup
    $backupPath = $filePath . '.backup';
    copy($filePath, $backupPath);
    
    // Write updated content
    if (file_put_contents($filePath, $newContent)) {
        echo "✅ Updated: $file (backup saved as $file.backup)\n";
    } else {
        echo "❌ Failed to update: $file\n";
    }
}

echo "\n✨ Done! CORS headers have been added to API files.\n";
echo "Note: You may need to restart your web server for changes to take effect.\n";