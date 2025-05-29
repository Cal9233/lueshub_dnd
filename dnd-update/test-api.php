<?php
// Simple API test script
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        .test { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .success { background: #d4edda; }
        .error { background: #f8d7da; }
    </style>
</head>
<body>
    <h1>D&D Update API Test</h1>
    
    <?php
    // Test database connection
    echo '<div class="test">';
    echo '<h3>Database Connection Test</h3>';
    try {
        require_once 'api/config.php';
        $db = getDB();
        echo '<p class="success">✓ Database connection successful</p>';
    } catch (Exception $e) {
        echo '<p class="error">✗ Database connection failed: ' . $e->getMessage() . '</p>';
    }
    echo '</div>';
    
    // Test API endpoints
    $endpoints = [
        '/api/session_check.php' => 'Session Check',
        '/api/campaigns.php' => 'Campaigns',
        '/api/characters.php' => 'Characters'
    ];
    
    foreach ($endpoints as $endpoint => $name) {
        echo '<div class="test">';
        echo '<h3>' . $name . ' Endpoint Test</h3>';
        
        $url = 'http://localhost' . $endpoint;
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_NOBODY, false);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            echo '<p class="success">✓ Endpoint responding (HTTP ' . $httpCode . ')</p>';
        } else {
            echo '<p class="error">✗ Endpoint error (HTTP ' . $httpCode . ')</p>';
        }
        echo '</div>';
    }
    
    // Check build directory
    echo '<div class="test">';
    echo '<h3>Build Directory Check</h3>';
    if (file_exists('build/index.html')) {
        echo '<p class="success">✓ Build directory exists</p>';
        echo '<p>Build time: ' . date('Y-m-d H:i:s', filemtime('build/index.html')) . '</p>';
    } else {
        echo '<p class="error">✗ Build directory not found</p>';
    }
    echo '</div>';
    ?>
    
    <h2>Access your app at:</h2>
    <p><a href="/dnd-update/" target="_blank">https://dnd.lueshub.com/dnd-update/</a></p>
</body>
</html>