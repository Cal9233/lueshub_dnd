<?php
// Database connection file
$db_host = 'localhost';
$db_user = 'dnd_user';
$db_pass = 'LETme1n2dnd11!!';
$db_name = 'dnd_campaigns';

// Create database connection
$conn = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Set character set to utf8
mysqli_set_charset($conn, "utf8");

// Function to sanitize input data
function sanitize_input($data) {
    global $conn;
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return mysqli_real_escape_string($conn, $data);
}

// Function to verify password
function verify_password($input_password, $stored_password) {
    // Log for debugging (remove in production)
    error_log("Password verification - Input: $input_password, Stored: $stored_password");
    
    // Try direct comparison first (plain text passwords)
    if ($input_password === $stored_password) {
        return true;
    }
    
    // Try password_verify for hashed passwords (for future use)
    if (password_verify($input_password, $stored_password)) {
        return true;
    }
    
    // Try MD5 hash comparison (some legacy systems use this)
    if (md5($input_password) === $stored_password) {
        return true;
    }
    
    // Failed all verification methods
    return false;
}
?>