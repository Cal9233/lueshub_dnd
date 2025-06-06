<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
    // Get user role
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit();
    }
    
    $isDM = ($user['role'] === 'dungeon_master' || $user['role'] === 'admin');
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get current audio state
            $stmt = $pdo->prepare("SELECT * FROM audio_state ORDER BY updated_at DESC LIMIT 1");
            $stmt->execute();
            $audioState = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($audioState) {
                // Parse JSON data
                $audioState['playing'] = (bool)$audioState['playing'];
                $audioState['volume'] = (float)$audioState['volume'];
                
                echo json_encode([
                    'success' => true,
                    'audioState' => $audioState
                ]);
            } else {
                // Return default state if none exists
                echo json_encode([
                    'success' => true,
                    'audioState' => [
                        'playlist' => null,
                        'track' => null,
                        'playing' => false,
                        'volume' => 0.5,
                        'updated_at' => date('Y-m-d H:i:s')
                    ]
                ]);
            }
            break;
            
        case 'POST':
            // Only DMs can update audio state
            if (!$isDM) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Only Dungeon Masters can control audio']);
                exit();
            }
            
            // Get input data
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate input
            $playlist = $data['playlist'] ?? null;
            $track = $data['track'] ?? null;
            $playing = isset($data['playing']) ? (bool)$data['playing'] : false;
            $volume = isset($data['volume']) ? (float)$data['volume'] : 0.5;
            
            // Clamp volume between 0 and 1
            $volume = max(0, min(1, $volume));
            
            // Check if state exists
            $stmt = $pdo->prepare("SELECT id FROM audio_state LIMIT 1");
            $stmt->execute();
            $exists = $stmt->fetch();
            
            if ($exists) {
                // Update existing state
                $stmt = $pdo->prepare("
                    UPDATE audio_state 
                    SET playlist = ?, track = ?, playing = ?, volume = ?, 
                        updated_by = ?, updated_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([
                    $playlist,
                    $track,
                    $playing ? 1 : 0,
                    $volume,
                    $userId,
                    $exists['id']
                ]);
            } else {
                // Insert new state
                $stmt = $pdo->prepare("
                    INSERT INTO audio_state (playlist, track, playing, volume, updated_by, updated_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())
                ");
                $stmt->execute([
                    $playlist,
                    $track,
                    $playing ? 1 : 0,
                    $volume,
                    $userId
                ]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Audio state updated successfully'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    error_log('Audio State API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error occurred']);
}
?>