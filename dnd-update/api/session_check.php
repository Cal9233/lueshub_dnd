<?php
require_once 'config.php';

// Check if user is logged in
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    sendResponse([
        'logged_in' => true,
        'user_id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role'] ?? 'player'
    ]);
} else {
    sendResponse([
        'logged_in' => false
    ]);
}