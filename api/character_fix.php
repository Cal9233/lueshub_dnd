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
if ($user_id !== get_user_id() && !is_admin()) {
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
        $query = "SELECT * FROM characters WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $character_id, $user_id);
        
        // For admins, don't check user_id
        if (is_admin()) {
            $query = "SELECT c.*, u.username FROM characters c 
                     JOIN users u ON c.user_id = u.id 
                     WHERE c.id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $character_id);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result && $result->num_rows > 0) {
            $character = $result->fetch_assoc();
            
            // Properly encode JSON fields to prevent quote issues
            if (isset($character['notes']) && !empty($character['notes'])) {
                // Try to decode and re-encode to ensure valid JSON
                $notes = json_decode($character['notes'], true);
                if (is_array($notes)) {
                    $character['notes'] = json_encode($notes, JSON_HEX_APOS | JSON_HEX_QUOT);
                }
            }
            
            if (isset($character['spell_slots_json']) && !empty($character['spell_slots_json'])) {
                // Try to decode and re-encode to ensure valid JSON
                $slots = json_decode($character['spell_slots_json'], true);
                if (is_array($slots)) {
                    $character['spell_slots_json'] = json_encode($slots, JSON_HEX_APOS | JSON_HEX_QUOT);
                }
            }
            
            // Make sure all text fields are properly encoded
            foreach ($character as $key => $value) {
                if (is_string($value)) {
                    // For non-JSON fields, we just need to ensure they're properly encoded
                    if ($key !== 'notes' && $key !== 'spell_slots_json') {
                        $character[$key] = htmlspecialchars_decode($value, ENT_QUOTES);
                    }
                }
            }
            
            $response['success'] = true;
            $response['message'] = 'Character found';
            $response['character'] = $character;
        } else {
            $response['message'] = 'Character not found';
        }
        
        $stmt->close();
    } else {
        // Fetch all characters for the user
        $query = "SELECT * FROM characters WHERE user_id = ? ORDER BY name ASC";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result) {
            $characters = array();
            
            while ($row = $result->fetch_assoc()) {
                // Clean up each character's data
                foreach ($row as $key => $value) {
                    if (is_string($value) && $key !== 'notes' && $key !== 'spell_slots_json') {
                        $row[$key] = htmlspecialchars_decode($value, ENT_QUOTES);
                    }
                }
                
                $characters[] = $row;
            }
            
            $response['success'] = true;
            $response['message'] = 'Characters retrieved';
            $response['characters'] = $characters;
        } else {
            $response['message'] = 'Error fetching characters';
        }
        
        $stmt->close();
    }
}

