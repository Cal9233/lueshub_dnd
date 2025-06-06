<?php
require_once 'config.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['success' => false, 'message' => 'Method not allowed'], 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';
$confirmPassword = $input['confirm_password'] ?? '';

// Validate input
if (empty($username) || empty($email) || empty($password)) {
    sendResponse(['success' => false, 'message' => 'All fields are required'], 400);
}

if ($password !== $confirmPassword) {
    sendResponse(['success' => false, 'message' => 'Passwords do not match'], 400);
}

if (strlen($password) < 6) {
    sendResponse(['success' => false, 'message' => 'Password must be at least 6 characters'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(['success' => false, 'message' => 'Invalid email address'], 400);
}

try {
    $db = getDB();
    
    // Check if username already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE LOWER(username) = LOWER(?)");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        sendResponse(['success' => false, 'message' => 'Username already taken'], 409);
    }
    
    // Hash password
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user (no email column in this table)
    $stmt = $db->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'player')");
    $stmt->execute([$username, $passwordHash]);
    
    $userId = $db->lastInsertId();
    
    // Auto-login the new user
    $_SESSION['user_id'] = $userId;
    $_SESSION['username'] = $username;
    $_SESSION['logged_in'] = true;
    $_SESSION['role'] = 'player';
    
    sendResponse([
        'success' => true,
        'user_id' => $userId,
        'username' => $username,
        'message' => 'Registration successful'
    ]);
    
} catch (Exception $e) {
    error_log('Registration error: ' . $e->getMessage());
    sendResponse(['success' => false, 'message' => 'An error occurred during registration: ' . $e->getMessage()], 500);
}