<?php
// API endpoint for saving dice rolls
session_start();

// Include database connection
require_once 'db.php';
require_once 'session_check.php';

// Set header to JSON
header('Content-Type: application/json');

// Default response
$response = array(
    'success' => false,
    'message' => 'Invalid request'
);

// Check if user is logged in
if (!is_logged_in()) {
    $response['message'] = 'Not logged in';
    echo json_encode($response);
    exit;
}

// Get the request data
$request_body = file_get_contents('php://input');
$data = json_decode($request_body, true);

if (!$data || !isset($data['roll']) || !isset($data['total'])) {
    $response['message'] = 'Missing required parameters';
    echo json_encode($response);
    exit;
}

$user_id = get_user_id();
$character_id = isset($data['character_id']) ? (int)$data['character_id'] : 0;
$action = isset($data['action']) ? $data['action'] : 'Dice Roll';
$roll = $data['roll'];
$total = (int)$data['total'];
$rolls_json = isset($data['rolls_json']) ? $data['rolls_json'] : '[]';
$modifier = isset($data['modifier']) ? (int)$data['modifier'] : 0;

// Insert the roll into the database
$stmt = $conn->prepare("
    INSERT INTO rolls (user_id, action, roll, total, rolls_json, modifier)
    VALUES (?, ?, ?, ?, ?, ?)
");
$stmt->bind_param('issisi', $user_id, $action, $roll, $total, $rolls_json, $modifier);
$result = $stmt->execute();
$stmt->close();

if ($result) {
    $response['success'] = true;
    $response['message'] = 'Roll saved successfully';
    $response['roll_id'] = $conn->insert_id;
} else {
    $response['message'] = 'Error saving roll: ' . $conn->error;
}

echo json_encode($response);
exit;
?>