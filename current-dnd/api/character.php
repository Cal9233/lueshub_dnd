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
    'message' => 'Invalid request'
);

// Check if user is logged in
if (!is_logged_in()) {
    $response['message'] = 'Not logged in';
    echo json_encode($response);
    exit;
}

// Get user ID from query parameter or session
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : get_user_id();

// Verify the requested user ID matches the logged-in user ID
if ($user_id !== get_user_id()) {
    $response['message'] = 'Unauthorized access';
    echo json_encode($response);
    exit;
}

// Get character ID if provided for specific character
$character_id = isset($_GET['id']) ? intval($_GET['id']) : null;

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($character_id) {
        // Fetch specific character
        $query = "SELECT * FROM characters WHERE id = $character_id AND user_id = $user_id";
        $result = mysqli_query($conn, $query);
        
        if ($result && mysqli_num_rows($result) > 0) {
            $character = mysqli_fetch_assoc($result);
            
            $response['success'] = true;
            $response['message'] = 'Character found';
            $response['character'] = $character;
        } else {
            $response['message'] = 'Character not found';
        }
    } else {
        // Fetch all characters for the user
        $query = "SELECT * FROM characters WHERE user_id = $user_id ORDER BY name ASC";
        $result = mysqli_query($conn, $query);
        
        if ($result) {
            $characters = array();
            
            while ($row = mysqli_fetch_assoc($result)) {
                $characters[] = $row;
            }
            
            $response['success'] = true;
            $response['message'] = 'Characters retrieved';
            $response['characters'] = $characters;
        } else {
            $response['message'] = 'Error fetching characters';
        }
    }
}

// Return JSON response
echo json_encode($response);
exit;
?>