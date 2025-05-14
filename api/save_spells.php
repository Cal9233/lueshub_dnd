<?php
// Direct API endpoint for saving spells only
// This is a simplified endpoint that focuses only on saving the spells_array_json field

// Include database connection
$db_host = 'localhost';
$db_user = 'dnd_user';
$db_pass = 'LETme1n2dnd11!!';
$db_name = 'dnd_campaigns';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Set header to JSON
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Default response
$response = array(
    'success' => false,
    'message' => 'Invalid request'
);

// Helper function to sanitize input
function sanitize_input($data) {
    global $conn;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return mysqli_real_escape_string($conn, $data);
}

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get character ID - required
    $character_id = isset($_POST['id']) ? intval($_POST['id']) : null;
    
    if (!$character_id) {
        $response['message'] = 'Character ID is required';
        echo json_encode($response);
        exit;
    }
    
    // Get spells JSON data - required
    $spells_array_json = isset($_POST['spells_array_json']) ? $_POST['spells_array_json'] : null;
    
    if ($spells_array_json === null) {
        $response['message'] = 'Spells data is required';
        echo json_encode($response);
        exit;
    }
    
    // Validate JSON format
    $test_spells = json_decode($spells_array_json, true);
    if (!is_array($test_spells)) {
        $response['message'] = 'Invalid spells data format';
        echo json_encode($response);
        exit;
    }
    
    // Check if character exists
    $stmt = $conn->prepare("SELECT id FROM characters WHERE id = ?");
    $stmt->bind_param("i", $character_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $response['message'] = 'Character not found';
        echo json_encode($response);
        exit;
    }
    
    // Update only the spells_array_json field
    $stmt = $conn->prepare("UPDATE characters SET spells_array_json = ? WHERE id = ?");
    $stmt->bind_param("si", $spells_array_json, $character_id);
    $result = $stmt->execute();
    
    if ($result) {
        $response['success'] = true;
        $response['message'] = 'Spells saved successfully';
        
        // Add debug info
        $response['debug'] = [
            'character_id' => $character_id,
            'spells_count' => count($test_spells),
            'json_length' => strlen($spells_array_json)
        ];
    } else {
        $response['message'] = 'Error saving spells: ' . $stmt->error;
    }
    
    $stmt->close();
} else {
    // Handle GET request for testing connection
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $response['success'] = true;
        $response['message'] = 'Spells API endpoint is working';
    }
}

// Return JSON response
echo json_encode($response, JSON_PARTIAL_OUTPUT_ON_ERROR);
exit;
?>