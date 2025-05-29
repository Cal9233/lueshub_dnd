<?php
require_once 'config.php';

try {
    // Create audio_state table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS audio_state (
            id INT PRIMARY KEY AUTO_INCREMENT,
            playlist VARCHAR(50),
            track VARCHAR(255),
            playing BOOLEAN DEFAULT FALSE,
            volume DECIMAL(3,2) DEFAULT 0.50,
            updated_by INT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (updated_by) REFERENCES users(id)
        )
    ");
    echo "Audio state table created successfully.\n";
    
    // Add role column to users table if it doesn't exist
    $pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'player'");
    echo "Role column added to users table.\n";
    
    // Update existing admin user to have dungeon_master role
    $stmt = $pdo->prepare("UPDATE users SET role = 'dungeon_master' WHERE username = ? OR id = ?");
    $stmt->execute(['admin', 1]);
    echo "Admin user updated with dungeon_master role.\n";
    
    echo "\nAudio system setup completed successfully!";
} catch (Exception $e) {
    echo "Error setting up audio system: " . $e->getMessage();
}
?>