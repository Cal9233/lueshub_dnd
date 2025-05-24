<?php
// Simplified character save endpoint that focuses on basic data only
// Debug mode is enabled to help identify issues

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
    'message' => 'Invalid request',
    'debug' => array()
);

// Check if this is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Store all POST data for debugging
    $response['debug']['post_data'] = $_POST;
    
    // Get character ID - required
    $character_id = isset($_POST['id']) ? intval($_POST['id']) : null;
    
    if (!$character_id) {
        $response['message'] = 'Character ID is required';
        echo json_encode($response, JSON_PRETTY_PRINT);
        exit;
    }
    
    // Add character ID to debug
    $response['debug']['character_id'] = $character_id;
    
    // Check if character exists
    $stmt = $conn->prepare("SELECT id FROM characters WHERE id = ?");
    $stmt->bind_param("i", $character_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $response['message'] = 'Character not found';
        echo json_encode($response, JSON_PRETTY_PRINT);
        exit;
    }
    
    // Collect required fields with defaults
    $fields = array(
        'name' => isset($_POST['name']) ? $_POST['name'] : 'Character',
        'race' => isset($_POST['race']) ? $_POST['race'] : '',
        'class' => isset($_POST['class']) ? $_POST['class'] : '',
        'level' => isset($_POST['level']) ? intval($_POST['level']) : 1,
        'hit_points' => isset($_POST['hit_points']) ? intval($_POST['hit_points']) : 0,
        'max_hit_points' => isset($_POST['max_hit_points']) ? intval($_POST['max_hit_points']) : 0,
        'armor_class' => isset($_POST['armor_class']) ? intval($_POST['armor_class']) : 10
    );
    
    // Add fields to debug
    $response['debug']['fields'] = $fields;
    
    // Build a very simple update query with just essential fields
    $sql = "UPDATE characters SET 
            name = ?,
            race = ?,
            class = ?,
            level = ?,
            hit_points = ?,
            max_hit_points = ?,
            armor_class = ?
            WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    
    // Add query to debug
    $response['debug']['query'] = $sql;
    
    if (!$stmt) {
        $response['message'] = 'Prepare failed: ' . $conn->error;
        echo json_encode($response, JSON_PRETTY_PRINT);
        exit;
    }
    
    $stmt->bind_param(
        'sssiiiii',
        $fields['name'],
        $fields['race'],
        $fields['class'],
        $fields['level'],
        $fields['hit_points'],
        $fields['max_hit_points'],
        $fields['armor_class'],
        $character_id
    );
    
    // Add bind params to debug
    $response['debug']['bind_params'] = array(
        'name' => $fields['name'],
        'race' => $fields['race'],
        'class' => $fields['class'],
        'level' => $fields['level'],
        'hit_points' => $fields['hit_points'],
        'max_hit_points' => $fields['max_hit_points'],
        'armor_class' => $fields['armor_class'],
        'character_id' => $character_id
    );
    
    $result = $stmt->execute();
    
    if ($result) {
        $response['success'] = true;
        $response['message'] = 'Character data saved successfully';
    } else {
        $response['message'] = 'Error saving character: ' . $stmt->error;
        $response['debug']['stmt_error'] = $stmt->error;
    }
    
    $stmt->close();
} else {
    // Handle GET request for testing connection
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $response['success'] = true;
        $response['message'] = 'Character direct API endpoint is working';
    }
}

// Return JSON response
echo json_encode($response, JSON_PRETTY_PRINT);
exit;
?>