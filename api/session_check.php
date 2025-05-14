<?php
// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Function to check if user is logged in
function is_logged_in() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

// Function to redirect to login page if not logged in
function require_login($redirect_url = '/login.html') {
    if (!is_logged_in()) {
        header('Location: ' . $redirect_url);
        exit;
    }
}

// Function to get current user ID
function get_user_id() {
    return isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
}

// Function to get current username
function get_username() {
    return isset($_SESSION['username']) ? $_SESSION['username'] : null;
}

// API endpoint for checking login status (when called directly)
if (basename($_SERVER['PHP_SELF']) === 'session_check.php') {
    header('Content-Type: application/json');
    echo json_encode([
        'logged_in' => is_logged_in(),
        'user_id' => get_user_id(),
        'username' => get_username()
    ]);
    exit;
}
?>