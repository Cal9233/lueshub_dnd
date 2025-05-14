// Spell debugging script to trace issues with saving and adding spells
document.addEventListener('DOMContentLoaded', function() {
    console.log("SpellDebug: Initializing spell debugging script");

    // Check if we have the addSpellBtn
    const addSpellBtn = document.getElementById('addSpellBtn');
    if (addSpellBtn) {
        console.log("SpellDebug: Found addSpellBtn, adding additional listener for debugging");
        addSpellBtn.addEventListener('click', function() {
            console.log("SpellDebug: addSpellBtn clicked");
        });
    } else {
        console.error("SpellDebug: addSpellBtn not found!");
    }

    // Check for saveSpellBtn
    const saveSpellBtn = document.getElementById('saveSpellBtn');
    if (saveSpellBtn) {
        console.log("SpellDebug: Found saveSpellBtn, adding additional listener for debugging");
        saveSpellBtn.addEventListener('click', function() {
            console.log("SpellDebug: saveSpellBtn clicked");
        });
    } else {
        console.error("SpellDebug: saveSpellBtn not found!");
    }

    // Override the openSpellEditor function
    if (typeof window.openSpellEditor === 'function') {
        const originalOpenSpellEditor = window.openSpellEditor;
        window.openSpellEditor = function(spell, index) {
            console.log("SpellDebug: openSpellEditor called with", {spell, index});
            try {
                return originalOpenSpellEditor.apply(this, arguments);
            } catch (e) {
                console.error("SpellDebug: Error in openSpellEditor:", e);
            }
        };
    } else {
        console.error("SpellDebug: openSpellEditor function not found!");
    }

    // Override the saveSpell function
    if (typeof window.saveSpell === 'function') {
        const originalSaveSpell = window.saveSpell;
        window.saveSpell = function() {
            console.log("SpellDebug: saveSpell called");
            try {
                // Check form elements
                console.log("SpellDebug: Form values:", {
                    name: document.getElementById('spellName')?.value,
                    level: document.getElementById('spellLevel')?.value,
                    school: document.getElementById('spellSchool')?.value,
                    castingTime: document.getElementById('spellCastingTime')?.value,
                    range: document.getElementById('spellRange')?.value,
                    components: document.getElementById('spellComponents')?.value,
                    duration: document.getElementById('spellDuration')?.value,
                    description: document.getElementById('spellDescription')?.value
                });

                return originalSaveSpell.apply(this, arguments);
            } catch (e) {
                console.error("SpellDebug: Error in saveSpell:", e);
            }
        };
    } else {
        console.error("SpellDebug: saveSpell function not found!");
    }

    // Override the saveCharacter function
    if (typeof window.saveCharacter === 'function') {
        const originalSaveCharacter = window.saveCharacter;
        window.saveCharacter = async function(silentSave) {
            console.log("SpellDebug: saveCharacter called with silentSave =", silentSave);
            
            // Inspect spells_array
            console.log("SpellDebug: spells_array before save:", window.characterData.spells_array);
            
            try {
                // Debug the FormData creation
                const originalFormData = window.FormData;
                
                window.FormData = function() {
                    const formData = new originalFormData();
                    const originalAppend = formData.append;
                    
                    formData.append = function(key, value) {
                        console.log(`SpellDebug: FormData.append('${key}', ${typeof value === 'string' ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '[object]'}`);
                        return originalAppend.call(this, key, value);
                    };
                    
                    return formData;
                };
                
                // Call original function
                const result = await originalSaveCharacter.apply(this, arguments);
                
                // Restore original FormData
                window.FormData = originalFormData;
                
                return result;
            } catch (e) {
                console.error("SpellDebug: Error in saveCharacter:", e);
                window.FormData = originalFormData;
            }
        };
    } else {
        console.error("SpellDebug: saveCharacter function not found!");
    }
    
    // Add a global error handler for debugging
    window.addEventListener('error', function(event) {
        console.error("SpellDebug: Global error caught:", event.error);
    });
});