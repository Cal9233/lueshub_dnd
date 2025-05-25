<?php
require_once 'config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// Validate input
if (empty($username) || empty($password)) {
    sendResponse(['success' => false, 'message' => 'Username and password are required'], 400);
}

try {
    $db = getDB();
    
    // Find user (case-insensitive username)
    $stmt = $db->prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?)");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendResponse(['success' => false, 'message' => 'Invalid username or password'], 401);
    }
    
    // Verify password (support multiple formats for compatibility)
    $valid = false;
    
    // Try bcrypt first (most secure)
    if (password_verify($password, $user['password'])) {
        $valid = true;
    }
    // Try MD5 (legacy support)
    else if ($user['password'] === md5($password)) {
        $valid = true;
        // Update to bcrypt for security
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $updateStmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$newHash, $user['id']]);
    }
    // Try plain text (legacy support - very insecure!)
    else if ($user['password'] === $password) {
        $valid = true;
        // Update to bcrypt for security
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $updateStmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$newHash, $user['id']]);
    }
    
    if (!$valid) {
        sendResponse(['success' => false, 'message' => 'Invalid username or password'], 401);
    }
    
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['logged_in'] = true;
    $_SESSION['role'] = $user['role'] ?? 'player';
    
    // Return success with user data
    sendResponse([
        'success' => true,
        'user_id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'] ?? 'player',
        'message' => 'Login successful'
    ]);
    
} catch (Exception $e) {
    error_log('Login error: ' . $e->getMessage());
    sendResponse(['success' => false, 'message' => 'An error occurred during login'], 500);
}