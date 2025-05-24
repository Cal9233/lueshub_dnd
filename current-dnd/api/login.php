<?php
// Start session
session_start();

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include database connection
require_once 'db.php';

// Set header to JSON
header('Content-Type: application/json');

// Default response
$response = array(
    'success' => false,
    'message' => 'Invalid request'
);

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if username and password are provided
    if (isset($_POST['username']) && isset($_POST['password'])) {
        $username = sanitize_input($_POST['username']);
        $password = sanitize_input($_POST['password']);
        
        // Log login attempt for debugging
        error_log("Login attempt - Username: $username, Password length: " . strlen($password));
        
        // Query to check if user exists - Use prepared statement to prevent SQL injection
        // LOWER() makes the comparison case-insensitive
        $stmt = mysqli_prepare($conn, "SELECT id, username, password, role FROM users WHERE LOWER(username) = LOWER(?)");
        mysqli_stmt_bind_param($stmt, "s", $username);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($result && mysqli_num_rows($result) > 0) {
            $user = mysqli_fetch_assoc($result);
            
            // Verify password
            if (verify_password($password, $user['password'])) {
                // Set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['logged_in'] = true;
                $_SESSION['role'] = isset($user['role']) ? $user['role'] : 'player';
                
                // Update response
                $response['success'] = true;
                $response['message'] = 'Login successful';
                $response['user_id'] = $user['id'];
                $response['role'] = $_SESSION['role'];
            } else {
                $response['message'] = 'Invalid username or password';
            }
        } else {
            $response['message'] = 'Invalid username or password';
        }
    } else {
        $response['message'] = 'Username and password are required';
    }
}

// Return JSON response
echo json_encode($response);
exit;
?>