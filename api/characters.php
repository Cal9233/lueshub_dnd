<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit();
}

$userId = $_SESSION['user_id'];

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get specific character
                $characterId = (int)$_GET['id'];
                $stmt = $pdo->prepare("SELECT * FROM characters WHERE id = ? AND user_id = ?");
                $stmt->execute([$characterId, $userId]);
                $character = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($character) {
                    // Parse JSON fields
                    $character['spell_slots_object'] = json_decode($character['spell_slots_json'] ?? '{}', true);
                    $character['spells_array'] = json_decode($character['spells_array_json'] ?? '[]', true);
                    $character['notes_array'] = json_decode($character['notes'] ?? '[]', true);
                    
                    echo json_encode(['success' => true, 'character' => $character]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Character not found']);
                }
            } else {
                // Get all characters for user
                $stmt = $pdo->prepare("SELECT id, name, race, class, level, armor_class, hit_points, max_hit_points, portrait_url FROM characters WHERE user_id = ? ORDER BY name");
                $stmt->execute([$userId]);
                $characters = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['success' => true, 'characters' => $characters]);
            }
            break;
            
        case 'POST':
            // Create or update character
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['name']) || empty($data['name'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Character name is required']);
                exit();
            }
            
            // Prepare data with defaults
            $characterData = [
                'name' => $data['name'] ?? '',
                'race' => $data['race'] ?? '',
                'class' => $data['class'] ?? '',
                'level' => (int)($data['level'] ?? 1),
                'armor_class' => (int)($data['armor_class'] ?? 10),
                'hit_points' => (int)($data['hit_points'] ?? 10),
                'max_hit_points' => (int)($data['max_hit_points'] ?? 10),
                'temp_hit_points' => (int)($data['temp_hit_points'] ?? 0),
                'strength' => (int)($data['strength'] ?? 10),
                'dexterity' => (int)($data['dexterity'] ?? 10),
                'constitution' => (int)($data['constitution'] ?? 10),
                'intelligence' => (int)($data['intelligence'] ?? 10),
                'wisdom' => (int)($data['wisdom'] ?? 10),
                'charisma' => (int)($data['charisma'] ?? 10),
                'gold' => (int)($data['gold'] ?? 0),
                'silver' => (int)($data['silver'] ?? 0),
                'copper' => (int)($data['copper'] ?? 0),
                'spell_save_dc' => (int)($data['spell_save_dc'] ?? 10),
                'spell_attack_bonus' => (int)($data['spell_attack_bonus'] ?? 0),
                'spell_slots_json' => $data['spell_slots_json'] ?? '{}',
                'known_spells' => $data['known_spells'] ?? '',
                'spells_array_json' => $data['spells_array_json'] ?? '[]',
                'weapons' => $data['weapons'] ?? '',
                'gear' => $data['gear'] ?? '',
                'background' => $data['background'] ?? '',
                'notes' => $data['notes'] ?? '[]',
                'portrait_url' => $data['portrait_url'] ?? '',
                'initiative' => (int)($data['initiative'] ?? 0),
                'speed' => (int)($data['speed'] ?? 30),
                'hit_dice_current' => (int)($data['hit_dice_current'] ?? 1),
                'hit_dice_max' => (int)($data['hit_dice_max'] ?? 1),
                'hit_dice_type' => $data['hit_dice_type'] ?? 'd8',
                'passive_perception' => (int)($data['passive_perception'] ?? 10),
                'proficiency_bonus' => (int)($data['proficiency_bonus'] ?? 2),
                'spellcasting_ability' => $data['spellcasting_ability'] ?? 'intelligence'
            ];
            
            if (isset($data['id']) && $data['id']) {
                // Update existing character
                $characterId = (int)$data['id'];
                
                // Verify ownership
                $stmt = $pdo->prepare("SELECT id FROM characters WHERE id = ? AND user_id = ?");
                $stmt->execute([$characterId, $userId]);
                if (!$stmt->fetch()) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                    exit();
                }
                
                // Build update query
                $fields = [];
                $values = [];
                foreach ($characterData as $key => $value) {
                    $fields[] = "$key = ?";
                    $values[] = $value;
                }
                $values[] = $characterId;
                $values[] = $userId;
                
                $sql = "UPDATE characters SET " . implode(', ', $fields) . " WHERE id = ? AND user_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($values);
                
                echo json_encode(['success' => true, 'message' => 'Character updated successfully', 'id' => $characterId]);
            } else {
                // Create new character
                $characterData['user_id'] = $userId;
                
                $fields = array_keys($characterData);
                $placeholders = array_fill(0, count($fields), '?');
                
                $sql = "INSERT INTO characters (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array_values($characterData));
                
                $characterId = $pdo->lastInsertId();
                echo json_encode(['success' => true, 'message' => 'Character created successfully', 'id' => $characterId]);
            }
            break;
            
        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Character ID required']);
                exit();
            }
            
            $characterId = (int)$_GET['id'];
            
            // Delete character (with ownership check)
            $stmt = $pdo->prepare("DELETE FROM characters WHERE id = ? AND user_id = ?");
            $stmt->execute([$characterId, $userId]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Character deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Character not found']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log('Character API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
}
?>