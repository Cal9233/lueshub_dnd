// Fix for character data not being available in the global scope
document.addEventListener('DOMContentLoaded', function() {
    console.log("CharacterDataFix: Initializing global character data fix");
    
    // Wait for the character-fixed.js script to initialize
    const checkAndFixInterval = setInterval(function() {
        // Check if characterData exists 
        if (typeof window.characterData === 'undefined') {
            console.log("CharacterDataFix: characterData not found in global scope, attempting to recover");
            
            // Get character ID from URL to help recover
            const urlParams = new URLSearchParams(window.location.search);
            const characterId = urlParams.get('id');
            
            if (!characterId) {
                console.error("CharacterDataFix: No character ID found in URL, cannot proceed");
                return; // Continue waiting
            }
            
            // Create a minimal characterData object if none exists
            window.characterData = {
                id: characterId,
                name: document.getElementById('charName')?.value || 'Character',
                spells_array: []
            };
            
            // Try to recover character data from the server
            fetch(`api/character_safe.php?id=${characterId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.character) {
                        console.log("CharacterDataFix: Successfully recovered character data from server");
                        
                        // Replace our minimal object with the full data
                        window.characterData = data.character;
                        
                        // Make sure spells_array is properly initialized
                        if (!Array.isArray(window.characterData.spells_array)) {
                            window.characterData.spells_array = [];
                        }
                        
                        // Force UI update if possible
                        if (typeof window.renderSpells === 'function') {
                            window.renderSpells();
                        }
                        
                        // Show notification
                        showMessage("Character data recovered successfully");
                    } else {
                        console.error("CharacterDataFix: Failed to recover data from server:", data.message);
                        showMessage("Warning: Limited character data available. Save issues may occur.", "warning");
                    }
                })
                .catch(error => {
                    console.error("CharacterDataFix: Error fetching character data:", error);
                    showMessage("Warning: Character data recovery failed. Some features may not work correctly.", "warning");
                });
            
            // Replace the saveCharacter function if it's missing
            if (typeof window.saveCharacter !== 'function') {
                console.log("CharacterDataFix: Providing replacement saveCharacter function");
                
                window.saveCharacter = async function(silentSave = false) {
                    console.log("CharacterDataFix: Replacement saveCharacter called");
                    
                    // Call directSaveSpells if available
                    if (typeof window.directSaveSpells === 'function') {
                        return window.directSaveSpells();
                    } else {
                        // Try to save directly via API
                        try {
                            // Collect form data
                            const formData = new FormData();
                            formData.append('action', 'save_character');
                            formData.append('id', characterId);
                            
                            // Add data from form fields
                            const formFields = [
                                { id: 'charName', key: 'name' },
                                { id: 'charRace', key: 'race' },
                                { id: 'charClass', key: 'class' },
                                { id: 'charLevel', key: 'level' },
                                { id: 'charAC', key: 'armor_class' },
                                { id: 'currentHP', key: 'hit_points' },
                                { id: 'maxHP', key: 'max_hit_points' },
                                { id: 'tempHP', key: 'temp_hit_points' },
                                { id: 'strength', key: 'strength' },
                                { id: 'dexterity', key: 'dexterity' },
                                { id: 'constitution', key: 'constitution' },
                                { id: 'intelligence', key: 'intelligence' },
                                { id: 'wisdom', key: 'wisdom' },
                                { id: 'charisma', key: 'charisma' },
                                { id: 'gold', key: 'gold' },
                                { id: 'silver', key: 'silver' },
                                { id: 'copper', key: 'copper' },
                                { id: 'spellDC', key: 'spell_save_dc' },
                                { id: 'spellAttack', key: 'spell_attack_bonus' },
                                { id: 'knownSpells', key: 'known_spells' },
                                { id: 'weapons', key: 'weapons' },
                                { id: 'gear', key: 'gear' },
                                { id: 'background', key: 'background' }
                            ];
                            
                            formFields.forEach(field => {
                                const element = document.getElementById(field.id);
                                if (element) {
                                    formData.append(field.key, element.value || '');
                                    // Also update the characterData object
                                    window.characterData[field.key] = element.value || '';
                                }
                            });
                            
                            // Add spell data
                            if (Array.isArray(window.characterData.spells_array)) {
                                formData.append('spells_array_json', JSON.stringify(window.characterData.spells_array));
                            } else {
                                formData.append('spells_array_json', '[]');
                            }
                            
                            // Add empty values for other required fields
                            formData.append('spell_slots_json', '{}');
                            formData.append('notes', '[]');
                            
                            // Send the request
                            const response = await fetch(`api/character_safe.php?id=${characterId}`, {
                                method: 'POST',
                                body: formData
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                                if (!silentSave) {
                                    showMessage('Character saved successfully!');
                                }
                                return true;
                            } else {
                                showMessage('Error saving character: ' + (data.message || 'Unknown error'));
                                return false;
                            }
                        } catch (error) {
                            console.error("CharacterDataFix: Error in replacement saveCharacter:", error);
                            showMessage('Error saving character: ' + error.message);
                            return false;
                        }
                    }
                };
            }
        } else {
            console.log("CharacterDataFix: characterData found in global scope, checking properties");
            
            // Ensure spells_array exists and is an array
            if (!Array.isArray(window.characterData.spells_array)) {
                console.log("CharacterDataFix: spells_array is not an array, fixing");
                window.characterData.spells_array = [];
            }
            
            // Check for saveCharacter function
            if (typeof window.saveCharacter !== 'function') {
                console.error("CharacterDataFix: saveCharacter function missing but characterData exists");
                
                // This is unexpected but we'll provide a replacement anyway
                window.saveCharacter = function(silentSave = false) {
                    if (typeof window.directSaveSpells === 'function') {
                        return window.directSaveSpells();
                    } else {
                        showMessage('Error: Save function not available');
                        return false;
                    }
                };
            }
            
            // Stop checking once we've found and validated characterData
            clearInterval(checkAndFixInterval);
            console.log("CharacterDataFix: Character data validation complete");
        }
    }, 500); // Check every 500ms
    
    // Stop checking after 10 seconds no matter what
    setTimeout(() => {
        clearInterval(checkAndFixInterval);
        console.log("CharacterDataFix: Stopped interval checks after timeout");
    }, 10000);
    
    // Helper function to show messages
    function showMessage(message, type = 'info') {
        // Try to use the existing toast system
        if (typeof window.showToast === 'function') {
            window.showToast(message);
        } else {
            // Create our own toast notification
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '4px';
            toast.style.zIndex = '10000';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            
            if (type === 'warning') {
                toast.style.backgroundColor = '#ff9800';
                toast.style.color = 'white';
            } else if (type === 'error') {
                toast.style.backgroundColor = '#f44336';
                toast.style.color = 'white';
            } else {
                toast.style.backgroundColor = '#4CAF50';
                toast.style.color = 'white';
            }
            
            document.body.appendChild(toast);
            
            // Fade in
            setTimeout(() => {
                toast.style.opacity = '1';
            }, 10);
            
            // Fade out and remove after 3 seconds
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }
    }
    
    console.log("CharacterDataFix: Initialization complete");
});