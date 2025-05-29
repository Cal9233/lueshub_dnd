<?php
// This is a backup of the old character.php file
// Kept for reference during migration

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// Get character ID from URL if provided
$character_id = isset($_GET['id']) ? intval($_GET['id']) : null;

switch ($method) {
    case 'GET':
        if ($character_id) {
            // Get specific character
            $stmt = $pdo->prepare("SELECT * FROM characters WHERE id = ? AND user_id = ?");
            $stmt->execute([$character_id, $user_id]);
            $character = $stmt->fetch();
            
            if ($character) {
                echo json_encode($character);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Character not found']);
            }
        } else {
            // Get all characters for user
            $stmt = $pdo->prepare("SELECT * FROM characters WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$user_id]);
            $characters = $stmt->fetchAll();
            echo json_encode($characters);
        }
        break;
        
    case 'POST':
        // Create new character
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        if (!isset($data['name']) || !isset($data['class']) || !isset($data['level'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO characters (user_id, name, class, level, data) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            $data['name'],
            $data['class'],
            $data['level'],
            json_encode($data)
        ]);
        
        $character_id = $pdo->lastInsertId();
        echo json_encode(['id' => $character_id, 'message' => 'Character created']);
        break;
        
    case 'PUT':
        // Update character
        if (!$character_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Character ID required']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Verify ownership
        $stmt = $pdo->prepare("SELECT id FROM characters WHERE id = ? AND user_id = ?");
        $stmt->execute([$character_id, $user_id]);
        
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            exit;
        }
        
        // Update character
        $stmt = $pdo->prepare("UPDATE characters SET name = ?, class = ?, level = ?, data = ? WHERE id = ?");
        $stmt->execute([
            $data['name'] ?? '',
            $data['class'] ?? '',
            $data['level'] ?? 1,
            json_encode($data),
            $character_id
        ]);
        
        echo json_encode(['message' => 'Character updated']);
        break;
        
    case 'DELETE':
        // Delete character
        if (!$character_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Character ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM characters WHERE id = ? AND user_id = ?");
        $stmt->execute([$character_id, $user_id]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Character deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Character not found']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>