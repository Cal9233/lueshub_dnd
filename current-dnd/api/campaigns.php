<?php
// Include session check
require_once 'session_check.php';

// Include database connection
require_once 'db.php';

// Set header to JSON
header('Content-Type: application/json');

// Default response
$response = array(
    'success' => false,
    'message' => 'Campaigns feature coming soon',
    'campaigns' => array()
);

// Check if user is logged in
if (!is_logged_in()) {
    $response['message'] = 'Not logged in';
    echo json_encode($response);
    exit;
}

// For now, return empty campaigns array
// This will be implemented when the campaigns feature is built
$response['success'] = true;
$response['message'] = 'No campaigns available yet';

// Close database connection
mysqli_close($conn);

// Send response
echo json_encode($response);
?>