// Handle POST request for saving character
else if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'save_character') {
    $character_id = isset($_POST['id']) ? intval($_POST['id']) : null;
    
    if (!$character_id) {
        $response['message'] = 'Character ID is required';
        echo json_encode($response);
        exit;
    }
    
    // Check if character exists and belongs to the user
    $stmt = $conn->prepare("SELECT user_id FROM characters WHERE id = ?");
    $stmt->bind_param("i", $character_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        $response['message'] = 'Character not found';
        echo json_encode($response);
        exit;
    }
    
    $row = $result->fetch_assoc();
    $char_user_id = $row['user_id'];
    
    // Non-admins can't save others' characters
    if ($char_user_id != $user_id && !is_admin()) {
        $response['message'] = 'Not authorized to update this character';
        echo json_encode($response);
        exit;
    }
    
    // Get form data and sanitize it
    $name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
    $race = isset($_POST['race']) ? sanitize_input($_POST['race']) : '';
    $class = isset($_POST['class']) ? sanitize_input($_POST['class']) : '';
    $level = isset($_POST['level']) ? intval($_POST['level']) : 1;
    $armor_class = isset($_POST['armor_class']) ? intval($_POST['armor_class']) : 10;
    $hit_points = isset($_POST['hit_points']) ? intval($_POST['hit_points']) : 0;
    $max_hit_points = isset($_POST['max_hit_points']) ? intval($_POST['max_hit_points']) : 0;
    $temp_hit_points = isset($_POST['temp_hit_points']) ? intval($_POST['temp_hit_points']) : 0;
    
    // Ability scores
    $strength = isset($_POST['strength']) ? intval($_POST['strength']) : 10;
    $dexterity = isset($_POST['dexterity']) ? intval($_POST['dexterity']) : 10;
    $constitution = isset($_POST['constitution']) ? intval($_POST['constitution']) : 10;
    $intelligence = isset($_POST['intelligence']) ? intval($_POST['intelligence']) : 10;
    $wisdom = isset($_POST['wisdom']) ? intval($_POST['wisdom']) : 10;
    $charisma = isset($_POST['charisma']) ? intval($_POST['charisma']) : 10;
    
    // Currency
    $gold = isset($_POST['gold']) ? intval($_POST['gold']) : 0;
    $silver = isset($_POST['silver']) ? intval($_POST['silver']) : 0;
    $copper = isset($_POST['copper']) ? intval($_POST['copper']) : 0;
    
    // Spellcasting
    $spell_save_dc = isset($_POST['spell_save_dc']) ? intval($_POST['spell_save_dc']) : 10;
    $spell_attack_bonus = isset($_POST['spell_attack_bonus']) ? intval($_POST['spell_attack_bonus']) : 0;
    
    // JSON data needs careful handling
    $spell_slots_json = isset($_POST['spell_slots_json']) ? $_POST['spell_slots_json'] : '{}';
    // Validate JSON
    $test_slots = json_decode($spell_slots_json, true);
    if (!is_array($test_slots)) {
        $spell_slots_json = '{}';
    }
    
    $notes = isset($_POST['notes']) ? $_POST['notes'] : '[]';
    // Validate JSON
    $test_notes = json_decode($notes, true);
    if (!is_array($test_notes)) {
        $notes = '[]';
    }
    
    // Equipment & text fields
    $known_spells = isset($_POST['known_spells']) ? sanitize_input($_POST['known_spells']) : '';
    $weapons = isset($_POST['weapons']) ? sanitize_input($_POST['weapons']) : '';
    $gear = isset($_POST['gear']) ? sanitize_input($_POST['gear']) : '';
    $background = isset($_POST['background']) ? sanitize_input($_POST['background']) : '';
    
    // Update character
    $stmt = $conn->prepare("
        UPDATE characters SET
            name = ?,
            race = ?,
            class = ?,
            level = ?,
            armor_class = ?,
            hit_points = ?,
            max_hit_points = ?,
            temp_hit_points = ?,
            
            strength = ?,
            dexterity = ?,
            constitution = ?,
            intelligence = ?,
            wisdom = ?,
            charisma = ?,
            
            gold = ?,
            silver = ?,
            copper = ?,
            
            spell_save_dc = ?,
            spell_attack_bonus = ?,
            spell_slots_json = ?,
            known_spells = ?,
            weapons = ?,
            gear = ?,
            background = ?,
            notes = ?
        WHERE id = ?
    ");
    
    $stmt->bind_param(
        'sssiiiiiiiiiiiiiiisssssssi',
        $name, $race, $class,
        $level, $armor_class, $hit_points, $max_hit_points, $temp_hit_points,
        $strength, $dexterity, $constitution, $intelligence, $wisdom, $charisma,
        $gold, $silver, $copper,
        $spell_save_dc, $spell_attack_bonus,
        $spell_slots_json, $known_spells, $weapons, $gear, $background, $notes,
        $character_id
    );
    
    $result = $stmt->execute();
    
    if ($result) {
        $response['success'] = true;
        $response['message'] = 'Character saved successfully';
    } else {
        $response['message'] = 'Error saving character: ' . $stmt->error;
    }
    
    $stmt->close();
}

// Return JSON response
echo json_encode($response);
exit;
?>