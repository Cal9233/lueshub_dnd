<?php
require_once 'config.php';

// Require authentication
requireAuth();

// For now, return empty campaigns as it's a placeholder
sendResponse([
    'success' => true,
    'campaigns' => [],
    'message' => 'Campaigns feature coming soon'
]);