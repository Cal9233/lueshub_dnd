// Enhanced Spell Fix Script - Fixes issues with spell data handling
document.addEventListener('DOMContentLoaded', function() {
    console.log("SpellFix: Initializing enhanced spell fix script");

    // Override the original loadCharacter function
    const originalLoadCharacter = window.loadCharacter;
    if (typeof originalLoadCharacter !== 'function') {
        console.error("SpellFix: Original loadCharacter function not found!");
        return;
    }

    window.loadCharacter = async function() {
        console.log("SpellFix: Patched loadCharacter called");
        
        try {
            await originalLoadCharacter.apply(this, arguments);
            
            console.log("SpellFix: Character loaded, checking spells data");
            
            // Fix the spells_array if needed
            fixSpellsArray();
            
        } catch (e) {
            console.error("SpellFix: Error in patched loadCharacter:", e);
        }
    };
    
    // Fix spells array if it's not properly structured
    function fixSpellsArray() {
        if (!window.characterData) {
            console.error("SpellFix: characterData not available");
            return;
        }
        
        console.log("SpellFix: Current spells_array:", window.characterData.spells_array);
        
        // Check if spells_array is a string instead of an array
        if (typeof window.characterData.spells_array === 'string') {
            console.log("SpellFix: spells_array is a string, attempting to parse");
            try {
                window.characterData.spells_array = JSON.parse(window.characterData.spells_array);
                console.log("SpellFix: Successfully parsed spells_array string to object");
            } catch (e) {
                console.error("SpellFix: Failed to parse spells_array string:", e);
                window.characterData.spells_array = [];
            }
        }
        
        // Ensure spells_array is an array
        if (!Array.isArray(window.characterData.spells_array)) {
            console.warn("SpellFix: spells_array is not an array, initializing empty array");
            window.characterData.spells_array = [];
        }
        
        // Check if array items are strings instead of objects
        if (window.characterData.spells_array.length > 0) {
            let needsFixing = false;
            
            // Check if any item is a string
            for (let i = 0; i < window.characterData.spells_array.length; i++) {
                const spell = window.characterData.spells_array[i];
                if (typeof spell === 'string' || typeof spell !== 'object') {
                    needsFixing = true;
                    break;
                }
            }
            
            if (needsFixing) {
                console.log("SpellFix: Found string items in spells_array, fixing");
                
                const fixedArray = window.characterData.spells_array.map(item => {
                    if (typeof item === 'string') {
                        try {
                            // Try to parse the string as JSON
                            const parsed = JSON.parse(item);
                            return parsed;
                        } catch (e) {
                            console.error("SpellFix: Failed to parse spell string:", item);
                            return null;
                        }
                    } else if (typeof item === 'object') {
                        return item;
                    }
                    return null;
                }).filter(spell => spell !== null);
                
                window.characterData.spells_array = fixedArray;
                console.log("SpellFix: Fixed spells_array:", window.characterData.spells_array);
            }
        }
        
        // Ensure all spells have the required properties
        window.characterData.spells_array.forEach(spell => {
            // Add ID if missing
            if (!spell.id) {
                spell.id = Date.now() + Math.random().toString(36).substring(2, 9);
            }
            
            // Set default values for missing properties
            spell.name = spell.name || "Unknown Spell";
            spell.level = spell.level || "cantrip";
            spell.school = spell.school || "evocation";
            spell.casting_time = spell.casting_time || "1 action";
            spell.range = spell.range || "60 feet";
            spell.duration = spell.duration || "Instantaneous";
            spell.components = spell.components || "V, S";
            spell.description = spell.description || "No description provided.";
            spell.higher_levels = spell.higher_levels || "";
            
            // Boolean properties
            spell.ritual = spell.ritual === true;
            spell.concentration = spell.concentration === true;
            spell.prepared = spell.prepared === true;
        });
        
        console.log("SpellFix: Final spells_array:", window.characterData.spells_array);
        
        // Re-render spells with fixed data
        if (typeof window.renderSpells === 'function') {
            console.log("SpellFix: Re-rendering spells");
            window.renderSpells();
        } else {
            console.error("SpellFix: renderSpells function not found");
        }
    }
    
    // Fix the openSpellEditor function
    const originalOpenSpellEditor = window.openSpellEditor;
    if (typeof originalOpenSpellEditor === 'function') {
        window.openSpellEditor = function(spell, index) {
            console.log("SpellFix: Enhanced openSpellEditor called with", { spell, index });
            
            try {
                // Ensure all UI elements exist and are initialized
                const spellEditorModal = document.getElementById('spellEditorModal');
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
                
                if (!spellEditorModal || !spellName || !spellLevel || !spellSchool || 
                    !spellCastingTime || !spellRange || !spellDuration || !spellComponents || 
                    !spellDescription || !spellHigherLevels || !spellRitual || 
                    !spellConcentration || !spellPrepared) {
                    console.error("SpellFix: Some spell editor elements are missing!");
                    return originalOpenSpellEditor.apply(this, arguments);
                }
                
                return originalOpenSpellEditor.apply(this, arguments);
            } catch (e) {
                console.error("SpellFix: Error in enhanced openSpellEditor:", e);
                alert("There was an error opening the spell editor. Please try again or refresh the page.");
            }
        };
    }
    
    // Fix the saveSpell function
    const originalSaveSpell = window.saveSpell;
    if (typeof originalSaveSpell === 'function') {
        window.saveSpell = function() {
            console.log("SpellFix: Enhanced saveSpell called");
            
            try {
                // Get values directly from DOM
                const spellNameInput = document.getElementById('spellName');
                const spellLevelInput = document.getElementById('spellLevel');
                const spellSchoolInput = document.getElementById('spellSchool');
                const spellCastingTimeInput = document.getElementById('spellCastingTime');
                const spellRangeInput = document.getElementById('spellRange');
                const spellComponentsInput = document.getElementById('spellComponents');
                const spellDurationInput = document.getElementById('spellDuration');
                const spellDescriptionInput = document.getElementById('spellDescription');
                const spellHigherLevelsInput = document.getElementById('spellHigherLevels');
                const spellRitualCheck = document.getElementById('spellRitual');
                const spellConcentrationCheck = document.getElementById('spellConcentration');
                const spellPreparedCheck = document.getElementById('spellPrepared');
                
                // Basic validation
                if (!spellNameInput || !spellNameInput.value) {
                    alert("Spell name is required");
                    return;
                }
                
                if (!spellSchoolInput || !spellLevelInput || !spellCastingTimeInput || 
                    !spellRangeInput || !spellComponentsInput || !spellDurationInput || 
                    !spellDescriptionInput) {
                    alert("Some required spell fields are missing");
                    return;
                }
                
                // Create a clean spell object
                const newSpell = {
                    id: window.currentEditingSpell ? window.currentEditingSpell.id : Date.now() + Math.random().toString(36).substring(2, 9),
                    name: spellNameInput.value,
                    level: spellLevelInput.value,
                    school: spellSchoolInput.value,
                    casting_time: spellCastingTimeInput.value,
                    range: spellRangeInput.value,
                    components: spellComponentsInput.value,
                    duration: spellDurationInput.value,
                    description: spellDescriptionInput.value,
                    higher_levels: spellHigherLevelsInput ? spellHigherLevelsInput.value : '',
                    ritual: spellRitualCheck ? spellRitualCheck.checked : false,
                    concentration: spellConcentrationCheck ? spellConcentrationCheck.checked : false,
                    prepared: spellPreparedCheck ? spellPreparedCheck.checked : false
                };
                
                console.log("SpellFix: Created new spell object:", newSpell);
                
                // Ensure spells_array is properly initialized
                if (!Array.isArray(window.characterData.spells_array)) {
                    window.characterData.spells_array = [];
                }
                
                // Add or update the spell
                if (typeof window.currentEditingSpellIndex === 'number' && window.currentEditingSpellIndex >= 0) {
                    // Update existing spell
                    window.characterData.spells_array[window.currentEditingSpellIndex] = newSpell;
                    console.log("SpellFix: Updated spell at index", window.currentEditingSpellIndex);
                } else {
                    // Add new spell
                    window.characterData.spells_array.push(newSpell);
                    console.log("SpellFix: Added new spell");
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
                    window.renderSpells();
                }
                
                // Auto save
                if (typeof window.autoSave === 'function') {
                    window.autoSave();
                }
                
                // Show success message
                if (typeof window.showToast === 'function') {
                    window.showToast('Spell saved successfully');
                }
                
                return false; // Prevent default form submission
            } catch (e) {
                console.error("SpellFix: Error in enhanced saveSpell:", e);
                alert("There was an error saving the spell. Please try again.");
            }
        };
    }
    
    // Override the original saveCharacter function to ensure proper JSON handling
    const originalSaveCharacter = window.saveCharacter;
    if (typeof originalSaveCharacter === 'function') {
        window.saveCharacter = async function(silentSave) {
            console.log("SpellFix: Enhanced saveCharacter called");
            
            try {
                // Ensure spells_array is an array before saving
                if (!Array.isArray(window.characterData.spells_array)) {
                    console.warn("SpellFix: spells_array is not an array, fixing before save");
                    window.characterData.spells_array = [];
                }
                
                // Clean up any invalid spells
                window.characterData.spells_array = window.characterData.spells_array.filter(spell => 
                    spell && typeof spell === 'object' && spell.name
                );
                
                const result = await originalSaveCharacter.apply(this, arguments);
                return result;
            } catch (e) {
                console.error("SpellFix: Error in enhanced saveCharacter:", e);
                alert("There was an error saving the character. Please try again.");
            }
        };
    }
    
    // Add event listeners for spell editor buttons
    const addSpellBtn = document.getElementById('addSpellBtn');
    if (addSpellBtn) {
        addSpellBtn.addEventListener('click', function() {
            console.log("SpellFix: addSpellBtn clicked");
            // Open spell editor with no arguments to create a new spell
            if (typeof window.openSpellEditor === 'function') {
                window.openSpellEditor();
            }
        });
    }
    
    const saveSpellBtn = document.getElementById('saveSpellBtn');
    if (saveSpellBtn) {
        saveSpellBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("SpellFix: saveSpellBtn clicked");
            // Call our enhanced saveSpell function
            if (typeof window.saveSpell === 'function') {
                window.saveSpell();
            }
        });
    }
    
    console.log("SpellFix: Enhanced initialization complete");
});