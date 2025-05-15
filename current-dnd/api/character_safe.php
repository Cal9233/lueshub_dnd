<?php
// Character API with extra-robust JSON handling
// Designed to handle JSON data with special characters, newlines, etc.

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

// Helper function to verify if user is admin (placeholder - implement properly)
function is_admin() {
    return false; // Replace with actual admin check
}

// Helper function to check if user is logged in (placeholder - implement properly)
function is_logged_in() {
    return true; // Replace with actual login check
}

// Helper function to get user ID (placeholder - implement properly)
function get_user_id() {
    return 1; // Replace with actual user ID retrieval
}

// Get character ID
$character_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Get user ID from query parameter or session
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : get_user_id();

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($character_id > 0) {
        // Fetch specific character
        $query = "SELECT * FROM characters WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $character_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result && $result->num_rows > 0) {
            $character = $result->fetch_assoc();
            
            // Handle JSON data with special care
            
            // Process notes - The most common problem area
            if (isset($character['notes'])) {
                $notesValue = $character['notes'];
                
                // 1. If already valid JSON, leave it as is
                $isValidJson = false;
                if (!empty($notesValue)) {
                    $testJson = json_decode($notesValue);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $isValidJson = true;
                        // Already valid JSON, do nothing special
                    }
                }
                
                // 2. If not valid JSON, try to handle it as a string that should be converted to an array
                if (!$isValidJson) {
                    // Set to empty array by default
                    $character['notes_array'] = [];
                    
                    // Try to parse it anyway with some preprocessing
                    if (!empty($notesValue)) {
                        try {
                            // Some common fixes for malformed JSON
                            $cleanedValue = preg_replace('/[\x00-\x1F\x7F]/u', '', $notesValue);
                            $cleanedValue = str_replace(["\r", "\n"], ["\\r", "\\n"], $cleanedValue);
                            
                            $parsedValue = json_decode($cleanedValue, true);
                            if (json_last_error() === JSON_ERROR_NONE && is_array($parsedValue)) {
                                $character['notes_array'] = $parsedValue;
                            }
                        } catch (Exception $e) {
                            // Keep default empty array
                        }
                    }
                } else {
                    // Valid JSON, parse it for client-side use
                    $character['notes_array'] = json_decode($notesValue, true);
                }
            } else {
                $character['notes_array'] = [];
            }
            
            // Process spell slots JSON
            if (isset($character['spell_slots_json'])) {
                $slotsValue = $character['spell_slots_json'];
                
                // 1. If already valid JSON, leave it as is
                $isValidJson = false;
                if (!empty($slotsValue)) {
                    $testJson = json_decode($slotsValue);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $isValidJson = true;
                        // Already valid JSON, do nothing special
                    }
                }
                
                // 2. If not valid JSON, try to handle it as a string that should be converted to an object
                if (!$isValidJson) {
                    // Set to empty object by default
                    $character['spell_slots_object'] = new stdClass();
                    
                    // Try to parse it anyway with some preprocessing
                    if (!empty($slotsValue)) {
                        try {
                            // Some common fixes for malformed JSON
                            $cleanedValue = preg_replace('/[\x00-\x1F\x7F]/u', '', $slotsValue);
                            $cleanedValue = str_replace(["\r", "\n"], ["\\r", "\\n"], $cleanedValue);
                            
                            $parsedValue = json_decode($cleanedValue, true);
                            if (json_last_error() === JSON_ERROR_NONE && is_array($parsedValue)) {
                                $character['spell_slots_object'] = $parsedValue;
                            }
                        } catch (Exception $e) {
                            // Keep default empty object
                        }
                    }
                } else {
                    // Valid JSON, parse it for client-side use
                    $character['spell_slots_object'] = json_decode($slotsValue, true);
                }
            } else {
                $character['spell_slots_object'] = new stdClass();
            }
            
            // Process spells_array_json (structured spell data)
            if (isset($character['spells_array_json'])) {
                $spellsValue = $character['spells_array_json'];
                
                // 1. If already valid JSON, leave it as is
                $isValidJson = false;
                if (!empty($spellsValue)) {
                    $testJson = json_decode($spellsValue);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $isValidJson = true;
                        // Already valid JSON, do nothing special
                    }
                }
                
                // 2. If not valid JSON, try to handle it as a string that should be converted to an array
                if (!$isValidJson) {
                    // Set to empty array by default
                    $character['spells_array'] = [];
                    
                    // Try to parse it anyway with some preprocessing
                    if (!empty($spellsValue)) {
                        try {
                            // Some common fixes for malformed JSON
                            $cleanedValue = preg_replace('/[\x00-\x1F\x7F]/u', '', $spellsValue);
                            $cleanedValue = str_replace(["\r", "\n"], ["\\r", "\\n"], $cleanedValue);
                            
                            $parsedValue = json_decode($cleanedValue, true);
                            if (json_last_error() === JSON_ERROR_NONE && is_array($parsedValue)) {
                                $character['spells_array'] = $parsedValue;
                            }
                        } catch (Exception $e) {
                            // Keep default empty array
                        }
                    }
                } else {
                    // Valid JSON, parse it for client-side use
                    $character['spells_array'] = json_decode($spellsValue, true);
                }
            } else {
                $character['spells_array'] = [];
            }
            
            // Convert numeric fields to actual numbers
            $numericFields = ['level', 'armor_class', 'hit_points', 'max_hit_points', 'temp_hit_points',
                            'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
                            'gold', 'silver', 'copper', 'spell_save_dc', 'spell_attack_bonus'];
            
            foreach ($numericFields as $field) {
                if (isset($character[$field])) {
                    $character[$field] = intval($character[$field]);
                }
            }
            
            $response['success'] = true;
            $response['message'] = 'Character found';
            $response['character'] = $character;
        } else {
            $response['message'] = 'Character not found';
        }
        
        $stmt->close();
    } else if ($user_id > 0) {
        // Fetch all characters for the user
        $query = "SELECT * FROM characters WHERE user_id = ? ORDER BY name ASC";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result) {
            $characters = array();
            
            while ($row = $result->fetch_assoc()) {
                // Process numeric fields for each character
                $numericFields = ['level', 'armor_class', 'hit_points', 'max_hit_points', 'temp_hit_points',
                                'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
                                'gold', 'silver', 'copper', 'spell_save_dc', 'spell_attack_bonus'];
                
                foreach ($numericFields as $field) {
                    if (isset($row[$field])) {
                        $row[$field] = intval($row[$field]);
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
    } else {
        $response['message'] = 'Invalid user ID or character ID';
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
    
    // Handle structured spell data
    $spells_array_json = isset($_POST['spells_array_json']) ? $_POST['spells_array_json'] : '[]';
    // Validate JSON
    $test_spells = json_decode($spells_array_json, true);
    if (!is_array($test_spells)) {
        $spells_array_json = '[]';
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
            spells_array_json = ?,
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
        $spell_slots_json, $spells_array_json, $known_spells, $weapons, $gear, $background, $notes,
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
echo json_encode($response, JSON_PARTIAL_OUTPUT_ON_ERROR);
exit;
?>