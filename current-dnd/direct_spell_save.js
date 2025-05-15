// Emergency direct save function that bypasses all other methods
document.addEventListener('DOMContentLoaded', function() {
    console.log("DirectSpellSave: Initializing emergency direct save");
    
    // Create an emergency save button
    setTimeout(function() {
        const saveBtn = document.createElement('button');
        saveBtn.id = 'emergencySpellSaveBtn';
        saveBtn.textContent = '🔴 Emergency Save';
        saveBtn.style.position = 'fixed';
        saveBtn.style.bottom = '10px';
        saveBtn.style.left = '10px';
        saveBtn.style.zIndex = '9999';
        saveBtn.style.padding = '8px 12px';
        saveBtn.style.backgroundColor = '#e74c3c';
        saveBtn.style.color = 'white';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '4px';
        saveBtn.style.fontWeight = 'bold';
        saveBtn.style.cursor = 'pointer';
        
        saveBtn.addEventListener('click', emergencySaveSpells);
        document.body.appendChild(saveBtn);
    }, 1500);
    
    // Emergency direct save function
    async function emergencySaveSpells() {
        // Get character ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const characterId = urlParams.get('id');
        
        if (!characterId) {
            alert('Error: No character ID found in URL');
            return;
        }
        
        // Get spells from characterData if available
        let spellsArray = [];
        if (window.characterData && Array.isArray(window.characterData.spells_array)) {
            spellsArray = window.characterData.spells_array;
        }
        
        // If there are no spells but there's a spell being edited, get it
        if (spellsArray.length === 0) {
            const spellName = document.getElementById('spellName');
            const spellLevel = document.getElementById('spellLevel');
            const spellSchool = document.getElementById('spellSchool');
            const spellDescription = document.getElementById('spellDescription');
            
            if (spellName && spellName.value) {
                const newSpell = {
                    id: "direct-" + Date.now(),
                    name: spellName.value,
                    level: spellLevel ? spellLevel.value : "cantrip",
                    school: spellSchool ? spellSchool.value : "evocation",
                    casting_time: document.getElementById('spellCastingTime')?.value || "1 action",
                    range: document.getElementById('spellRange')?.value || "60 feet",
                    duration: document.getElementById('spellDuration')?.value || "Instantaneous",
                    components: document.getElementById('spellComponents')?.value || "V, S",
                    description: spellDescription ? spellDescription.value : "No description",
                    higher_levels: document.getElementById('spellHigherLevels')?.value || "",
                    ritual: document.getElementById('spellRitual')?.checked || false,
                    concentration: document.getElementById('spellConcentration')?.checked || false,
                    prepared: document.getElementById('spellPrepared')?.checked || false
                };
                
                spellsArray.push(newSpell);
                
                if (window.characterData) {
                    window.characterData.spells_array = spellsArray;
                } else {
                    window.characterData = { spells_array: spellsArray };
                }
                
                alert("Captured current spell: " + newSpell.name);
            }
        }
        
        // Show status
        const statusDiv = document.createElement('div');
        statusDiv.style.position = 'fixed';
        statusDiv.style.top = '50%';
        statusDiv.style.left = '50%';
        statusDiv.style.transform = 'translate(-50%, -50%)';
        statusDiv.style.backgroundColor = '#2c3e50';
        statusDiv.style.color = 'white';
        statusDiv.style.padding = '20px';
        statusDiv.style.borderRadius = '5px';
        statusDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        statusDiv.style.zIndex = '10000';
        statusDiv.style.minWidth = '300px';
        statusDiv.style.textAlign = 'center';
        statusDiv.innerHTML = '<h3>Emergency Save In Progress</h3><p>Please wait...</p>';
        document.body.appendChild(statusDiv);
        
        try {
            // Create FormData with just the essential information
            const formData = new FormData();
            formData.append('id', characterId);
            formData.append('spells_array_json', JSON.stringify(spellsArray));
            
            // Make direct API call
            const response = await fetch('api/save_spells.php', {
                method: 'POST',
                body: formData
            });
            
            // Parse response
            const data = await response.json();
            
            if (data.success) {
                statusDiv.innerHTML = `
                    <h3>Spells Saved Successfully!</h3>
                    <p>${spellsArray.length} spells saved to character #${characterId}</p>
                    <p style="font-size:12px; color:#aaa;">Response: ${data.message}</p>
                    <button id="closeStatusBtn" style="padding:8px 15px; margin-top:10px; background:#27ae60; border:none; color:white; border-radius:3px; cursor:pointer;">Close</button>
                `;
            } else {
                statusDiv.innerHTML = `
                    <h3>Error Saving Spells</h3>
                    <p>${data.message}</p>
                    <div style="margin:10px 0; padding:10px; background:#34495e; border-radius:3px; text-align:left; font-family:monospace; font-size:12px; overflow:auto; max-height:150px;">
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    </div>
                    <button id="closeStatusBtn" style="padding:8px 15px; margin-top:10px; background:#e74c3c; border:none; color:white; border-radius:3px; cursor:pointer;">Close</button>
                `;
            }
            
            // Add close button event listener
            document.getElementById('closeStatusBtn').addEventListener('click', function() {
                document.body.removeChild(statusDiv);
            });
        } catch (error) {
            statusDiv.innerHTML = `
                <h3>Error Saving Spells</h3>
                <p>Network error: ${error.message}</p>
                <button id="closeStatusBtn" style="padding:8px 15px; margin-top:10px; background:#e74c3c; border:none; color:white; border-radius:3px; cursor:pointer;">Close</button>
            `;
            
            document.getElementById('closeStatusBtn').addEventListener('click', function() {
                document.body.removeChild(statusDiv);
            });
        }
    }
    
    console.log("DirectSpellSave: Initialization complete");
});