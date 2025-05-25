<?php
require_once 'config.php';

// Require authentication
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user_id'];

try {
    $db = getDB();
    
    switch ($method) {
        case 'GET':
            // Get specific character or all characters
            if (isset($_GET['id'])) {
                $characterId = intval($_GET['id']);
                
                // Get specific character
                $stmt = $db->prepare("SELECT * FROM characters WHERE id = ? AND user_id = ?");
                $stmt->execute([$characterId, $userId]);
                $character = $stmt->fetch();
                
                if (!$character) {
                    sendResponse(['success' => false, 'message' => 'Character not found'], 404);
                }
                
                // Parse JSON fields
                if (!empty($character['spells_array_json'])) {
                    $character['spells'] = json_decode($character['spells_array_json'], true);
                }
                
                sendResponse(['success' => true, 'character' => $character]);
            } else {
                // Get all characters for user
                $stmt = $db->prepare("SELECT id, name, race, class, level, hit_points as hp, max_hit_points as max_hp, armor_class as ac FROM characters WHERE user_id = ? ORDER BY name");
                $stmt->execute([$userId]);
                $characters = $stmt->fetchAll();
                
                sendResponse(['success' => true, 'characters' => $characters]);
            }
            break;
            
        case 'POST':
            // Create or update character
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (isset($input['character_id'])) {
                // Update existing character
                $characterId = intval($input['character_id']);
                
                // Verify ownership
                $stmt = $db->prepare("SELECT id FROM characters WHERE id = ? AND user_id = ?");
                $stmt->execute([$characterId, $userId]);
                if (!$stmt->fetch()) {
                    sendResponse(['success' => false, 'message' => 'Character not found'], 404);
                }
                
                // Build update query dynamically
                $updates = [];
                $params = [];
                $allowedFields = ['name', 'race', 'class', 'level', 'hit_points', 'max_hit_points', 'temp_hit_points', 'armor_class'];
                
                foreach ($allowedFields as $field) {
                    if (isset($input[$field])) {
                        $updates[] = "$field = ?";
                        $params[] = $input[$field];
                    }
                }
                
                if (!empty($updates)) {
                    $params[] = $characterId;
                    $params[] = $userId;
                    $sql = "UPDATE characters SET " . implode(', ', $updates) . " WHERE id = ? AND user_id = ?";
                    $stmt = $db->prepare($sql);
                    $stmt->execute($params);
                }
                
                sendResponse(['success' => true, 'message' => 'Character updated']);
            } else {
                // Create new character
                $stmt = $db->prepare("INSERT INTO characters (user_id, name, race, class, level, hit_points, max_hit_points, armor_class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $userId,
                    $input['name'] ?? 'New Character',
                    $input['race'] ?? 'Human',
                    $input['class'] ?? 'Fighter',
                    $input['level'] ?? 1,
                    $input['hit_points'] ?? 10,
                    $input['max_hit_points'] ?? 10,
                    $input['armor_class'] ?? 10
                ]);
                
                $characterId = $db->lastInsertId();
                sendResponse(['success' => true, 'character_id' => $characterId, 'message' => 'Character created']);
            }
            break;
            
        case 'DELETE':
            // Delete character
            if (!isset($_GET['id'])) {
                sendResponse(['success' => false, 'message' => 'Character ID required'], 400);
            }
            
            $characterId = intval($_GET['id']);
            $stmt = $db->prepare("DELETE FROM characters WHERE id = ? AND user_id = ?");
            $stmt->execute([$characterId, $userId]);
            
            if ($stmt->rowCount() > 0) {
                sendResponse(['success' => true, 'message' => 'Character deleted']);
            } else {
                sendResponse(['success' => false, 'message' => 'Character not found'], 404);
            }
            break;
            
        default:
            sendResponse(['success' => false, 'message' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log('Character API error: ' . $e->getMessage());
    sendResponse(['success' => false, 'message' => 'An error occurred'], 500);
}