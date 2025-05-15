// Direct fix for the main save character button
document.addEventListener('DOMContentLoaded', function() {
    console.log("SaveButtonFix: Initializing fix for main save button");
    
    // Wait for the page to fully load
    setTimeout(function() {
        // Find the main save character button
        const saveCharacterBtn = document.getElementById('saveCharacterBtn');
        
        if (saveCharacterBtn) {
            console.log("SaveButtonFix: Found main save button, applying fix");
            
            // Remove any existing click handlers by cloning the button
            const newSaveBtn = saveCharacterBtn.cloneNode(true);
            saveCharacterBtn.parentNode.replaceChild(newSaveBtn, saveCharacterBtn);
            
            // Add our reliable save handler
            newSaveBtn.addEventListener('click', function(e) {
                console.log("SaveButtonFix: Main save button clicked, using reliable save method");
                
                // Show save indicator
                const saveIndicator = document.createElement('div');
                saveIndicator.style.position = 'fixed';
                saveIndicator.style.top = '10px';
                saveIndicator.style.left = '50%';
                saveIndicator.style.transform = 'translateX(-50%)';
                saveIndicator.style.backgroundColor = '#2ecc71';
                saveIndicator.style.color = 'white';
                saveIndicator.style.padding = '10px 20px';
                saveIndicator.style.borderRadius = '4px';
                saveIndicator.style.fontSize = '16px';
                saveIndicator.style.fontWeight = 'bold';
                saveIndicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                saveIndicator.style.zIndex = '10000';
                saveIndicator.textContent = 'Saving character...';
                document.body.appendChild(saveIndicator);
                
                // Get character ID
                const urlParams = new URLSearchParams(window.location.search);
                const characterId = urlParams.get('id');
                
                if (!characterId) {
                    saveIndicator.style.backgroundColor = '#e74c3c';
                    saveIndicator.textContent = 'Error: No character ID found';
                    setTimeout(() => {
                        document.body.removeChild(saveIndicator);
                    }, 3000);
                    return;
                }
                
                // First, save spells separately to ensure they're stored
                directSaveSpells().then(spellSaveResult => {
                    console.log("SaveButtonFix: Spell save result:", spellSaveResult);
                    
                    // Now use the standard save for the rest of the character
                    if (typeof window.saveCharacter === 'function') {
                        try {
                            console.log("SaveButtonFix: Attempting to use standard saveCharacter");
                            window.saveCharacter(false).then(result => {
                                console.log("SaveButtonFix: Standard save result:", result);
                                saveIndicator.textContent = 'Character saved successfully';
                                setTimeout(() => {
                                    document.body.removeChild(saveIndicator);
                                }, 3000);
                            }).catch(error => {
                                console.error("SaveButtonFix: Error in standard save:", error);
                                
                                // Show completion even with error since spells were saved
                                saveIndicator.style.backgroundColor = '#f39c12';
                                saveIndicator.textContent = 'Spells saved, but character data may be incomplete';
                                setTimeout(() => {
                                    document.body.removeChild(saveIndicator);
                                }, 3000);
                            });
                        } catch (error) {
                            console.error("SaveButtonFix: Exception in standard save:", error);
                            
                            // Show completion even with error since spells were saved
                            saveIndicator.style.backgroundColor = '#f39c12';
                            saveIndicator.textContent = 'Spells saved, but character data may be incomplete';
                            setTimeout(() => {
                                document.body.removeChild(saveIndicator);
                            }, 3000);
                        }
                    } else {
                        console.error("SaveButtonFix: Standard saveCharacter function not found");
                        
                        // Show completion anyway since spells were saved
                        saveIndicator.style.backgroundColor = '#f39c12';
                        saveIndicator.textContent = 'Spells saved, but other character data not saved';
                        setTimeout(() => {
                            document.body.removeChild(saveIndicator);
                        }, 3000);
                    }
                }).catch(error => {
                    console.error("SaveButtonFix: Error saving spells:", error);
                    saveIndicator.style.backgroundColor = '#e74c3c';
                    saveIndicator.textContent = 'Error saving: ' + error.message;
                    setTimeout(() => {
                        document.body.removeChild(saveIndicator);
                    }, 3000);
                });
            });
            
            console.log("SaveButtonFix: Main save button fix applied");
        } else {
            console.error("SaveButtonFix: Could not find main save button");
        }
    }, 2000); // Wait 2 seconds to ensure page is fully loaded
    
    // Direct save spells function
    async function directSaveSpells() {
        console.log("SaveButtonFix: directSaveSpells called");
        
        // Get character ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const characterId = urlParams.get('id');
        
        if (!characterId) {
            throw new Error('No character ID found in URL');
        }
        
        // Get spells from characterData if available
        let spellsArray = [];
        if (window.characterData && Array.isArray(window.characterData.spells_array)) {
            spellsArray = window.characterData.spells_array;
        }
        
        // Create FormData with just the essential information
        const formData = new FormData();
        formData.append('id', characterId);
        formData.append('spells_array_json', JSON.stringify(spellsArray));
        
        try {
            // Make direct API call
            const response = await fetch('api/save_spells.php', {
                method: 'POST',
                body: formData
            });
            
            // Parse response
            const data = await response.json();
            
            if (data.success) {
                return true;
            } else {
                throw new Error(data.message || 'Unknown error saving spells');
            }
        } catch (error) {
            console.error("SaveButtonFix: Error in directSaveSpells:", error);
            throw error;
        }
    }
    
    console.log("SaveButtonFix: Initialization complete");
});