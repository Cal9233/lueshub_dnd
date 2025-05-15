// Direct fix for saving spells independently of the main save function
document.addEventListener('DOMContentLoaded', function() {
    console.log("SaveSpellsFix: Initializing direct save fix");
    
    // Function to directly save spell data to the server
    window.directSaveSpells = async function() {
        console.log("SaveSpellsFix: Attempting direct save of spells");
        
        // Get character ID either from characterData or from URL
        let characterId;
        if (window.characterData && window.characterData.id) {
            characterId = window.characterData.id;
        } else {
            // Try to get from URL as fallback
            const urlParams = new URLSearchParams(window.location.search);
            characterId = urlParams.get('id');
            if (!characterId) {
                console.error("SaveSpellsFix: No character ID available");
                alert("Error: Cannot save without character ID. Please refresh the page and try again.");
                return false;
            }
            console.log("SaveSpellsFix: Using character ID from URL:", characterId);
        }
        
        // Initialize characterData if it doesn't exist
        if (!window.characterData) {
            window.characterData = {
                id: characterId,
                spells_array: []
            };
            console.log("SaveSpellsFix: Created minimal characterData object");
        }
        
        try {
            // Ensure spells_array is properly initialized
            if (!window.characterData.spells_array) {
                window.characterData.spells_array = [];
            }
            
            // Ensure it's an array
            if (!Array.isArray(window.characterData.spells_array)) {
                window.characterData.spells_array = [];
            }
            
            // Create FormData for the request
            const formData = new FormData();
            formData.append('action', 'save_character');
            formData.append('id', window.characterData.id);
            
            // Copy essential fields from character data
            // We include just enough fields to make the save work
            // This reduces the chance of data corruption
            const essentialFields = [
                'name', 'race', 'class', 'level', 'armor_class', 
                'hit_points', 'max_hit_points', 'temp_hit_points',
                'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
                'gold', 'silver', 'copper', 'spell_save_dc', 'spell_attack_bonus',
                'known_spells', 'weapons', 'gear', 'background'
            ];
            
            // Add all essential fields to the form data
            essentialFields.forEach(field => {
                if (window.characterData.hasOwnProperty(field)) {
                    formData.append(field, window.characterData[field] || '');
                }
            });
            
            // Add spell slots JSON if available
            try {
                if (window.spellSlots && typeof window.spellSlots === 'object') {
                    formData.append('spell_slots_json', JSON.stringify(window.spellSlots));
                } else {
                    formData.append('spell_slots_json', '{}');
                }
            } catch (e) {
                console.error("SaveSpellsFix: Error stringifying spell slots:", e);
                formData.append('spell_slots_json', '{}');
            }
            
            // Add notes if available
            try {
                if (window.notesData && Array.isArray(window.notesData)) {
                    formData.append('notes', JSON.stringify(window.notesData));
                } else {
                    formData.append('notes', '[]');
                }
            } catch (e) {
                console.error("SaveSpellsFix: Error stringifying notes:", e);
                formData.append('notes', '[]');
            }
            
            // Convert structured spell data to JSON and add to form data
            try {
                const spellsJson = JSON.stringify(window.characterData.spells_array);
                console.log("SaveSpellsFix: Serialized spells JSON:", spellsJson);
                formData.append('spells_array_json', spellsJson);
            } catch (e) {
                console.error("SaveSpellsFix: Error stringifying spells array:", e);
                formData.append('spells_array_json', '[]');
                return false;
            }
            
            // Create a simplified form data just for spells
            const spellsFormData = new FormData();
            spellsFormData.append('id', characterId);
            spellsFormData.append('spells_array_json', JSON.stringify(window.characterData.spells_array || []));
            
            // First try our dedicated endpoint for spells only
            console.log("SaveSpellsFix: Sending save request to dedicated spells API");
            try {
                const spellsResponse = await fetch('api/save_spells.php', {
                    method: 'POST',
                    body: spellsFormData
                });
                
                const spellsData = await spellsResponse.json();
                
                if (spellsData.success) {
                    console.log("SaveSpellsFix: Spells saved successfully via dedicated endpoint", spellsData);
                    if (typeof window.showToast === 'function') {
                        window.showToast('Spells saved successfully');
                    } else {
                        alert('Spells saved successfully');
                    }
                    return true;
                } else {
                    console.error("SaveSpellsFix: Dedicated endpoint failed, falling back to main API", spellsData);
                }
            } catch (error) {
                console.error("SaveSpellsFix: Error with dedicated endpoint, falling back to main API:", error);
            }
            
            // Fallback to main API if dedicated endpoint fails
            console.log("SaveSpellsFix: Sending save request to main API");
            const response = await fetch(`api/character_safe.php?id=${characterId}`, {
                method: 'POST',
                body: formData
            });
            
            // Parse and handle the response
            const data = await response.json();
            
            if (data.success) {
                console.log("SaveSpellsFix: Save successful", data);
                if (typeof window.showToast === 'function') {
                    window.showToast('Spells saved successfully');
                } else {
                    alert('Spells saved successfully');
                }
                return true;
            } else {
                console.error("SaveSpellsFix: Save failed", data);
                if (typeof window.showToast === 'function') {
                    window.showToast('Error saving spells: ' + (data.message || 'Unknown error'));
                } else {
                    alert('Error saving spells: ' + (data.message || 'Unknown error'));
                }
                return false;
            }
        } catch (error) {
            console.error("SaveSpellsFix: Exception during save:", error);
            if (typeof window.showToast === 'function') {
                window.showToast('Error saving spells: ' + error.message);
            } else {
                alert('Error saving spells: ' + error.message);
            }
            return false;
        }
    };
    
    // Override saveSpell function again to use our direct save method
    const superSaveSpell = window.saveSpell;
    if (typeof superSaveSpell === 'function') {
        window.saveSpell = function() {
            console.log("SaveSpellsFix: Enhanced saveSpell called");
            
            try {
                // Call the original (or previous) saveSpell function
                const result = superSaveSpell.apply(this, arguments);
                
                // After creating/updating the spell in memory, save it to the server
                console.log("SaveSpellsFix: Calling directSaveSpells after updating spell in memory");
                directSaveSpells();
                
                return result;
            } catch (e) {
                console.error("SaveSpellsFix: Error in enhanced saveSpell:", e);
                // Try our direct save method anyway
                directSaveSpells();
                alert("There was an error in the saveSpell function, but a direct save was attempted.");
            }
        };
    }
    
    console.log("SaveSpellsFix: Initialization complete");
});