<?php
// Raw character data API - For debugging
// Returns character data exactly as stored in the database without processing

// Include database connection
$db_host = 'localhost';
$db_user = 'dnd_user';
$db_pass = 'LETme1n2dnd11!!';
$db_name = 'dnd_campaigns';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// Set header to JSON
header('Content-Type: application/json');

// Default response
$response = array(
    'success' => false,
    'message' => 'Invalid request'
);

// Get character ID
$character_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($character_id <= 0) {
    $response['message'] = 'Invalid character ID';
    echo json_encode($response);
    exit;
}

// Fetch character data directly without processing
$query = "SELECT * FROM characters WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $character_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $character = $result->fetch_assoc();
    
    $response['success'] = true;
    $response['message'] = 'Character found';
    $response['character'] = $character;
} else {
    $response['message'] = 'Character not found';
}

$stmt->close();
$conn->close();

// Return response
echo json_encode($response);
exit;
?>