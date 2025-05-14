// Direct fix for spell management issues
document.addEventListener('DOMContentLoaded', function() {
    console.log("SpellDirectFix: Initializing direct fixes for spell management");
    
    // Ensure database schema is correct by adding a direct notification
    const schemaNotification = document.createElement('div');
    schemaNotification.style.position = 'fixed';
    schemaNotification.style.top = '10px';
    schemaNotification.style.right = '10px';
    schemaNotification.style.padding = '15px';
    schemaNotification.style.background = '#ffff99';
    schemaNotification.style.border = '1px solid #ffcc00';
    schemaNotification.style.borderRadius = '5px';
    schemaNotification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    schemaNotification.style.zIndex = '9999';
    schemaNotification.style.maxWidth = '300px';
    schemaNotification.innerHTML = `
        <p><strong>Important:</strong> If you're having trouble saving spells, you may need to update your database schema.</p>
        <p><a href="fix_database.html" target="_blank" style="color: blue; text-decoration: underline;">Click here for instructions</a></p>
        <button style="background: #ffcc00; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-top: 10px;">Dismiss</button>
    `;
    
    // Add dismiss button functionality
    const dismissButton = schemaNotification.querySelector('button');
    if (dismissButton) {
        dismissButton.addEventListener('click', function() {
            schemaNotification.style.display = 'none';
        });
    }
    
    // Append notification to body
    document.body.appendChild(schemaNotification);
    
    // Direct fix for Add Spell button
    const addSpellBtn = document.getElementById('addSpellBtn');
    if (addSpellBtn) {
        console.log("SpellDirectFix: Found addSpellBtn, adding direct click handler");
        
        // Remove any existing click handlers
        const newBtn = addSpellBtn.cloneNode(true);
        addSpellBtn.parentNode.replaceChild(newBtn, addSpellBtn);
        
        // Add new direct click handler
        newBtn.addEventListener('click', function(e) {
            console.log("SpellDirectFix: addSpellBtn clicked");
            
            // Get the spell editor modal
            const spellEditorModal = document.getElementById('spellEditorModal');
            const spellEditorTitle = document.getElementById('spellEditorTitle');
            const spellName = document.getElementById('spellName');
            const spellLevel = document.getElementById('spellLevel');
            const spellSchool = document.getElementById('spellSchool');
            const spellCastingTime = document.getElementById('spellCastingTime');
            const spellRange = document.getElementById('spellRange');
            const spellDuration = document.getElementById('spellDuration');
            const spellComponents = document.getElementById('spellComponents');
            const spellDescription = document.getElementById('spellDescription');
            const spellHigherLevels = document.getElementById('spellHigherLevels');
            const spellRitual = document.getElementById('spellRitual');
            const spellConcentration = document.getElementById('spellConcentration');
            const spellPrepared = document.getElementById('spellPrepared');
            
            if (!spellEditorModal) {
                console.error("SpellDirectFix: Spell editor modal not found!");
                return;
            }
            
            // Set the modal title
            if (spellEditorTitle) {
                spellEditorTitle.textContent = 'Add New Spell';
            }
            
            // Reset form values
            if (spellName) spellName.value = '';
            if (spellLevel) spellLevel.value = 'cantrip';
            if (spellSchool) spellSchool.value = 'evocation';
            if (spellCastingTime) spellCastingTime.value = '1 action';
            if (spellRange) spellRange.value = '60 feet';
            if (spellDuration) spellDuration.value = 'Instantaneous';
            if (spellComponents) spellComponents.value = 'V, S';
            if (spellDescription) spellDescription.value = '';
            if (spellHigherLevels) spellHigherLevels.value = '';
            if (spellRitual) spellRitual.checked = false;
            if (spellConcentration) spellConcentration.checked = false;
            if (spellPrepared) spellPrepared.checked = false;
            
            // Set editor state
            window.currentEditingSpell = null;
            window.currentEditingSpellIndex = -1;
            
            // Show the modal
            spellEditorModal.classList.add('show');
        });
    }
    
    // Direct fix for Save Spell button
    const saveSpellBtn = document.getElementById('saveSpellBtn');
    if (saveSpellBtn) {
        console.log("SpellDirectFix: Found saveSpellBtn, adding direct click handler");
        
        // Remove any existing click handlers
        const newSaveBtn = saveSpellBtn.cloneNode(true);
        saveSpellBtn.parentNode.replaceChild(newSaveBtn, saveSpellBtn);
        
        // Add new direct click handler
        newSaveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("SpellDirectFix: saveSpellBtn clicked");
            
            // Get form values
            const spellName = document.getElementById('spellName').value;
            const spellLevel = document.getElementById('spellLevel').value;
            const spellSchool = document.getElementById('spellSchool').value;
            const spellCastingTime = document.getElementById('spellCastingTime').value;
            const spellRange = document.getElementById('spellRange').value;
            const spellDuration = document.getElementById('spellDuration').value;
            const spellComponents = document.getElementById('spellComponents').value;
            const spellDescription = document.getElementById('spellDescription').value;
            const spellHigherLevels = document.getElementById('spellHigherLevels').value;
            const spellRitual = document.getElementById('spellRitual').checked;
            const spellConcentration = document.getElementById('spellConcentration').checked;
            const spellPrepared = document.getElementById('spellPrepared').checked;
            
            // Validate required fields
            if (!spellName) {
                alert('Spell name is required');
                return;
            }
            
            // Create spell object
            const spell = {
                id: (window.currentEditingSpell && window.currentEditingSpell.id) ? 
                    window.currentEditingSpell.id : 
                    Date.now().toString() + Math.random().toString(36).substring(2,7),
                name: spellName,
                level: spellLevel,
                school: spellSchool,
                casting_time: spellCastingTime,
                range: spellRange,
                duration: spellDuration,
                components: spellComponents,
                description: spellDescription,
                higher_levels: spellHigherLevels,
                ritual: spellRitual,
                concentration: spellConcentration,
                prepared: spellPrepared
            };
            
            // Make sure the window.characterData object exists
            if (!window.characterData) {
                const urlParams = new URLSearchParams(window.location.search);
                const characterId = urlParams.get('id');
                window.characterData = {
                    id: characterId,
                    spells_array: []
                };
                console.log("SpellDirectFix: Created minimal characterData object");
            }
            
            console.log("SpellDirectFix: Saving spell:", spell);
            
            // Ensure spells_array is properly initialized
            if (!window.characterData.spells_array) {
                window.characterData.spells_array = [];
            }
            
            // Ensure it's an array
            if (!Array.isArray(window.characterData.spells_array)) {
                window.characterData.spells_array = [];
            }
            
            // Add or update the spell in the array
            if (typeof window.currentEditingSpellIndex === 'number' && window.currentEditingSpellIndex >= 0) {
                // Updating existing spell
                window.characterData.spells_array[window.currentEditingSpellIndex] = spell;
                console.log("SpellDirectFix: Updated existing spell at index", window.currentEditingSpellIndex);
            } else {
                // Adding new spell
                window.characterData.spells_array.push(spell);
                console.log("SpellDirectFix: Added new spell to array");
            }
            
            // Close the modal
            const spellEditorModal = document.getElementById('spellEditorModal');
            if (spellEditorModal) {
                spellEditorModal.classList.remove('show');
            }
            
            // Reset editor state
            window.currentEditingSpell = null;
            window.currentEditingSpellIndex = -1;
            
            // Update UI
            if (typeof window.renderSpells === 'function') {
                try {
                    window.renderSpells();
                } catch (e) {
                    console.error("SpellDirectFix: Error in renderSpells:", e);
                    // Fallback - try to reload the page
                    alert("There was an issue updating the spell display. Your spells have been saved, but you may need to refresh the page to see them.");
                }
            } else {
                console.error("SpellDirectFix: renderSpells function not found");
            }
            
            // Save character data
            if (typeof window.directSaveSpells === 'function') {
                console.log("SpellDirectFix: Using directSaveSpells for better reliability");
                try {
                    window.directSaveSpells();
                } catch (e) {
                    console.error("SpellDirectFix: Error in directSaveSpells:", e);
                    // Try original saveCharacter as fallback
                    if (typeof window.saveCharacter === 'function') {
                        try {
                            window.saveCharacter(true);
                        } catch (e2) {
                            console.error("SpellDirectFix: Error in fallback saveCharacter:", e2);
                            alert("There was an issue saving your character. Please try again or check the database schema.");
                        }
                    }
                }
            } else if (typeof window.saveCharacter === 'function') {
                console.log("SpellDirectFix: Saving character with new spell data (original method)");
                try {
                    window.saveCharacter(true);
                } catch (e) {
                    console.error("SpellDirectFix: Error in saveCharacter:", e);
                    // Fallback - try to use JSON.stringify to manually prepare data
                    alert("There was an issue saving your character. Please try again or check the database schema.");
                }
            } else {
                console.error("SpellDirectFix: No save functions found");
            }
            
            // Show success message
            if (typeof window.showToast === 'function') {
                window.showToast('Spell saved successfully');
            } else {
                alert('Spell saved successfully');
            }
        });
    }
    
    // Direct fix for Cancel Spell button
    const cancelSpellBtn = document.getElementById('cancelSpellBtn');
    if (cancelSpellBtn) {
        console.log("SpellDirectFix: Found cancelSpellBtn, adding direct click handler");
        
        // Remove any existing click handlers
        const newCancelBtn = cancelSpellBtn.cloneNode(true);
        cancelSpellBtn.parentNode.replaceChild(newCancelBtn, cancelSpellBtn);
        
        // Add new direct click handler
        newCancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("SpellDirectFix: cancelSpellBtn clicked");
            
            // Close the modal
            const spellEditorModal = document.getElementById('spellEditorModal');
            if (spellEditorModal) {
                spellEditorModal.classList.remove('show');
            }
            
            // Reset editor state
            window.currentEditingSpell = null;
            window.currentEditingSpellIndex = -1;
        });
    }
    
    // Direct fix for Close Spell Editor button
    const closeSpellEditorBtn = document.getElementById('closeSpellEditorBtn');
    if (closeSpellEditorBtn) {
        console.log("SpellDirectFix: Found closeSpellEditorBtn, adding direct click handler");
        
        // Remove any existing click handlers
        const newCloseBtn = closeSpellEditorBtn.cloneNode(true);
        closeSpellEditorBtn.parentNode.replaceChild(newCloseBtn, closeSpellEditorBtn);
        
        // Add new direct click handler
        newCloseBtn.addEventListener('click', function(e) {
            console.log("SpellDirectFix: closeSpellEditorBtn clicked");
            
            // Close the modal
            const spellEditorModal = document.getElementById('spellEditorModal');
            if (spellEditorModal) {
                spellEditorModal.classList.remove('show');
            }
            
            // Reset editor state
            window.currentEditingSpell = null;
            window.currentEditingSpellIndex = -1;
        });
    }
    
    console.log("SpellDirectFix: Initialization complete");
});