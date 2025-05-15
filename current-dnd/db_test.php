<?php
// Test database connection

// Database credentials
$db_host = 'localhost';
$db_user = 'dnd_user';
$db_pass = 'LETme1n2dnd11!!';
$db_name = 'dnd_campaigns';

// Output header
echo "<h1>Database Connection Test</h1>";

try {
    // Create connection
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    echo "<p style='color: green;'>Database connection successful!</p>";
    
    // Check if users table exists
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    if ($result->num_rows > 0) {
        echo "<p style='color: green;'>Users table exists.</p>";
        
        // Get user count
        $result = $conn->query("SELECT COUNT(*) as count FROM users");
        $row = $result->fetch_assoc();
        echo "<p>Total users: " . $row['count'] . "</p>";
        
        // Display table structure
        $result = $conn->query("DESCRIBE users");
        if ($result->num_rows > 0) {
            echo "<h2>Users Table Structure</h2>";
            echo "<table border='1'><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
            
            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                echo "<td>" . $row["Field"] . "</td>";
                echo "<td>" . $row["Type"] . "</td>";
                echo "<td>" . $row["Null"] . "</td>";
                echo "<td>" . $row["Key"] . "</td>";
                echo "<td>" . ($row["Default"] !== null ? $row["Default"] : "NULL") . "</td>";
                echo "<td>" . $row["Extra"] . "</td>";
                echo "</tr>";
            }
            
            echo "</table>";
        }
        
        // Display first few users (without passwords)
        $result = $conn->query("SELECT id, username FROM users LIMIT 5");
        if ($result->num_rows > 0) {
            echo "<h2>Sample Users</h2>";
            echo "<table border='1'><tr><th>ID</th><th>Username</th></tr>";
            
            while ($row = $result->fetch_assoc()) {
                echo "<tr>";
                echo "<td>" . $row["id"] . "</td>";
                echo "<td>" . $row["username"] . "</td>";
                echo "</tr>";
            }
            
            echo "</table>";
        }
    } else {
        echo "<p style='color: red;'>Users table does not exist!</p>";
    }
    
    $conn->close();
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}
?>

<hr>
<h2>Debug Login Script</h2>
<form method="post" action="login_debug.php">
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required><br><br>
    
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required><br><br>
    
    <input type="submit" value="Test Login">
</form>