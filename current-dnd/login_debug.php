<?php
// Debug login script with detailed output

// Database credentials
$db_host = 'localhost';
$db_user = 'dnd_user';
$db_pass = 'LETme1n2dnd11!!';
$db_name = 'dnd_campaigns';

// Output header
echo "<h1>Login Debug Test</h1>";

// Initialize error messages
$errors = [];
$success = false;

try {
    // Check if form was submitted
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        echo "<h2>Processing Login Attempt</h2>";
        
        // Create connection
        $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

        // Check connection
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }
        
        echo "<p>Database connection successful.</p>";
        
        // Get input data
        $username = isset($_POST['username']) ? trim($_POST['username']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';
        
        echo "<p>Username provided: " . htmlspecialchars($username) . "</p>";
        echo "<p>Password length: " . strlen($password) . " characters</p>";
        
        if (empty($username) || empty($password)) {
            $errors[] = "Username and password are required.";
        } else {
            // Prepare a statement to prevent SQL injection
            $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }
            
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();
            
            echo "<p>SQL query executed.</p>";
            
            if ($result->num_rows > 0) {
                echo "<p style='color: green;'>User found in database.</p>";
                
                $user = $result->fetch_assoc();
                
                echo "<p>User ID: " . $user['id'] . "</p>";
                echo "<p>Stored password length: " . strlen($user['password']) . " characters</p>";
                echo "<p>First few characters of stored password: " . htmlspecialchars(substr($user['password'], 0, 3)) . "...</p>";
                
                // Check if the raw passwords match
                if ($password === $user['password']) {
                    echo "<p style='color: green;'>Raw password match!</p>";
                    $success = true;
                } else {
                    echo "<p style='color: red;'>Raw password does not match.</p>";
                    $errors[] = "Invalid password. Raw comparison failed.";
                }
            } else {
                echo "<p style='color: red;'>User not found in database.</p>";
                $errors[] = "User not found.";
            }
            
            $stmt->close();
        }
        
        $conn->close();
    } else {
        echo "<p>No form submission detected. Please use the form on the previous page.</p>";
    }
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
    $errors[] = "System error: " . $e->getMessage();
}

// Display final result
if ($success) {
    echo "<h2 style='color: green;'>Login Successful!</h2>";
    echo "<p>The user would be redirected to the characters page in a real login.</p>";
} else {
    echo "<h2 style='color: red;'>Login Failed</h2>";
    echo "<p>The following errors occurred:</p>";
    echo "<ul>";
    foreach ($errors as $error) {
        echo "<li>" . htmlspecialchars($error) . "</li>";
    }
    echo "</ul>";
}

// Back link
echo "<p><a href='db_test.php'>&laquo; Back to Database Test</a></p>";
?>