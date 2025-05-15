// Spell Save Diagnostic Tool
document.addEventListener('DOMContentLoaded', function() {
    console.log("SpellDiagnostics: Initializing spell save diagnostic tools");
    
    // Create diagnostic button
    const createDiagnosticButton = function() {
        // Check if button already exists
        if (document.getElementById('spellDiagButton')) {
            return;
        }
        
        const button = document.createElement('button');
        button.id = 'spellDiagButton';
        button.textContent = 'Spell Diagnostics';
        button.style.position = 'fixed';
        button.style.bottom = '10px';
        button.style.right = '10px';
        button.style.zIndex = '9999';
        button.style.padding = '8px 12px';
        button.style.backgroundColor = '#ff9800';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.fontWeight = 'bold';
        button.style.cursor = 'pointer';
        
        button.addEventListener('click', function() {
            runDiagnostics();
        });
        
        document.body.appendChild(button);
    };
    
    // Run comprehensive diagnostics
    const runDiagnostics = function() {
        console.log("SpellDiagnostics: Running comprehensive spell diagnostics");
        
        // Display diagnostic results
        const displayResults = function(results) {
            // Create or update the results panel
            let panel = document.getElementById('spellDiagPanel');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'spellDiagPanel';
                panel.style.position = 'fixed';
                panel.style.top = '50px';
                panel.style.right = '20px';
                panel.style.width = '500px';
                panel.style.maxHeight = '80vh';
                panel.style.overflowY = 'auto';
                panel.style.backgroundColor = '#2c3e50';
                panel.style.color = '#ecf0f1';
                panel.style.border = '1px solid #34495e';
                panel.style.borderRadius = '5px';
                panel.style.padding = '15px';
                panel.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                panel.style.zIndex = '10000';
                panel.style.fontSize = '14px';
                
                // Close button
                const closeBtn = document.createElement('button');
                closeBtn.textContent = 'Close';
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '10px';
                closeBtn.style.right = '10px';
                closeBtn.style.padding = '5px 10px';
                closeBtn.style.backgroundColor = '#7f8c8d';
                closeBtn.style.color = 'white';
                closeBtn.style.border = 'none';
                closeBtn.style.borderRadius = '3px';
                closeBtn.style.cursor = 'pointer';
                
                closeBtn.addEventListener('click', function() {
                    panel.style.display = 'none';
                });
                
                panel.appendChild(closeBtn);
                document.body.appendChild(panel);
            } else {
                panel.style.display = 'block';
            }
            
            // Clear previous content except the close button
            while (panel.childNodes.length > 1) {
                panel.removeChild(panel.lastChild);
            }
            
            // Add title
            const title = document.createElement('h2');
            title.textContent = 'Spell Save Diagnostics';
            title.style.marginTop = '0';
            title.style.paddingBottom = '10px';
            title.style.borderBottom = '1px solid #7f8c8d';
            title.style.color = '#ecf0f1';
            panel.appendChild(title);
            
            // Add console logger
            const logSection = document.createElement('div');
            logSection.style.marginBottom = '15px';
            logSection.style.marginTop = '15px';
            
            const logTitle = document.createElement('h3');
            logTitle.textContent = 'Debug Console';
            logTitle.style.marginBottom = '5px';
            logTitle.style.color = '#ecf0f1';
            logSection.appendChild(logTitle);
            
            const logContainer = document.createElement('div');
            logContainer.id = 'spellDiagLogContainer';
            logContainer.style.backgroundColor = '#1e272e';
            logContainer.style.color = '#00e640';
            logContainer.style.fontFamily = 'monospace';
            logContainer.style.padding = '10px';
            logContainer.style.borderRadius = '3px';
            logContainer.style.maxHeight = '150px';
            logContainer.style.overflowY = 'auto';
            logContainer.style.marginBottom = '10px';
            logContainer.style.fontSize = '12px';
            logContainer.style.whiteSpace = 'pre-wrap';
            logSection.appendChild(logContainer);
            
            const logInput = document.createElement('input');
            logInput.type = 'text';
            logInput.placeholder = 'Enter JavaScript to execute...';
            logInput.style.width = '80%';
            logInput.style.padding = '5px';
            logInput.style.backgroundColor = '#34495e';
            logInput.style.border = 'none';
            logInput.style.color = '#ecf0f1';
            logInput.style.borderRadius = '3px';
            logSection.appendChild(logInput);
            
            const runBtn = document.createElement('button');
            runBtn.textContent = 'Run';
            runBtn.style.width = '18%';
            runBtn.style.marginLeft = '2%';
            runBtn.style.padding = '5px';
            runBtn.style.backgroundColor = '#2ecc71';
            runBtn.style.border = 'none';
            runBtn.style.color = 'white';
            runBtn.style.borderRadius = '3px';
            runBtn.style.cursor = 'pointer';
            logSection.appendChild(runBtn);
            
            // Execute JavaScript and log result
            runBtn.addEventListener('click', function() {
                const code = logInput.value;
                logMessage(`> ${code}`);
                try {
                    const result = eval(code);
                    logMessage(`< ${typeof result === 'object' ? JSON.stringify(result) : result}`);
                } catch (e) {
                    logMessage(`! ERROR: ${e.message}`);
                }
                logInput.value = '';
            });
            
            // Allow pressing Enter to run code
            logInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    runBtn.click();
                }
            });
            
            // Function to add log message
            window.logMessage = function(message) {
                const log = document.getElementById('spellDiagLogContainer');
                if (log) {
                    const line = document.createElement('div');
                    line.textContent = message;
                    log.appendChild(line);
                    log.scrollTop = log.scrollHeight;
                }
            };
            
            panel.appendChild(logSection);
            
            // Add results sections
            for (const section in results) {
                const sectionEl = document.createElement('div');
                sectionEl.style.marginBottom = '15px';
                
                const sectionTitle = document.createElement('h3');
                sectionTitle.textContent = section;
                sectionTitle.style.marginBottom = '5px';
                sectionTitle.style.color = '#ecf0f1';
                sectionEl.appendChild(sectionTitle);
                
                const sectionContent = document.createElement('div');
                sectionContent.style.backgroundColor = '#34495e';
                sectionContent.style.padding = '10px';
                sectionContent.style.borderRadius = '3px';
                
                if (Array.isArray(results[section])) {
                    // Handle array data
                    results[section].forEach(item => {
                        const itemEl = document.createElement('div');
                        itemEl.style.padding = '8px';
                        itemEl.style.backgroundColor = item.status === 'fail' ? '#3d0000' : '#003300';
                        itemEl.style.marginBottom = '5px';
                        itemEl.style.borderRadius = '3px';
                        
                        const statusIcon = document.createElement('span');
                        statusIcon.innerHTML = item.status === 'fail' ? '❌ ' : '✅ ';
                        itemEl.appendChild(statusIcon);
                        
                        const itemText = document.createElement('span');
                        itemText.textContent = item.message;
                        itemEl.appendChild(itemText);
                        
                        if (item.details) {
                            const detailsBtn = document.createElement('button');
                            detailsBtn.textContent = 'Details';
                            detailsBtn.style.marginLeft = '10px';
                            detailsBtn.style.padding = '2px 5px';
                            detailsBtn.style.fontSize = '12px';
                            detailsBtn.style.backgroundColor = '#7f8c8d';
                            detailsBtn.style.color = 'white';
                            detailsBtn.style.border = 'none';
                            detailsBtn.style.borderRadius = '3px';
                            detailsBtn.style.cursor = 'pointer';
                            
                            const detailsDiv = document.createElement('pre');
                            detailsDiv.style.display = 'none';
                            detailsDiv.style.marginTop = '5px';
                            detailsDiv.style.padding = '8px';
                            detailsDiv.style.backgroundColor = '#1e272e';
                            detailsDiv.style.color = '#ecf0f1';
                            detailsDiv.style.border = '1px solid #7f8c8d';
                            detailsDiv.style.borderRadius = '3px';
                            detailsDiv.style.whiteSpace = 'pre-wrap';
                            detailsDiv.style.overflowX = 'auto';
                            detailsDiv.textContent = typeof item.details === 'object' ? 
                                JSON.stringify(item.details, null, 2) : item.details;
                            
                            detailsBtn.addEventListener('click', function() {
                                detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
                            });
                            
                            itemEl.appendChild(detailsBtn);
                            itemEl.appendChild(detailsDiv);
                        }
                        
                        sectionContent.appendChild(itemEl);
                    });
                } else if (typeof results[section] === 'object') {
                    // Handle object data
                    const objPre = document.createElement('pre');
                    objPre.style.backgroundColor = '#1e272e';
                    objPre.style.color = '#ecf0f1';
                    objPre.style.padding = '8px';
                    objPre.style.borderRadius = '3px';
                    objPre.style.whiteSpace = 'pre-wrap';
                    objPre.style.overflowX = 'auto';
                    objPre.textContent = JSON.stringify(results[section], null, 2);
                    sectionContent.appendChild(objPre);
                } else {
                    // Handle string or other simple data
                    const textEl = document.createElement('p');
                    textEl.style.color = '#ecf0f1';
                    textEl.textContent = results[section];
                    sectionContent.appendChild(textEl);
                }
                
                sectionEl.appendChild(sectionContent);
                panel.appendChild(sectionEl);
            }
            
            // Add test spell button
            const testSpellSection = document.createElement('div');
            testSpellSection.style.marginBottom = '15px';
            
            const testSpellTitle = document.createElement('h3');
            testSpellTitle.textContent = 'Test Functionality';
            testSpellTitle.style.color = '#ecf0f1';
            testSpellSection.appendChild(testSpellTitle);
            
            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '10px';
            btnContainer.style.flexWrap = 'wrap';
            
            // Add Test Spell Button
            const addTestSpellBtn = document.createElement('button');
            addTestSpellBtn.textContent = 'Add Test Spell';
            addTestSpellBtn.style.padding = '8px 12px';
            addTestSpellBtn.style.backgroundColor = '#3498db';
            addTestSpellBtn.style.color = 'white';
            addTestSpellBtn.style.border = 'none';
            addTestSpellBtn.style.borderRadius = '3px';
            addTestSpellBtn.style.cursor = 'pointer';
            addTestSpellBtn.style.flex = '1';
            
            addTestSpellBtn.addEventListener('click', function() {
                const testSpell = {
                    id: "test-" + Date.now(),
                    name: "Test Spell " + new Date().toLocaleTimeString(),
                    level: "cantrip",
                    school: "evocation",
                    casting_time: "1 action",
                    range: "60 feet",
                    duration: "Instantaneous",
                    components: "V, S",
                    description: "This is a test spell created for debugging.",
                    higher_levels: "",
                    ritual: false,
                    concentration: false,
                    prepared: false
                };
                
                if (typeof window.characterData === 'undefined') {
                    window.characterData = { spells_array: [] };
                }
                
                if (!Array.isArray(window.characterData.spells_array)) {
                    window.characterData.spells_array = [];
                }
                
                window.characterData.spells_array.push(testSpell);
                logMessage(`Added test spell: ${testSpell.name}`);
                
                if (typeof window.renderSpells === 'function') {
                    try {
                        window.renderSpells();
                        logMessage("renderSpells() called successfully");
                    } catch (e) {
                        logMessage(`Error in renderSpells(): ${e.message}`);
                    }
                } else {
                    logMessage("Warning: renderSpells() function not found");
                }
            });
            
            btnContainer.appendChild(addTestSpellBtn);
            
            // Direct Save Button
            const directSaveBtn = document.createElement('button');
            directSaveBtn.textContent = 'Force Direct Save';
            directSaveBtn.style.padding = '8px 12px';
            directSaveBtn.style.backgroundColor = '#2ecc71';
            directSaveBtn.style.color = 'white';
            directSaveBtn.style.border = 'none';
            directSaveBtn.style.borderRadius = '3px';
            directSaveBtn.style.cursor = 'pointer';
            directSaveBtn.style.flex = '1';
            
            directSaveBtn.addEventListener('click', async function() {
                if (typeof window.directSaveSpells === 'function') {
                    logMessage("Attempting direct save via directSaveSpells()...");
                    try {
                        const result = await window.directSaveSpells();
                        logMessage(`directSaveSpells() result: ${result}`);
                    } catch (e) {
                        logMessage(`Error in directSaveSpells(): ${e.message}`);
                    }
                } else {
                    logMessage("Error: directSaveSpells() function not found");
                }
            });
            
            btnContainer.appendChild(directSaveBtn);
            
            // Standard Save Button
            const standardSaveBtn = document.createElement('button');
            standardSaveBtn.textContent = 'Force Standard Save';
            standardSaveBtn.style.padding = '8px 12px';
            standardSaveBtn.style.backgroundColor = '#9b59b6';
            standardSaveBtn.style.color = 'white';
            standardSaveBtn.style.border = 'none';
            standardSaveBtn.style.borderRadius = '3px';
            standardSaveBtn.style.cursor = 'pointer';
            standardSaveBtn.style.flex = '1';
            
            standardSaveBtn.addEventListener('click', async function() {
                if (typeof window.saveCharacter === 'function') {
                    logMessage("Attempting standard save via saveCharacter()...");
                    try {
                        const result = await window.saveCharacter(false);
                        logMessage(`saveCharacter() result: ${result}`);
                    } catch (e) {
                        logMessage(`Error in saveCharacter(): ${e.message}`);
                    }
                } else {
                    logMessage("Error: saveCharacter() function not found");
                }
            });
            
            btnContainer.appendChild(standardSaveBtn);
            
            testSpellSection.appendChild(btnContainer);
            panel.appendChild(testSpellSection);
            
            // Add manual repair buttons
            const repairSection = document.createElement('div');
            repairSection.style.marginTop = '20px';
            repairSection.style.paddingTop = '10px';
            repairSection.style.borderTop = '1px solid #7f8c8d';
            
            const repairTitle = document.createElement('h3');
            repairTitle.textContent = 'Repair Options';
            repairTitle.style.color = '#ecf0f1';
            repairSection.appendChild(repairTitle);
            
            const repairBtnContainer = document.createElement('div');
            repairBtnContainer.style.display = 'flex';
            repairBtnContainer.style.gap = '10px';
            
            // Fix Database Schema button
            const fixDbBtn = document.createElement('button');
            fixDbBtn.textContent = 'Fix Database Schema';
            fixDbBtn.style.flex = '1';
            fixDbBtn.style.padding = '10px';
            fixDbBtn.style.backgroundColor = '#e67e22';
            fixDbBtn.style.color = 'white';
            fixDbBtn.style.border = 'none';
            fixDbBtn.style.borderRadius = '4px';
            fixDbBtn.style.cursor = 'pointer';
            
            fixDbBtn.addEventListener('click', function() {
                window.open('update_schema.php', '_blank');
            });
            repairBtnContainer.appendChild(fixDbBtn);
            
            // Full Refresh button
            const refreshBtn = document.createElement('button');
            refreshBtn.textContent = 'Reload Page';
            refreshBtn.style.flex = '1';
            refreshBtn.style.padding = '10px';
            refreshBtn.style.backgroundColor = '#e74c3c';
            refreshBtn.style.color = 'white';
            refreshBtn.style.border = 'none';
            refreshBtn.style.borderRadius = '4px';
            refreshBtn.style.cursor = 'pointer';
            
            refreshBtn.addEventListener('click', function() {
                window.location.reload();
            });
            repairBtnContainer.appendChild(refreshBtn);
            
            repairSection.appendChild(repairBtnContainer);
            panel.appendChild(repairSection);
            
            // Add version info
            const versionInfo = document.createElement('div');
            versionInfo.style.marginTop = '20px';
            versionInfo.style.fontSize = '12px';
            versionInfo.style.color = '#7f8c8d';
            versionInfo.style.textAlign = 'center';
            versionInfo.textContent = 'Spell Save Diagnostic Tool v1.1';
            panel.appendChild(versionInfo);
        };
        
        // Collect diagnostic information
        const results = {
            'Environment': [],
            'Character Data': [],
            'Spell Data': [],
            'API Check': [],
            'Database Check': []
        };
        
        // Check environment
        results['Environment'].push({
            status: 'pass',
            message: 'Browser: ' + navigator.userAgent
        });
        
        // Check if we have a characterData object
        if (typeof window.characterData === 'object') {
            results['Character Data'].push({
                status: 'pass',
                message: 'Character data object exists'
            });
            
            // Character ID
            if (window.characterData.id) {
                results['Character Data'].push({
                    status: 'pass',
                    message: 'Character ID: ' + window.characterData.id
                });
            } else {
                results['Character Data'].push({
                    status: 'fail',
                    message: 'Character ID missing'
                });
            }
            
            // Check name
            if (window.characterData.name) {
                results['Character Data'].push({
                    status: 'pass',
                    message: 'Character name: ' + window.characterData.name
                });
            }
        } else {
            results['Character Data'].push({
                status: 'fail',
                message: 'Character data object missing'
            });
        }
        
        // Check spell array
        if (window.characterData && Array.isArray(window.characterData.spells_array)) {
            results['Spell Data'].push({
                status: 'pass',
                message: 'Spells array exists with ' + window.characterData.spells_array.length + ' spells'
            });
            
            // Check a sample spell
            if (window.characterData.spells_array.length > 0) {
                const sampleSpell = window.characterData.spells_array[0];
                const requiredFields = ['id', 'name', 'level', 'school', 'description'];
                const missingFields = requiredFields.filter(field => !sampleSpell.hasOwnProperty(field));
                
                if (missingFields.length === 0) {
                    results['Spell Data'].push({
                        status: 'pass',
                        message: 'Sample spell has all required fields',
                        details: sampleSpell
                    });
                } else {
                    results['Spell Data'].push({
                        status: 'fail',
                        message: 'Sample spell missing fields: ' + missingFields.join(', '),
                        details: sampleSpell
                    });
                }
                
                // Attempt to serialize
                try {
                    const serialized = JSON.stringify(window.characterData.spells_array);
                    results['Spell Data'].push({
                        status: 'pass',
                        message: 'Spells array can be serialized to JSON',
                        details: serialized.length + ' characters'
                    });
                } catch (e) {
                    results['Spell Data'].push({
                        status: 'fail',
                        message: 'Failed to serialize spells array: ' + e.message
                    });
                }
            }
        } else {
            results['Spell Data'].push({
                status: 'fail',
                message: 'Spells array is missing or not an array'
            });
        }
        
        // Check save methods
        if (typeof window.directSaveSpells === 'function') {
            results['API Check'].push({
                status: 'pass',
                message: 'Direct save method exists'
            });
        } else {
            results['API Check'].push({
                status: 'fail',
                message: 'Direct save method missing'
            });
        }
        
        if (typeof window.saveCharacter === 'function') {
            results['API Check'].push({
                status: 'pass',
                message: 'Standard save method exists'
            });
        } else {
            results['API Check'].push({
                status: 'fail',
                message: 'Standard save method missing'
            });
        }
        
        // Check API endpoint
        fetch('api/character_safe.php', { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    results['API Check'].push({
                        status: 'pass',
                        message: 'API endpoint exists'
                    });
                } else {
                    results['API Check'].push({
                        status: 'fail',
                        message: 'API endpoint returned status: ' + response.status
                    });
                }
                
                // Check database schema
                fetch('update_schema.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            results['Database Check'].push({
                                status: 'pass',
                                message: data.message,
                                details: data
                            });
                        } else {
                            results['Database Check'].push({
                                status: 'fail',
                                message: 'Database schema check failed: ' + data.message,
                                details: data
                            });
                        }
                        
                        // Display all collected results
                        displayResults(results);
                    })
                    .catch(error => {
                        results['Database Check'].push({
                            status: 'fail',
                            message: 'Error checking database schema: ' + error.message
                        });
                        
                        // Display results even if database check fails
                        displayResults(results);
                    });
            })
            .catch(error => {
                results['API Check'].push({
                    status: 'fail',
                    message: 'Error accessing API: ' + error.message
                });
                
                // Call database check anyway
                fetch('update_schema.php')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            results['Database Check'].push({
                                status: 'pass',
                                message: data.message,
                                details: data
                            });
                        } else {
                            results['Database Check'].push({
                                status: 'fail',
                                message: 'Database schema check failed: ' + data.message,
                                details: data
                            });
                        }
                        
                        // Display all collected results
                        displayResults(results);
                    })
                    .catch(error => {
                        results['Database Check'].push({
                            status: 'fail',
                            message: 'Error checking database schema: ' + error.message
                        });
                        
                        // Display results even if database check fails
                        displayResults(results);
                    });
            });
    };
    
    // Create the diagnostic button after a slight delay
    setTimeout(createDiagnosticButton, 1000);
    
    console.log("SpellDiagnostics: Initialization complete");
});