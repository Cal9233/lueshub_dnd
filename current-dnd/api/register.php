<?php
// Start session
session_start();

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
        $email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
        
        // Validate username length
        if (strlen($username) < 3) {
            $response['message'] = 'Username must be at least 3 characters long';
            echo json_encode($response);
            exit;
        }
        
        // Validate password length
        if (strlen($password) < 6) {
            $response['message'] = 'Password must be at least 6 characters long';
            echo json_encode($response);
            exit;
        }
        
        // Check if username already exists (case-insensitive)
        $check_stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE LOWER(username) = LOWER(?)");
        mysqli_stmt_bind_param($check_stmt, "s", $username);
        mysqli_stmt_execute($check_stmt);
        $result = mysqli_stmt_get_result($check_stmt);
        
        if ($result && mysqli_num_rows($result) > 0) {
            $response['message'] = 'Username already exists';
            echo json_encode($response);
            mysqli_stmt_close($check_stmt);
            exit;
        }
        
        mysqli_stmt_close($check_stmt);
        
        // Insert new user
        $insert_stmt = mysqli_prepare($conn, "INSERT INTO users (username, password) VALUES (?, ?)");
        mysqli_stmt_bind_param($insert_stmt, "ss", $username, $password);
        
        if (mysqli_stmt_execute($insert_stmt)) {
            $user_id = mysqli_insert_id($conn);
            
            // Automatically log in the user
            $_SESSION['user_id'] = $user_id;
            $_SESSION['username'] = $username;
            $_SESSION['logged_in'] = true;
            
            $response['success'] = true;
            $response['message'] = 'Registration successful';
            $response['user_id'] = $user_id;
        } else {
            $response['message'] = 'Registration failed: ' . mysqli_error($conn);
        }
        
        mysqli_stmt_close($insert_stmt);
    } else {
        $response['message'] = 'Username and password are required';
    }
} else {
    $response['message'] = 'Invalid request method';
}

// Close database connection
mysqli_close($conn);

// Send response
echo json_encode($response);
?>