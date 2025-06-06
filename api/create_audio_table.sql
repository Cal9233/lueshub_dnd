-- Create audio_state table for synchronized audio playback
CREATE TABLE IF NOT EXISTS audio_state (
    id INT PRIMARY KEY AUTO_INCREMENT,
    playlist VARCHAR(50),
    track VARCHAR(255),
    playing BOOLEAN DEFAULT FALSE,
    volume DECIMAL(3,2) DEFAULT 0.50,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'player';

-- Update existing admin user to have dungeon_master role
UPDATE users SET role = 'dungeon_master' WHERE username = 'admin' OR id = 1;