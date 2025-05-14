<?php
// Database schema update script
// This script adds the spells_array_json column to the characters table if it doesn't exist

// Include database connection
$db_host = 'localhost';
$db_user = 'dnd_user';
$db_pass = 'LETme1n2dnd11!!';
$db_name = 'dnd_campaigns';
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// Set header to JSON for API-like response
header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Default response
$response = array(
    'success' => false,
    'message' => 'Operation failed'
);

try {
    // Check if spells_array_json column exists
    $checkColumnSql = "SHOW COLUMNS FROM `characters` LIKE 'spells_array_json'";
    $checkResult = $conn->query($checkColumnSql);
    
    if ($checkResult->num_rows == 0) {
        // Column doesn't exist, add it
        $addColumnSql = "ALTER TABLE `characters` ADD COLUMN `spells_array_json` LONGTEXT AFTER `known_spells`";
        if ($conn->query($addColumnSql) === TRUE) {
            $response['success'] = true;
            $response['message'] = "Successfully added spells_array_json column to characters table";
            
            // Update all existing characters to have empty array for spells_array_json
            $updateSql = "UPDATE `characters` SET `spells_array_json` = '[]' WHERE `spells_array_json` IS NULL";
            if ($conn->query($updateSql) === TRUE) {
                $response['message'] .= " and initialized existing records";
            } else {
                $response['message'] .= " but failed to initialize existing records: " . $conn->error;
            }
        } else {
            $response['message'] = "Failed to add spells_array_json column: " . $conn->error;
        }
    } else {
        $response['success'] = true;
        $response['message'] = "spells_array_json column already exists in characters table";
    }
    
    // Also check if any character has NULL value for spells_array_json
    $checkNullSql = "SELECT COUNT(*) AS null_count FROM `characters` WHERE `spells_array_json` IS NULL";
    $nullResult = $conn->query($checkNullSql);
    $nullRow = $nullResult->fetch_assoc();
    
    if ($nullRow['null_count'] > 0) {
        // Update records with NULL value
        $updateNullSql = "UPDATE `characters` SET `spells_array_json` = '[]' WHERE `spells_array_json` IS NULL";
        if ($conn->query($updateNullSql) === TRUE) {
            $response['message'] .= ". Fixed " . $nullRow['null_count'] . " records with NULL values";
        } else {
            $response['message'] .= ". Failed to fix NULL values: " . $conn->error;
        }
    }
    
    // Migrate data from known_spells to spells_array_json if needed
    $migrateSql = "SELECT id, known_spells, spells_array_json FROM `characters` WHERE `known_spells` != '' AND (`spells_array_json` = '[]' OR `spells_array_json` = '')";
    $migrateResult = $conn->query($migrateSql);
    
    if ($migrateResult && $migrateResult->num_rows > 0) {
        $response['migrations'] = array();
        
        while ($row = $migrateResult->fetch_assoc()) {
            $charId = $row['id'];
            $knownSpells = $row['known_spells'];
            
            // Simple migration logic - convert each line to a spell object
            $spellsArray = array();
            $lines = explode("\n", $knownSpells);
            
            $currentLevel = 'cantrip';
            foreach ($lines as $line) {
                $trimmedLine = trim($line);
                if (empty($trimmedLine)) continue;
                
                // Check if this is a level heading
                if (preg_match('/^(cantrips|level\s+\d+)\s*:/i', $trimmedLine, $matches)) {
                    $levelText = strtolower(rtrim($matches[1], ':'));
                    if ($levelText === 'cantrips') {
                        $currentLevel = 'cantrip';
                    } else if (preg_match('/level\s+(\d+)/i', $levelText, $levelMatches)) {
                        $currentLevel = $levelMatches[1];
                    }
                    continue;
                }
                
                // Check if this is a spell entry
                if (preg_match('/^[-*]\s*(.*)/i', $trimmedLine, $spellMatches)) {
                    $spellName = trim($spellMatches[1]);
                    if (!empty($spellName)) {
                        $spellsArray[] = array(
                            'id' => time() . rand(1000, 9999),
                            'name' => $spellName,
                            'level' => $currentLevel,
                            'school' => 'evocation',
                            'casting_time' => '1 action',
                            'range' => '60 feet',
                            'duration' => 'Instantaneous',
                            'components' => 'V, S',
                            'description' => 'No description provided.',
                            'higher_levels' => '',
                            'ritual' => false,
                            'concentration' => false,
                            'prepared' => false
                        );
                    }
                }
            }
            
            if (!empty($spellsArray)) {
                $spellsJson = json_encode($spellsArray);
                $updateSpellsSql = "UPDATE `characters` SET `spells_array_json` = ? WHERE `id` = ?";
                $stmt = $conn->prepare($updateSpellsSql);
                $stmt->bind_param("si", $spellsJson, $charId);
                
                if ($stmt->execute()) {
                    $response['migrations'][] = array(
                        'character_id' => $charId,
                        'spells_count' => count($spellsArray),
                        'status' => 'success'
                    );
                } else {
                    $response['migrations'][] = array(
                        'character_id' => $charId,
                        'status' => 'failed',
                        'error' => $stmt->error
                    );
                }
                
                $stmt->close();
            }
        }
    }
} catch (Exception $e) {
    $response['message'] = "Exception occurred: " . $e->getMessage();
}

// Close connection
$conn->close();

// Return JSON response
echo json_encode($response, JSON_PRETTY_PRINT);
?>