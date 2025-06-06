<?php
// API endpoint for character rest (short/long)
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

if (!$data || !isset($data['character_id']) || !isset($data['rest_type'])) {
    $response['message'] = 'Missing required parameters';
    echo json_encode($response);
    exit;
}

$character_id = (int)$data['character_id'];
$rest_type = $data['rest_type'];
$user_id = get_user_id();

// Verify the user owns the character or is admin
$stmt = $conn->prepare("
    SELECT c.*, u.username 
    FROM characters c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
");
$stmt->bind_param("i", $character_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $response['message'] = 'Character not found';
    echo json_encode($response);
    exit;
}

$character = $result->fetch_assoc();
$stmt->close();

// Check if user owns the character
if ($character['user_id'] != $user_id && !is_admin()) {
    $response['message'] = 'Not authorized to update this character';
    echo json_encode($response);
    exit;
}

// Process the rest
if ($rest_type === 'short') {
    // Short rest logic - example: regain some hit points (level * 2)
    $hp_gain = $character['level'] * 2;
    $new_hp = min($character['max_hit_points'], $character['hit_points'] + $hp_gain);
    
    $stmt = $conn->prepare("UPDATE characters SET hit_points = ? WHERE id = ?");
    $stmt->bind_param("ii", $new_hp, $character_id);
    $result = $stmt->execute();
    $stmt->close();
    
    if ($result) {
        $response['success'] = true;
        $response['message'] = 'Short rest completed';
        $response['new_hp'] = $new_hp;
    } else {
        $response['message'] = 'Error updating character';
    }
} elseif ($rest_type === 'long') {
    // Long rest logic - regain all hit points
    $new_hp = $character['max_hit_points'];
    
    // Parse spell slots JSON
    $spell_slots = json_decode($character['spell_slots_json'], true);
    if (is_array($spell_slots)) {
        // Restore all spell slots to max
        foreach ($spell_slots as $level => $slots) {
            if (isset($slots['max'])) {
                $spell_slots[$level]['current'] = $slots['max'];
            }
        }
    }
    
    // Update HP and spell slots
    $spell_slots_json = json_encode($spell_slots);
    $stmt = $conn->prepare("UPDATE characters SET hit_points = ?, spell_slots_json = ? WHERE id = ?");
    $stmt->bind_param("isi", $new_hp, $spell_slots_json, $character_id);
    $result = $stmt->execute();
    $stmt->close();
    
    if ($result) {
        $response['success'] = true;
        $response['message'] = 'Long rest completed';
        $response['new_hp'] = $new_hp;
        $response['spell_slots'] = $spell_slots;
    } else {
        $response['message'] = 'Error updating character';
    }
} else {
    $response['message'] = 'Invalid rest type';
}

echo json_encode($response);
exit;
?>