// Comprehensive fix for character sheet functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("ComprehensiveFix: Initializing integrated character sheet fixes");
    
    // Initialize critical UI fixes immediately
    fixPanelLayoutIssues();
    
    // Apply main fixes after ensuring the DOM is fully loaded
    const initFixes = function() {
        console.log("ComprehensiveFix: Applying all fixes");
        
        // First, critical UI structure fixes
        enhanceSidePanels();
        
        // Then, content-related enhancements
        ensureSpellRendering();
        improveSpellDisplay();
        enhanceHPDisplay();
        
        // Functional enhancements
        fixSaveButton();
        addSpellsDropdown();
        addRollHistoryStyles();
        
        // Show indicator that fixes are active
        showFixesActiveIndicator();
    };
    
    // Apply fixes after a short delay to ensure everything is loaded
    setTimeout(initFixes, 800);
    
    // Add a fallback in case the timeout is too short
    if (document.readyState === 'complete') {
        initFixes();
    } else {
        window.addEventListener('load', function() {
            // Double-check that sidebars work correctly after full load
            const checkSidebars = function() {
                const leftSidebar = document.getElementById('leftSidebar');
                const rightSidebar = document.getElementById('rightSidebar');
                
                // Reset any incorrectly collapsed sidebars
                if (leftSidebar && leftSidebar.classList.contains('sidebar-collapsed')) {
                    leftSidebar.style.width = '40px';
                    leftSidebar.querySelector('.sidebar-content').style.display = 'none';
                }
                
                if (rightSidebar && rightSidebar.classList.contains('sidebar-collapsed')) {
                    rightSidebar.style.width = '40px';
                    rightSidebar.querySelector('.sidebar-content').style.display = 'none';
                }
            };
            
            setTimeout(checkSidebars, 2000);
        });
    }
    
    // Fix the main save button to ensure it properly saves all character data
    function fixSaveButton() {
        const saveCharacterBtn = document.getElementById('saveCharacterBtn');
        
        if (saveCharacterBtn) {
            console.log("ComprehensiveFix: Applying fix to main save button");
            
            // Clone to remove existing handlers
            const newSaveBtn = saveCharacterBtn.cloneNode(true);
            saveCharacterBtn.parentNode.replaceChild(newSaveBtn, saveCharacterBtn);
            
            // Add comprehensive save handler
            newSaveBtn.addEventListener('click', async function() {
                console.log("ComprehensiveFix: Save button clicked, performing comprehensive save");
                
                // Show save indicator
                const saveIndicator = createSaveIndicator("Saving character...");
                
                try {
                    // Get all form data
                    const characterData = collectCharacterData();
                    
                    // Add some additional safety for the spell save
                    if (!characterData.spells_array_json || characterData.spells_array_json === 'undefined') {
                        characterData.spells_array_json = '[]';
                    }
                    
                    // Make sure we have valid JSON
                    try {
                        JSON.parse(characterData.spells_array_json);
                    } catch (e) {
                        console.error("ComprehensiveFix: Invalid spells JSON, resetting to empty array", e);
                        characterData.spells_array_json = '[]';
                    }
                    
                    // Validate other required fields
                    const requiredFields = ['name', 'race', 'class'];
                    requiredFields.forEach(field => {
                        if (!characterData[field]) {
                            characterData[field] = field === 'name' ? 'Character' : '';
                        }
                    });
                    
                    // Convert numeric fields to strings to avoid pattern matching issues
                    const numericFields = [
                        'level', 'armor_class', 'hit_points', 'max_hit_points', 'temp_hit_points',
                        'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
                        'gold', 'silver', 'copper', 'spell_save_dc', 'spell_attack_bonus'
                    ];
                    
                    numericFields.forEach(field => {
                        if (characterData[field] !== undefined) {
                            characterData[field] = String(parseInt(characterData[field]) || 0);
                        } else {
                            characterData[field] = '0';
                        }
                    });
                    
                    // Perform the save operation
                    const result = await saveCompleteCharacter(characterData);
                    
                    if (result.success) {
                        // Check if it's a partial success (spells only)
                        if (result.partial) {
                            updateSaveIndicator(saveIndicator, "Spells saved successfully!", "success");
                        } else {
                            updateSaveIndicator(saveIndicator, "Character saved successfully", "success");
                        }
                    } else {
                        console.error("ComprehensiveFix: Save failed:", result);
                        
                        // Try spells-only save as fallback
                        try {
                            await saveSpellsOnly(characterData.id, characterData.spells_array_json);
                            updateSaveIndicator(saveIndicator, "Spells saved, but error with other data: " + result.message, "warning");
                        } catch (spellError) {
                            updateSaveIndicator(saveIndicator, "Error: " + result.message, "error");
                        }
                    }
                } catch (error) {
                    console.error("ComprehensiveFix: Error saving character:", error);
                    
                    // Try direct API call as absolute last resort
                    try {
                        const urlParams = new URLSearchParams(window.location.search);
                        const characterId = urlParams.get('id');
                        
                        if (characterId && window.characterData && Array.isArray(window.characterData.spells_array)) {
                            const spellsFormData = new FormData();
                            spellsFormData.append('id', characterId);
                            spellsFormData.append('spells_array_json', JSON.stringify(window.characterData.spells_array));
                            
                            const spellResponse = await fetch('api/save_spells.php', {
                                method: 'POST',
                                body: spellsFormData
                            });
                            
                            const spellResult = await spellResponse.json();
                            
                            if (spellResult.success) {
                                updateSaveIndicator(saveIndicator, "Spells saved, but error with other data", "warning");
                            } else {
                                updateSaveIndicator(saveIndicator, "All save methods failed: " + error.message, "error");
                            }
                        } else {
                            updateSaveIndicator(saveIndicator, "Error: " + error.message, "error");
                        }
                    } catch (finalError) {
                        updateSaveIndicator(saveIndicator, "Error: " + error.message, "error");
                    }
                }
            });
        } else {
            console.error("ComprehensiveFix: Save button not found");
        }
    }
    
    // Make the side panels scrollable independently and resizable
    function enhanceSidePanels() {
        console.log("ComprehensiveFix: Enhancing side panels with independent scrolling and resizing");
        
        // Get panel elements
        const leftSidebar = document.getElementById('leftSidebar');
        const rightSidebar = document.getElementById('rightSidebar');
        const leftToggle = document.getElementById('leftToggle');
        const rightToggle = document.getElementById('rightToggle');
        
        // Fix the sidebar toggle functionality
        if (leftSidebar && leftToggle) {
            // First, remove any existing click handlers by cloning and replacing
            const newLeftToggle = leftToggle.cloneNode(true);
            leftToggle.parentNode.replaceChild(newLeftToggle, leftToggle);
            
            // Add the new toggle event handler with proper collapse behavior
            newLeftToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle the collapsed state
                leftSidebar.classList.toggle('sidebar-collapsed');
                
                // Update the icon
                this.innerHTML = leftSidebar.classList.contains('sidebar-collapsed') 
                    ? '<i class="fas fa-chevron-right"></i>' 
                    : '<i class="fas fa-chevron-left"></i>';
                    
                // Set appropriate width and handle content visibility
                if (leftSidebar.classList.contains('sidebar-collapsed')) {
                    leftSidebar.style.width = '40px';  // Collapsed width
                    leftSidebar.querySelector('.sidebar-content').style.display = 'none';
                } else {
                    // Restore saved width or use default
                    const savedWidth = localStorage.getItem(`${leftSidebar.id}_width`);
                    if (savedWidth && savedWidth !== '40') {
                        leftSidebar.style.width = `${savedWidth}px`;
                    } else {
                        leftSidebar.style.width = '250px';  // Default expanded width
                    }
                    leftSidebar.querySelector('.sidebar-content').style.display = 'block';
                }
            });
        }
        
        if (rightSidebar && rightToggle) {
            // First, remove any existing click handlers by cloning and replacing
            const newRightToggle = rightToggle.cloneNode(true);
            rightToggle.parentNode.replaceChild(newRightToggle, rightToggle);
            
            // Add the new toggle event handler with proper collapse behavior
            newRightToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle the collapsed state
                rightSidebar.classList.toggle('sidebar-collapsed');
                
                // Update the icon
                this.innerHTML = rightSidebar.classList.contains('sidebar-collapsed') 
                    ? '<i class="fas fa-chevron-left"></i>' 
                    : '<i class="fas fa-chevron-right"></i>';
                    
                // Set appropriate width and handle content visibility
                if (rightSidebar.classList.contains('sidebar-collapsed')) {
                    rightSidebar.style.width = '40px';  // Collapsed width
                    rightSidebar.querySelector('.sidebar-content').style.display = 'none';
                } else {
                    // Restore saved width or use default
                    const savedWidth = localStorage.getItem(`${rightSidebar.id}_width`);
                    if (savedWidth && savedWidth !== '40') {
                        rightSidebar.style.width = `${savedWidth}px`;
                    } else {
                        rightSidebar.style.width = '250px';  // Default expanded width
                    }
                    rightSidebar.querySelector('.sidebar-content').style.display = 'block';
                }
            });
        }
        
        if (leftSidebar) {
            // Make the notes section independently scrollable
            const notesContainer = leftSidebar.querySelector('.notes-container');
            if (notesContainer) {
                notesContainer.style.maxHeight = 'calc(100vh - 150px)';
                notesContainer.style.overflowY = 'auto';
                notesContainer.style.overflowX = 'hidden';
                notesContainer.style.paddingRight = '5px';
                notesContainer.style.marginRight = '-5px';
            }
            
            // Make sidebar resizable
            makeResizable(leftSidebar, 'right');
        }
        
        if (rightSidebar) {
            // Make the dice roller section independently scrollable
            const diceContainer = rightSidebar.querySelector('.dice-container');
            if (diceContainer) {
                diceContainer.style.maxHeight = 'calc(100vh - 150px)';
                diceContainer.style.overflowY = 'auto';
                diceContainer.style.overflowX = 'hidden';
                diceContainer.style.paddingRight = '5px';
                diceContainer.style.marginRight = '-5px';
            }
            
            // Make sidebar resizable
            makeResizable(rightSidebar, 'left');
        }
        
        // Add CSS for custom scrollbars and improved sidebar transition
        const style = document.createElement('style');
        style.textContent = `
            .character-sidebar {
                transition: width 0.3s ease;
                z-index: 100;
                position: relative;
                overflow: hidden;
            }
            
            .sidebar-toggle {
                z-index: 101;
                cursor: pointer;
                position: absolute;
                top: 20px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                transition: background 0.3s ease;
            }
            
            .sidebar-toggle:hover {
                background: rgba(0, 0, 0, 0.2);
            }
            
            #leftToggle {
                right: 10px;
            }
            
            #rightToggle {
                left: 10px;
            }
            
            /* Ensure the sidebar content doesn't show during transition */
            .character-sidebar.sidebar-collapsed .sidebar-content {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: opacity 0.2s ease, visibility 0.2s ease;
            }
            
            .character-sidebar .sidebar-content {
                opacity: 1;
                visibility: visible;
                transition: opacity 0.2s ease 0.1s, visibility 0.2s ease 0.1s;
            }
            
            /* Improved scrollbars */
            .notes-container::-webkit-scrollbar,
            .dice-container::-webkit-scrollbar {
                width: 6px;
            }
            
            .notes-container::-webkit-scrollbar-track,
            .dice-container::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 3px;
            }
            
            .notes-container::-webkit-scrollbar-thumb,
            .dice-container::-webkit-scrollbar-thumb {
                background: rgba(100, 100, 100, 0.5);
                border-radius: 3px;
            }
            
            .notes-container::-webkit-scrollbar-thumb:hover,
            .dice-container::-webkit-scrollbar-thumb:hover {
                background: rgba(100, 100, 100, 0.8);
            }
            
            .character-content {
                flex: 1;
                min-width: 0;
                overflow-x: hidden;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fix panel layout issues
    function fixPanelLayoutIssues() {
        console.log("ComprehensiveFix: Fixing panel layout issues");
        
        // Add CSS to fix layout issues between panels
        const style = document.createElement('style');
        style.textContent = `
            /* Main container layout */
            .character-container {
                display: flex;
                height: calc(100vh - 60px);
                overflow: hidden;
                position: relative;
            }
            
            /* Ensure content area doesn't get squished when side panels expand */
            .character-content {
                flex: 1;
                min-width: 500px; /* Minimum width for content */
                max-width: calc(100% - 80px); /* Maximum width when both sidebars are collapsed */
                transition: max-width 0.3s ease, margin 0.3s ease;
                overflow-y: auto;
                box-sizing: border-box;
            }
            
            /* Adjust panel interactions with proper spacing */
            #leftSidebar:not(.sidebar-collapsed) ~ .character-content {
                max-width: calc(100% - 290px);
                margin-left: 0;
            }
            
            #rightSidebar:not(.sidebar-collapsed) ~ .character-content {
                max-width: calc(100% - 290px);
                margin-right: 0;
            }
            
            #leftSidebar:not(.sidebar-collapsed) ~ #rightSidebar:not(.sidebar-collapsed) ~ .character-content {
                max-width: calc(100% - 540px);
                margin: 0;
            }
            
            /* Fix for left sidebar collapsed */
            #leftSidebar.sidebar-collapsed ~ .character-content {
                margin-left: 0;
            }
            
            /* Fix for right sidebar collapsed */
            #rightSidebar.sidebar-collapsed ~ .character-content {
                margin-right: 0;
            }
            
            /* Ensure proper z-index for panels */
            .character-sidebar {
                position: relative;
                z-index: 10;
                box-sizing: border-box;
                height: 100%;
            }
            
            /* Ensure collapsed panels stay minimal with proper transitions */
            .character-sidebar.sidebar-collapsed {
                flex: 0 0 40px !important;
                min-width: 40px !important;
                max-width: 40px !important;
                width: 40px !important;
                overflow: hidden;
            }
            
            /* Ensure sidebar titles are properly styled */
            .sidebar-title {
                margin-top: 20px; /* Make room for the toggle button */
                text-align: center;
                padding: 10px;
            }
            
            /* Make sure scrollable containers don't get cut off */
            .notes-container, .dice-container {
                height: calc(100% - 60px);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Enhance the spell display with a cleaner list view and hover details
    function improveSpellDisplay() {
        console.log("ComprehensiveFix: Improving spell display with hover details");
        
        // Add styles for improved spell display
        const style = document.createElement('style');
        style.textContent = `
            /* Improved Spell Display */
            .spell-list-container {
                position: relative;
            }
            
            .spell-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 10px;
            }
            
            /* Level headers */
            .spell-level-header {
                background: var(--bg-primary, #2f3136);
                border-radius: 5px;
                padding: 8px 15px;
                font-weight: bold;
                color: var(--primary, #7289da);
                margin-top: 15px;
                margin-bottom: 5px;
                border-left: 4px solid var(--primary, #7289da);
                font-size: 18px;
            }
            
            /* Spell items */
            .spell-item {
                background: var(--bg-secondary, #36393f);
                border-radius: 6px;
                padding: 8px 15px;
                position: relative;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid rgba(255, 255, 255, 0.05);
                overflow: visible;
            }
            
            .spell-item:hover {
                background: var(--bg-tertiary, #40444b);
                transform: translateX(5px);
                z-index: 10;
            }
            
            .spell-name-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .spell-item-name {
                font-weight: bold;
                color: var(--text-primary, #ffffff);
            }
            
            .spell-school-badge {
                font-size: 12px;
                background: rgba(0, 0, 0, 0.15);
                padding: 2px 8px;
                border-radius: 10px;
                color: var(--text-secondary, #b9bbbe);
            }
            
            .spell-item-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 5px;
                opacity: 0.6;
                transition: opacity 0.2s ease;
            }
            
            .spell-item:hover .spell-item-actions {
                opacity: 1;
            }
            
            .spell-action-btn {
                background: var(--bg-primary, #2f3136);
                border: none;
                color: var(--text-primary, #ffffff);
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: background 0.2s ease;
            }
            
            .spell-action-btn:hover {
                background: var(--primary, #7289da);
            }
            
            /* Spell detail tooltip */
            .spell-detail-tooltip {
                position: absolute;
                background: #2f3136;
                border-radius: 6px;
                padding: 15px;
                width: 350px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
                z-index: 2000;
                border: 1px solid #7289da;
                opacity: 0;
                display: block !important;
                left: 105%;
                top: 0;
                transform: translateY(-20%);
                color: #ffffff;
                pointer-events: auto;
                transition: opacity 0.2s ease;
            }
            
            /* Fix for mobile and small screens - show tooltip below instead of to the right */
            @media (max-width: 1200px) {
                .spell-detail-tooltip {
                    left: 0;
                    top: 100%;
                    transform: translateY(0);
                    width: 100%;
                }
                
                .spell-detail-tooltip::before {
                    left: 20px;
                    top: -10px;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-bottom: 10px solid #7289da;
                    border-top: none;
                }
            }
            
            .spell-detail-tooltip::before {
                content: '';
                position: absolute;
                top: 30px;
                left: -10px;
                width: 0;
                height: 0;
                border-top: 10px solid transparent;
                border-bottom: 10px solid transparent;
                border-right: 10px solid #7289da;
            }
            
            /* Force tooltip to display on hover - double selector for higher specificity */
            .spell-item:hover .spell-detail-tooltip,
            .spell-item:hover > .spell-detail-tooltip {
                opacity: 1 !important;
                visibility: visible !important;
                display: block !important;
                pointer-events: auto !important;
            }
            
            /* Force display for clicked items */
            .spell-item.tooltip-visible .spell-detail-tooltip {
                opacity: 1 !important;
                visibility: visible !important;
                display: block !important;
                pointer-events: auto !important;
                z-index: 2500 !important;
            }
            
            .spell-detail-header {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
                color: var(--primary, #7289da);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 5px;
            }
            
            .spell-detail-level-school {
                font-size: 14px;
                color: var(--text-secondary, #b9bbbe);
                margin-bottom: 10px;
            }
            
            .spell-detail-properties {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5px 10px;
                margin-bottom: 10px;
                font-size: 13px;
            }
            
            .spell-detail-property-label {
                font-weight: bold;
                color: var(--text-secondary, #b9bbbe);
            }
            
            .spell-detail-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-bottom: 10px;
            }
            
            .spell-detail-tag {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 2px 8px;
                font-size: 12px;
            }
            
            .spell-detail-tag.ritual {
                background: rgba(75, 0, 130, 0.3);
                color: #e6e6fa;
            }
            
            .spell-detail-tag.concentration {
                background: rgba(139, 0, 0, 0.3);
                color: #ffcccb;
            }
            
            .spell-detail-tag.prepared {
                background: rgba(0, 128, 0, 0.3);
                color: #ccffcc;
            }
            
            .spell-detail-description {
                font-size: 13px;
                line-height: 1.4;
                color: var(--text-primary, #ffffff);
                max-height: 150px;
                overflow-y: auto;
                margin-bottom: 10px;
                padding-right: 5px;
            }
            
            .spell-detail-at-higher-levels {
                font-size: 13px;
                font-style: italic;
                color: var(--text-secondary, #b9bbbe);
            }
            
            /* Spell tooltip scrollbar */
            .spell-detail-description::-webkit-scrollbar {
                width: 4px;
            }
            
            .spell-detail-description::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 2px;
            }
            
            .spell-detail-description::-webkit-scrollbar-thumb {
                background: rgba(100, 100, 100, 0.5);
                border-radius: 2px;
            }
            
            /* Close button for tooltip when clicked */
            .tooltip-close-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                cursor: pointer;
                font-size: 14px;
                padding: 2px 5px;
                border-radius: 50%;
                display: none;
            }
            
            .tooltip-close-btn:hover {
                color: rgba(255, 255, 255, 0.9);
                background: rgba(0, 0, 0, 0.2);
            }
            
            .spell-item.tooltip-visible .tooltip-close-btn {
                display: block;
            }
        `;
        document.head.appendChild(style);
        
        // Add spell display mode toggle button
        function addSpellViewToggle() {
            const spellFilters = document.querySelector('.spell-filters');
            if (!spellFilters) return;
            
            // Create toggle button container
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'spell-filter-group';
            toggleContainer.style.marginLeft = 'auto';
            
            // Label
            const toggleLabel = document.createElement('label');
            toggleLabel.textContent = 'View Mode';
            toggleContainer.appendChild(toggleLabel);
            
            // Create the toggle button
            const toggleButton = document.createElement('button');
            toggleButton.className = 'btn-secondary btn-sm';
            toggleButton.id = 'spellViewToggle';
            toggleButton.style.padding = '4px 10px';
            toggleButton.style.marginTop = '5px';
            toggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
            toggleButton.title = 'Toggle between list view and detail view for spells';
            
            // Initialize the view state
            window.spellDetailViewEnabled = false;
            
            // Add click handler to toggle view
            toggleButton.addEventListener('click', function() {
                window.spellDetailViewEnabled = !window.spellDetailViewEnabled;
                
                // Update the button text
                if (window.spellDetailViewEnabled) {
                    this.innerHTML = '<i class="fas fa-th-large"></i> Detail View';
                    document.body.classList.add('spell-details-always-visible');
                } else {
                    this.innerHTML = '<i class="fas fa-list"></i> List View';
                    document.body.classList.remove('spell-details-always-visible');
                }
                
                // Refresh spell display
                window.renderSpells();
            });
            
            toggleContainer.appendChild(toggleButton);
            spellFilters.appendChild(toggleContainer);
            
            // Add necessary CSS for detail view
            const detailViewStyle = document.createElement('style');
            detailViewStyle.textContent = `
                .spell-details-always-visible .spell-detail-tooltip {
                    position: static !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    display: block !important;
                    width: 100% !important;
                    margin-top: 10px !important;
                    transform: none !important;
                    left: 0 !important;
                    top: 0 !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
                }
                
                .spell-details-always-visible .spell-detail-tooltip::before {
                    display: none !important;
                }
                
                .spell-details-always-visible .spell-item {
                    overflow: visible !important;
                    margin-bottom: 20px !important;
                }
                
                .spell-details-always-visible .tooltip-close-btn {
                    display: none !important;
                }
            `;
            document.head.appendChild(detailViewStyle);
        }
        
        // Override the renderSpells function if it exists
        const originalRenderSpells = window.renderSpells;
        window.renderSpells = function() {
            // If there was an original function, call it first
            if (typeof originalRenderSpells === 'function') {
                const result = originalRenderSpells.apply(this, arguments);
                if (!result) return false; // If original failed, abort
            }
            
            // Now enhance the spell display
            const spellList = document.getElementById('spellList');
            if (!spellList) return false;
            
            // Get the spells data
            if (!window.characterData || !Array.isArray(window.characterData.spells_array)) {
                return false;
            }
            
            // Ensure our toggle button exists
            if (!document.getElementById('spellViewToggle')) {
                setTimeout(addSpellViewToggle, 500);
            }
            
            // Clear the current display
            spellList.innerHTML = '';
            
            // Group spells by level
            const spellsByLevel = {};
            window.characterData.spells_array.forEach(spell => {
                const level = spell.level === 'cantrip' ? 0 : parseInt(spell.level) || 0;
                if (!spellsByLevel[level]) {
                    spellsByLevel[level] = [];
                }
                spellsByLevel[level].push(spell);
            });
            
            // Sort levels
            const sortedLevels = Object.keys(spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b));
            
            // Create spell display
            sortedLevels.forEach(level => {
                // Create level header
                const levelHeader = document.createElement('div');
                levelHeader.className = 'spell-level-header';
                levelHeader.textContent = level === '0' || level === 0 ? 'Cantrips' : `Level ${level} Spells`;
                spellList.appendChild(levelHeader);
                
                // Create spells for this level
                spellsByLevel[level].forEach((spell, spellIndex) => {
                    const spellItem = createImprovedSpellItem(spell, spellIndex);
                    
                    // In detail view mode, force all tooltips to be visible
                    if (window.spellDetailViewEnabled) {
                        spellItem.classList.add('tooltip-visible');
                    }
                    
                    spellList.appendChild(spellItem);
                });
            });
            
            return true;
        };
        
        // Replace the spell list if it already exists
        setTimeout(() => {
            if (typeof window.renderSpells === 'function') {
                window.renderSpells();
            }
        }, 2000);
    }
    
    // Create improved spell item with hover details
    function createImprovedSpellItem(spell, index) {
        const spellItem = document.createElement('div');
        spellItem.className = 'spell-item';
        spellItem.dataset.index = index;
        
        // School/level display
        const schoolText = spell.school ? spell.school.charAt(0).toUpperCase() + spell.school.slice(1) : 'Unknown';
        const levelText = spell.level === 'cantrip' || spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
        
        // Main row with spell name
        const nameRow = document.createElement('div');
        nameRow.className = 'spell-name-row';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'spell-item-name';
        nameSpan.textContent = spell.name;
        
        const schoolBadge = document.createElement('span');
        schoolBadge.className = 'spell-school-badge';
        schoolBadge.textContent = schoolText;
        
        nameRow.appendChild(nameSpan);
        nameRow.appendChild(schoolBadge);
        
        // Action buttons
        const actionDiv = document.createElement('div');
        actionDiv.className = 'spell-item-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'spell-action-btn edit-spell';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.dataset.index = index;
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof window.openSpellEditor === 'function') {
                window.openSpellEditor(spell, index);
            } else {
                console.error("ComprehensiveFix: openSpellEditor function not available");
                alert(`Cannot edit spell: ${spell.name} - Editor function unavailable`);
            }
        });
        
        // Cast button
        const castBtn = document.createElement('button');
        castBtn.className = 'spell-action-btn cast-spell';
        castBtn.innerHTML = '<i class="fas fa-magic"></i> Cast';
        castBtn.dataset.index = index;
        castBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof window.castSpell === 'function') {
                window.castSpell(spell);
            } else {
                // Simple fallback
                alert(`Cast spell: ${spell.name}`);
            }
        });
        
        // Prepare button
        const prepareBtn = document.createElement('button');
        prepareBtn.className = 'spell-action-btn prepare-spell';
        prepareBtn.innerHTML = `<i class="fas fa-book"></i> ${spell.prepared ? 'Unprepare' : 'Prepare'}`;
        prepareBtn.dataset.index = index;
        prepareBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (typeof window.toggleSpellPrepared === 'function') {
                window.toggleSpellPrepared(index);
            } else {
                // Simple fallback
                spell.prepared = !spell.prepared;
                window.renderSpells();
            }
        });
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'spell-action-btn delete-spell';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.dataset.index = index;
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete "${spell.name}"?`)) {
                if (window.characterData && Array.isArray(window.characterData.spells_array)) {
                    window.characterData.spells_array.splice(index, 1);
                    window.renderSpells();
                }
            }
        });
        
        actionDiv.appendChild(editBtn);
        actionDiv.appendChild(castBtn);
        actionDiv.appendChild(prepareBtn);
        actionDiv.appendChild(deleteBtn);
        
        // Spell detail tooltip (appears on hover)
        const spellDetail = document.createElement('div');
        spellDetail.className = 'spell-detail-tooltip';
        
        // Add close button for when tooltip is clicked
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tooltip-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            spellItem.classList.remove('tooltip-visible');
        });
        spellDetail.appendChild(closeBtn);
        
        // Spell detail content
        const detailHeader = document.createElement('div');
        detailHeader.className = 'spell-detail-header';
        detailHeader.textContent = spell.name;
        
        const detailLevelSchool = document.createElement('div');
        detailLevelSchool.className = 'spell-detail-level-school';
        detailLevelSchool.textContent = `${levelText} • ${schoolText}`;
        
        // Spell properties
        const detailProperties = document.createElement('div');
        detailProperties.className = 'spell-detail-properties';
        
        const properties = [
            { label: 'Casting Time', value: spell.casting_time || 'N/A' },
            { label: 'Range', value: spell.range || 'N/A' },
            { label: 'Duration', value: spell.duration || 'N/A' },
            { label: 'Components', value: spell.components || 'N/A' }
        ];
        
        properties.forEach(prop => {
            const propDiv = document.createElement('div');
            propDiv.innerHTML = `<span class="spell-detail-property-label">${prop.label}:</span> ${prop.value}`;
            detailProperties.appendChild(propDiv);
        });
        
        // Spell tags (ritual, concentration, prepared)
        const detailTags = document.createElement('div');
        detailTags.className = 'spell-detail-tags';
        
        if (spell.ritual) {
            const ritualTag = document.createElement('span');
            ritualTag.className = 'spell-detail-tag ritual';
            ritualTag.textContent = 'Ritual';
            detailTags.appendChild(ritualTag);
        }
        
        if (spell.concentration) {
            const concentrationTag = document.createElement('span');
            concentrationTag.className = 'spell-detail-tag concentration';
            concentrationTag.textContent = 'Concentration';
            detailTags.appendChild(concentrationTag);
        }
        
        if (spell.prepared) {
            const preparedTag = document.createElement('span');
            preparedTag.className = 'spell-detail-tag prepared';
            preparedTag.textContent = 'Prepared';
            detailTags.appendChild(preparedTag);
        }
        
        // Spell description
        const detailDescription = document.createElement('div');
        detailDescription.className = 'spell-detail-description';
        
        // Format description with paragraphs if it has multiple lines
        if (spell.description && spell.description.includes('\n')) {
            const paragraphs = spell.description.split('\n').filter(p => p.trim());
            paragraphs.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                detailDescription.appendChild(p);
            });
        } else {
            detailDescription.textContent = spell.description || 'No description available.';
        }
        
        // Higher levels
        let higherLevelsDiv = null;
        if (spell.higher_levels) {
            higherLevelsDiv = document.createElement('div');
            higherLevelsDiv.className = 'spell-detail-at-higher-levels';
            higherLevelsDiv.innerHTML = `<strong>At Higher Levels:</strong> ${spell.higher_levels}`;
        }
        
        // Assemble tooltip
        spellDetail.appendChild(detailHeader);
        spellDetail.appendChild(detailLevelSchool);
        spellDetail.appendChild(detailProperties);
        
        if (detailTags.children.length > 0) {
            spellDetail.appendChild(detailTags);
        }
        
        spellDetail.appendChild(detailDescription);
        
        if (higherLevelsDiv) {
            spellDetail.appendChild(higherLevelsDiv);
        }
        
        // Assemble the spell item
        spellItem.appendChild(nameRow);
        spellItem.appendChild(actionDiv);
        spellItem.appendChild(spellDetail);
        
        // Make tooltip always visible on hover
        spellItem.addEventListener('mouseenter', function() {
            // Ensure the tooltip is visible
            const tooltip = this.querySelector('.spell-detail-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
                tooltip.style.display = 'block';
            }
        });

        // Add click handler to persist tooltip visibility
        spellItem.addEventListener('click', function(e) {
            // Don't toggle if clicking on a button
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            // Toggle persistent visibility class
            this.classList.toggle('tooltip-visible');
            console.log("Spell clicked, tooltip visible:", this.classList.contains('tooltip-visible'));
            
            // Close all other tooltips
            const allSpellItems = document.querySelectorAll('.spell-item');
            allSpellItems.forEach(item => {
                if (item !== this) {
                    item.classList.remove('tooltip-visible');
                }
            });
        });

        // Add a global handler for all spell items to close tooltips when clicking outside
        if (!window.tooltipOutsideClickHandlerAdded) {
            document.addEventListener('click', function(event) {
                // Check if click is outside all spell items
                const clickedSpellItem = event.target.closest('.spell-item');
                if (!clickedSpellItem) {
                    // Close all tooltips
                    document.querySelectorAll('.spell-item.tooltip-visible').forEach(item => {
                        item.classList.remove('tooltip-visible');
                    });
                }
            });
            window.tooltipOutsideClickHandlerAdded = true;
        }

        // Force initial layout to ensure the tooltips are properly positioned
        setTimeout(() => {
            const tooltip = spellItem.querySelector('.spell-detail-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.display = 'block';
                setTimeout(() => {
                    tooltip.style.display = ''; // Reset to CSS control
                }, 10);
            }
        }, 100);
        
        return spellItem;
    }
    
    // Enhance the HP display section to focus on the egg shape design
    function enhanceHPDisplay() {
        console.log("ComprehensiveFix: Enhancing HP display section");
        
        // Find the HP elements
        const hpSection = document.querySelector('.hp-section');
        const hpDisplay = document.querySelector('.hp-display');
        const hpShield = document.querySelector('.hp-shield');
        const hpBarContainer = document.querySelector('.hp-bar-container');
        
        if (!hpSection || !hpDisplay) {
            console.error("ComprehensiveFix: HP section elements not found");
            return;
        }
        
        // Hide the HP bar if we have the egg display
        if (hpBarContainer && hpShield) {
            hpBarContainer.style.display = 'none';
        }
        
        // Create enhanced HP egg display styles
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced HP Section */
            .hp-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                background: var(--bg-secondary, #2f3136);
                border-radius: 15px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .hp-display {
                position: relative;
                width: 180px;
                height: 180px;
                margin-bottom: 20px;
            }
            
            .hp-shield {
                position: relative;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #2c3e50, #34495e);
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.3), 
                            inset 0 0 20px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                transition: transform 0.3s ease;
                transform-origin: center;
            }
            
            .hp-shield:hover {
                transform: scale(1.05);
            }
            
            .hp-shield:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: conic-gradient(
                    from 0deg,
                    var(--hp-color, #2ecc71) 0%,
                    var(--hp-color, #2ecc71) var(--hp-percent, 100%),
                    rgba(50, 50, 50, 0.3) var(--hp-percent, 100%),
                    rgba(50, 50, 50, 0.3) 100%
                );
                border-radius: 50%;
                z-index: 1;
            }
            
            .hp-shield:after {
                content: '';
                position: absolute;
                top: 10px;
                left: 10px;
                right: 10px;
                bottom: 10px;
                background: radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%);
                border-radius: 50%;
                z-index: 1;
                pointer-events: none;
            }
            
            .current-hp {
                position: relative;
                font-size: 48px;
                font-weight: bold;
                color: white;
                text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
                z-index: 2;
            }
            
            .max-hp {
                position: relative;
                font-size: 18px;
                color: rgba(255, 255, 255, 0.8);
                z-index: 2;
            }
            
            .temp-hp {
                position: relative;
                font-size: 24px;
                font-weight: bold;
                color: #3498db;
                text-shadow: 0 0 5px rgba(52, 152, 219, 0.6);
                margin-top: 5px;
                z-index: 2;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .temp-hp.active {
                opacity: 1;
            }
            
            /* HP Controls */
            .hp-controls {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 15px;
                margin-bottom: 15px;
                width: 100%;
                max-width: 600px;
            }
            
            .hp-control-group {
                flex: 1;
                min-width: 150px;
                background: rgba(0, 0, 0, 0.1);
                padding: 10px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .hp-control-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                text-align: center;
                color: var(--text-primary, #ffffff);
            }
            
            .hp-input-with-buttons {
                display: flex;
                align-items: center;
            }
            
            .hp-input {
                flex: 1;
                text-align: center;
                font-weight: bold;
                border-radius: 4px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .hp-btn {
                width: 30px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 4px;
                border: none;
                background: var(--primary, #7289da);
                color: white;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            
            .hp-btn:hover {
                background: var(--primary-dark, #5e77cc);
            }
            
            .hp-decrease {
                margin-right: 5px;
            }
            
            .hp-increase {
                margin-left: 5px;
            }
            
            /* Hit Dice Section */
            .hit-dice-container {
                background: rgba(0, 0, 0, 0.15);
                padding: 12px 20px;
                border-radius: 10px;
                width: 100%;
                max-width: 300px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .hit-dice-container label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: var(--text-primary, #ffffff);
            }
            
            .hit-dice-display {
                font-size: 20px;
                font-weight: bold;
                color: var(--text-primary, #ffffff);
                margin-bottom: 10px;
            }
            
            .hit-dice-controls {
                display: flex;
                justify-content: center;
                gap: 10px;
            }
            
            .hit-dice-btn {
                padding: 5px 15px;
                border-radius: 4px;
                border: none;
                background: var(--primary, #7289da);
                color: white;
                cursor: pointer;
                transition: background-color 0.2s ease;
                font-size: 14px;
            }
            
            .hit-dice-btn:hover {
                background: var(--primary-dark, #5e77cc);
            }
        `;
        document.head.appendChild(style);
        
        // Add HP update function to keep the egg display synced
        const updateHPEgg = function() {
            // Get HP values
            const currentHPInput = document.getElementById('currentHP');
            const maxHPInput = document.getElementById('maxHP');
            const tempHPInput = document.getElementById('tempHP');
            
            if (!currentHPInput || !maxHPInput || !tempHPInput) return;
            
            const currentHP = parseInt(currentHPInput.value) || 0;
            const maxHP = parseInt(maxHPInput.value) || 1;
            const tempHP = parseInt(tempHPInput.value) || 0;
            
            // Calculate percentage for the conic gradient
            const hpPercent = Math.min(100, Math.max(0, (currentHP / maxHP) * 100));
            
            // Update the egg/shield display
            const hpShield = document.querySelector('.hp-shield');
            const currentHpDisplay = document.getElementById('currentHpDisplay');
            const maxHpDisplay = document.getElementById('maxHpDisplay');
            const tempHpDisplay = document.getElementById('tempHpDisplay');
            
            if (hpShield && currentHpDisplay && maxHpDisplay && tempHpDisplay) {
                // Update text content
                currentHpDisplay.textContent = currentHP;
                maxHpDisplay.textContent = `/ ${maxHP}`;
                
                // Update temp HP display
                if (tempHP > 0) {
                    tempHpDisplay.textContent = `+${tempHP}`;
                    tempHpDisplay.classList.add('active');
                } else {
                    tempHpDisplay.textContent = '';
                    tempHpDisplay.classList.remove('active');
                }
                
                // Update color based on HP percentage
                let hpColor;
                if (hpPercent <= 25) {
                    hpColor = '#e74c3c'; // Red for low HP
                } else if (hpPercent <= 50) {
                    hpColor = '#f39c12'; // Orange/Yellow for medium HP
                } else {
                    hpColor = '#2ecc71'; // Green for good HP
                }
                
                // Apply the percent and color to the conic gradient
                hpShield.style.setProperty('--hp-percent', `${hpPercent}%`);
                hpShield.style.setProperty('--hp-color', hpColor);
            }
        };
        
        // Add listeners to update the HP display
        const hpInputs = ['currentHP', 'maxHP', 'tempHP'];
        hpInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', updateHPEgg);
                input.addEventListener('change', updateHPEgg);
            }
        });
        
        // Add event listeners to HP buttons
        const hpButtons = {
            'hpDecreaseBtn': function() {
                const input = document.getElementById('currentHP');
                if (input) {
                    input.value = Math.max(0, (parseInt(input.value) || 0) - 1);
                    input.dispatchEvent(new Event('change'));
                }
            },
            'hpIncreaseBtn': function() {
                const input = document.getElementById('currentHP');
                const maxInput = document.getElementById('maxHP');
                if (input && maxInput) {
                    const max = parseInt(maxInput.value) || 0;
                    input.value = Math.min(max, (parseInt(input.value) || 0) + 1);
                    input.dispatchEvent(new Event('change'));
                }
            },
            'maxHpDecreaseBtn': function() {
                const input = document.getElementById('maxHP');
                const currentInput = document.getElementById('currentHP');
                if (input && currentInput) {
                    const newMax = Math.max(1, (parseInt(input.value) || 0) - 1);
                    input.value = newMax;
                    // Ensure current HP doesn't exceed new max
                    if (parseInt(currentInput.value) > newMax) {
                        currentInput.value = newMax;
                        currentInput.dispatchEvent(new Event('change'));
                    }
                    input.dispatchEvent(new Event('change'));
                }
            },
            'maxHpIncreaseBtn': function() {
                const input = document.getElementById('maxHP');
                if (input) {
                    input.value = Math.max(1, (parseInt(input.value) || 0) + 1);
                    input.dispatchEvent(new Event('change'));
                }
            },
            'tempHpDecreaseBtn': function() {
                const input = document.getElementById('tempHP');
                if (input) {
                    input.value = Math.max(0, (parseInt(input.value) || 0) - 1);
                    input.dispatchEvent(new Event('change'));
                }
            },
            'tempHpIncreaseBtn': function() {
                const input = document.getElementById('tempHP');
                if (input) {
                    input.value = (parseInt(input.value) || 0) + 1;
                    input.dispatchEvent(new Event('change'));
                }
            }
        };
        
        // Attach event listeners to buttons
        for (const [id, handler] of Object.entries(hpButtons)) {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
            }
        }
        
        // Initial update
        updateHPEgg();
    }
    
    // Make an element resizable
    function makeResizable(element, side) {
        if (!element) return;
        
        console.log(`ComprehensiveFix: Making ${element.id} resizable from ${side} side`);
        
        const resizer = document.createElement('div');
        resizer.className = 'panel-resizer';
        resizer.style.position = 'absolute';
        resizer.style.top = '0';
        resizer.style.width = '8px';
        resizer.style.height = '100%';
        resizer.style.cursor = side === 'right' ? 'e-resize' : 'w-resize';
        resizer.style.zIndex = '101';
        
        // Set the side of the resizer
        if (side === 'right') {
            resizer.style.right = '0';
        } else {
            resizer.style.left = '0';
        }
        
        // Store original width and position for calculations
        let originalWidth = element.offsetWidth;
        let originalX = 0;
        
        // Get the min and max widths as pixels
        const minWidthPx = 200;
        const maxWidthPx = Math.min(500, window.innerWidth * 0.35);
        
        // Add resizing events
        resizer.addEventListener('mousedown', function(e) {
            e.preventDefault();
            
            // Skip if panel is collapsed
            if (element.classList.contains('sidebar-collapsed')) {
                return;
            }
            
            originalX = e.clientX;
            originalWidth = element.offsetWidth;
            
            document.addEventListener('mousemove', resizePanel);
            document.addEventListener('mouseup', stopResize);
        });
        
        function resizePanel(e) {
            // Calculate the new width based on mouse movement
            let newWidth;
            if (side === 'right') {
                newWidth = originalWidth + (e.clientX - originalX);
            } else {
                newWidth = originalWidth - (e.clientX - originalX);
            }
            
            // Enforce min and max widths
            newWidth = Math.max(minWidthPx, Math.min(maxWidthPx, newWidth));
            
            // Set the new width
            element.style.width = `${newWidth}px`;
            
            // Save the width in localStorage for persistence
            localStorage.setItem(`${element.id}_width`, newWidth);
        }
        
        function stopResize() {
            document.removeEventListener('mousemove', resizePanel);
            document.removeEventListener('mouseup', stopResize);
        }
        
        // Apply saved width if available and not collapsed
        if (!element.classList.contains('sidebar-collapsed')) {
            const savedWidth = localStorage.getItem(`${element.id}_width`);
            if (savedWidth) {
                element.style.width = `${savedWidth}px`;
            }
        }
        
        // Make sure the element is positioned relative for the absolute positioning of the resizer
        element.style.position = 'relative';
        
        // Add the resizer to the element
        element.appendChild(resizer);
        
        // Add a custom style for the resizer
        const style = document.createElement('style');
        style.textContent = `
            .panel-resizer {
                background-color: transparent;
                transition: background-color 0.2s;
            }
            .panel-resizer:hover {
                background-color: rgba(100, 100, 100, 0.3);
            }
            .panel-resizer:active {
                background-color: rgba(100, 100, 100, 0.5);
            }
            
            /* Hide resizer when panel is collapsed */
            .sidebar-collapsed .panel-resizer {
                display: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add spells dropdown to dice roller
    function addSpellsDropdown() {
        console.log("ComprehensiveFix: Adding spells dropdown to dice roller");
        
        const diceContainer = document.querySelector('.dice-controls');
        if (!diceContainer) {
            console.error("ComprehensiveFix: Dice controls container not found");
            return;
        }
        
        // Create container for spells dropdown
        const spellsDropdownContainer = document.createElement('div');
        spellsDropdownContainer.className = 'dice-control-group spells-dropdown-container';
        
        // Add label
        const label = document.createElement('label');
        label.textContent = 'Cast Spell';
        spellsDropdownContainer.appendChild(label);
        
        // Create the dropdown
        const spellsDropdown = document.createElement('select');
        spellsDropdown.id = 'spellsDropdown';
        spellsDropdown.className = 'dice-select';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a spell...';
        spellsDropdown.appendChild(defaultOption);
        
        // Populate with spells from character data
        populateSpellsDropdown(spellsDropdown);
        
        // Add event listener to handle spell selection
        spellsDropdown.addEventListener('change', function() {
            if (this.value) {
                try {
                    const selectedSpell = JSON.parse(this.value);
                    setupDiceForSpell(selectedSpell);
                } catch (e) {
                    console.error("ComprehensiveFix: Error parsing selected spell:", e);
                }
            }
        });
        
        spellsDropdownContainer.appendChild(spellsDropdown);
        
        // Insert the dropdown before the roll button
        const rollButton = document.getElementById('rollDiceBtn');
        if (rollButton && rollButton.parentNode) {
            rollButton.parentNode.insertBefore(spellsDropdownContainer, rollButton);
        } else {
            diceContainer.appendChild(spellsDropdownContainer);
        }
        
        // Add an observer to update the spells dropdown when character data changes
        addCharacterDataObserver(spellsDropdown);
    }
    
    // Populate the spells dropdown with character's spells
    function populateSpellsDropdown(dropdown) {
        console.log("ComprehensiveFix: Populating spells dropdown");
        
        // Clear existing options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // Try to get spells from various sources
        let spells = [];
        
        // 1. Try to get from global characterData
        if (window.characterData && Array.isArray(window.characterData.spells_array)) {
            console.log("ComprehensiveFix: Found spells in window.characterData.spells_array");
            spells = window.characterData.spells_array;
        }
        // 2. Try to parse from known_spells field
        else if (window.characterData && window.characterData.known_spells) {
            try {
                if (typeof window.characterData.known_spells === 'string') {
                    // Check if it's a JSON string
                    if (window.characterData.known_spells.trim().startsWith('[')) {
                        spells = JSON.parse(window.characterData.known_spells);
                        console.log("ComprehensiveFix: Parsed JSON spells from known_spells");
                    } else {
                        // Treat as a line-separated list
                        const spellLines = window.characterData.known_spells.split('\n');
                        spells = spellLines.map((line, index) => ({
                            id: index,
                            name: line.trim(),
                            level: 0,
                            description: ''
                        })).filter(spell => spell.name);
                        console.log("ComprehensiveFix: Parsed text spells from known_spells");
                    }
                }
            } catch (e) {
                console.error("ComprehensiveFix: Error parsing known_spells:", e);
            }
        }
        
        // 3. Try to get from hidden input field
        if (spells.length === 0) {
            const knownSpellsInput = document.getElementById('knownSpells');
            if (knownSpellsInput && knownSpellsInput.value) {
                try {
                    if (knownSpellsInput.value.trim().startsWith('[')) {
                        spells = JSON.parse(knownSpellsInput.value);
                        console.log("ComprehensiveFix: Parsed spells from knownSpells input field");
                    } else {
                        const spellLines = knownSpellsInput.value.split('\n');
                        spells = spellLines.map((line, index) => ({
                            id: index,
                            name: line.trim(),
                            level: 0,
                            description: ''
                        })).filter(spell => spell.name);
                        console.log("ComprehensiveFix: Parsed text spells from knownSpells input field");
                    }
                } catch (e) {
                    console.error("ComprehensiveFix: Error parsing spells from input:", e);
                }
            }
        }
        
        // 4. Try to get from the DOM (spellList container)
        if (spells.length === 0) {
            const spellElements = document.querySelectorAll('.spell-card, .spell-item');
            if (spellElements.length > 0) {
                console.log("ComprehensiveFix: Extracting spells from DOM elements");
                spells = Array.from(spellElements).map((element, index) => {
                    const nameElement = element.querySelector('.spell-name') || 
                                       element.querySelector('.spell-card-title') || 
                                       element.querySelector('.spell-item-name');
                    const levelElement = element.querySelector('.spell-level') || 
                                        element.querySelector('.spell-card-subtitle') || 
                                        element.closest('.spell-level-header');
                    
                    return {
                        id: index,
                        name: nameElement ? nameElement.textContent.trim() : `Spell ${index + 1}`,
                        level: levelElement && /\d+/.test(levelElement.textContent) ? 
                               parseInt(levelElement.textContent.match(/\d+/)[0]) : 
                               (levelElement && levelElement.textContent.toLowerCase().includes('cantrip') ? 0 : 1),
                        description: element.textContent.trim()
                    };
                });
            }
        }
        
        console.log(`ComprehensiveFix: Found ${spells.length} spells to add to dropdown`);
        
        // Add spells to dropdown
        if (spells.length > 0) {
            // First group by level
            const spellsByLevel = {};
            spells.forEach(spell => {
                const level = typeof spell === 'object' ? (spell.level || 0) : 0;
                if (!spellsByLevel[level]) {
                    spellsByLevel[level] = [];
                }
                spellsByLevel[level].push(spell);
            });
            
            // Add spells by level with optgroups
            Object.keys(spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
                const levelSpells = spellsByLevel[level];
                
                const optgroup = document.createElement('optgroup');
                optgroup.label = level === '0' || level === 0 ? 'Cantrips' : `Level ${level}`;
                
                levelSpells.forEach(spell => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({
                        id: spell.id || Math.random().toString(36).substring(2),
                        name: typeof spell === 'object' ? spell.name : spell,
                        level: typeof spell === 'object' ? (spell.level || 0) : 0
                    });
                    option.textContent = typeof spell === 'object' ? spell.name : spell;
                    optgroup.appendChild(option);
                });
                
                dropdown.appendChild(optgroup);
            });
        } else {
            // Add a disabled option if no spells are found
            const noSpellsOption = document.createElement('option');
            noSpellsOption.disabled = true;
            noSpellsOption.textContent = 'No spells found';
            dropdown.appendChild(noSpellsOption);
        }
    }
    
    // Setup dice roller based on selected spell
    function setupDiceForSpell(spell) {
        console.log("ComprehensiveFix: Setting up dice for spell:", spell);
        
        const numDiceSelect = document.getElementById('numDice');
        const diceTypeSelect = document.getElementById('diceType');
        const diceModifierSelect = document.getElementById('diceModifier');
        const rollDescriptionInput = document.getElementById('rollDescription');
        
        if (!numDiceSelect || !diceTypeSelect || !diceModifierSelect || !rollDescriptionInput) {
            console.error("ComprehensiveFix: Dice control elements not found");
            return;
        }
        
        // Set default values
        numDiceSelect.value = '1';
        diceTypeSelect.value = 'd20';
        diceModifierSelect.value = '0';
        
        // Try to parse spell level from the spell object
        const spellLevel = parseInt(spell.level) || 0;
        
        // Set dice based on spell level
        if (spellLevel === 0) {
            // Cantrips typically use d4 or d8
            numDiceSelect.value = '1';
            diceTypeSelect.value = 'd8';
        } else if (spellLevel <= 3) {
            // Lower level spells often use 2d8, 3d6, etc.
            numDiceSelect.value = spellLevel.toString();
            diceTypeSelect.value = 'd8';
        } else {
            // Higher level spells often use 6d6, 8d8, etc.
            numDiceSelect.value = Math.min(10, spellLevel * 2).toString();
            diceTypeSelect.value = 'd6';
        }
        
        // For attack spells, add spell attack bonus
        const spellAttackInput = document.getElementById('spellAttack');
        if (spellAttackInput) {
            const attackBonus = parseInt(spellAttackInput.value) || 0;
            if (attackBonus !== 0) {
                // Find closest value in the modifier dropdown
                const availableModifiers = Array.from(diceModifierSelect.options).map(opt => parseInt(opt.value));
                const closestModifier = availableModifiers.reduce((prev, curr) => 
                    Math.abs(curr - attackBonus) < Math.abs(prev - attackBonus) ? curr : prev
                );
                diceModifierSelect.value = closestModifier.toString();
            }
        }
        
        // Set the description to the spell name
        rollDescriptionInput.value = `Cast ${spell.name}`;
    }
    
    // Add observer to update spells dropdown when character data changes
    function addCharacterDataObserver(dropdown) {
        // Watch for changes to the spell list
        const spellList = document.getElementById('spellList');
        const knownSpellsInput = document.getElementById('knownSpells');
        
        if (spellList) {
            // Create a mutation observer to watch for changes to the spell list
            const observer = new MutationObserver(function(mutations) {
                populateSpellsDropdown(dropdown);
            });
            
            observer.observe(spellList, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
        
        if (knownSpellsInput) {
            // Watch for changes to the input field
            knownSpellsInput.addEventListener('change', function() {
                populateSpellsDropdown(dropdown);
            });
        }
        
        // Refresh every 30 seconds as a fallback
        setInterval(function() {
            populateSpellsDropdown(dropdown);
        }, 30000);
    }
    
    // Make sure spell rendering works
    function ensureSpellRendering() {
        // Only add fallback if the original function is missing
        if (typeof window.renderSpells !== 'function') {
            console.log("ComprehensiveFix: Adding fallback renderSpells function");
            
            window.renderSpells = function() {
                console.log("ComprehensiveFix: Fallback renderSpells called");
                
                // Get required elements
                const spellList = document.getElementById('spellList');
                const emptySpellList = document.getElementById('emptySpellList');
                
                // Make sure we have spell data
                if (!window.characterData || !Array.isArray(window.characterData.spells_array)) {
                    console.error("ComprehensiveFix: No valid spells array found");
                    return false;
                }
                
                // If UI elements are missing, we can't render
                if (!spellList) {
                    console.error("ComprehensiveFix: Spell list container not found");
                    return false;
                }
                
                // Clear existing content
                spellList.innerHTML = '';
                
                // Show or hide empty message
                if (emptySpellList) {
                    if (window.characterData.spells_array.length === 0) {
                        emptySpellList.style.display = 'flex';
                    } else {
                        emptySpellList.style.display = 'none';
                    }
                }
                
                // Render each spell
                window.characterData.spells_array.forEach((spell, index) => {
                    const card = createImprovedSpellItem(spell, index);
                    spellList.appendChild(card);
                });
                
                return true;
            };
        }
    }
    
    // Add CSS for roll history items to make them more visually appealing
    function addRollHistoryStyles() {
        console.log("ComprehensiveFix: Adding custom roll history styles");
        
        const style = document.createElement('style');
        style.textContent = `
            .roll-history-item {
                background-color: var(--bg-secondary, #36393f);
                border-radius: 8px;
                margin-bottom: 8px;
                padding: 8px;
                border-left: 3px solid var(--primary, #7289da);
                transition: transform 0.2s ease;
            }
            
            .roll-history-item:hover {
                transform: translateX(2px);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .roll-history-title {
                font-weight: bold;
                color: var(--text-primary, #ffffff);
                margin-bottom: 2px;
            }
            
            .roll-history-result {
                font-size: 1.2em;
                font-weight: bold;
                color: var(--primary, #7289da);
            }
            
            .roll-history-formula {
                font-size: 0.9em;
                color: var(--text-secondary, #b9bbbe);
            }
            
            .roll-history-details {
                font-size: 0.8em;
                color: var(--text-tertiary, #8e9297);
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show an indicator that fixes are active
    function showFixesActiveIndicator() {
        const indicator = document.createElement('div');
        indicator.style.position = 'fixed';
        indicator.style.bottom = '10px';
        indicator.style.right = '10px';
        indicator.style.backgroundColor = 'rgba(46, 204, 113, 0.8)';
        indicator.style.color = 'white';
        indicator.style.padding = '5px 10px';
        indicator.style.borderRadius = '3px';
        indicator.style.fontSize = '12px';
        indicator.style.fontWeight = 'bold';
        indicator.style.zIndex = '999';
        indicator.textContent = '✓ Enhanced UI Active';
        
        // Add animation to make it subtle
        indicator.style.transition = 'opacity 0.5s ease-in-out';
        document.body.appendChild(indicator);
        
        // Fade out after a moment
        setTimeout(() => {
            indicator.style.opacity = '0.7';
        }, 1000);
        
        // Remove after 5 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 500);
        }, 5000);
    }
    
    // Helper to create a save indicator
    function createSaveIndicator(message) {
        const indicator = document.createElement('div');
        indicator.style.position = 'fixed';
        indicator.style.top = '10px';
        indicator.style.left = '50%';
        indicator.style.transform = 'translateX(-50%)';
        indicator.style.backgroundColor = '#3498db';
        indicator.style.color = 'white';
        indicator.style.padding = '10px 20px';
        indicator.style.borderRadius = '4px';
        indicator.style.fontSize = '16px';
        indicator.style.fontWeight = 'bold';
        indicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        indicator.style.zIndex = '10000';
        indicator.textContent = message;
        document.body.appendChild(indicator);
        return indicator;
    }
    
    // Helper to update the save indicator
    function updateSaveIndicator(indicator, message, type) {
        if (type === 'success') {
            indicator.style.backgroundColor = '#2ecc71';
        } else if (type === 'error') {
            indicator.style.backgroundColor = '#e74c3c';
        } else if (type === 'warning') {
            indicator.style.backgroundColor = '#f39c12';
        }
        
        indicator.textContent = message;
        
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transition = 'opacity 0.5s ease-in-out';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 500);
        }, 3000);
    }
    
    // Collect all character data from the form
    function collectCharacterData() {
        const urlParams = new URLSearchParams(window.location.search);
        const characterId = urlParams.get('id');
        
        if (!characterId) {
            throw new Error('No character ID found in URL');
        }
        
        // Initialize character data object
        const characterData = {
            id: characterId
        };
        
        // Get all form fields
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
        
        // Add each field to character data
        formFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                characterData[field.key] = element.value || '';
            }
        });
        
        // Get spell data from memory
        if (window.characterData && Array.isArray(window.characterData.spells_array)) {
            characterData.spells_array = window.characterData.spells_array;
            characterData.spells_array_json = JSON.stringify(window.characterData.spells_array);
        } else {
            characterData.spells_array = [];
            characterData.spells_array_json = '[]';
        }
        
        // Get spell slots from memory if available
        if (window.characterData && window.characterData.spell_slots_object) {
            characterData.spell_slots_object = window.characterData.spell_slots_object;
            characterData.spell_slots_json = JSON.stringify(window.characterData.spell_slots_object);
        } else {
            characterData.spell_slots_object = {};
            characterData.spell_slots_json = '{}';
        }
        
        // Get notes from memory if available
        if (window.characterData && window.characterData.notes_array) {
            characterData.notes_array = window.characterData.notes_array;
            characterData.notes = JSON.stringify(window.characterData.notes_array);
        } else {
            characterData.notes_array = [];
            characterData.notes = '[]';
        }
        
        return characterData;
    }
    
    // Save the complete character using our reliable method
    async function saveCompleteCharacter(characterData) {
        console.log("ComprehensiveFix: Saving complete character data:", characterData);
        
        try {
            // First, save the spells separately to ensure they're stored
            await saveSpellsOnly(characterData.id, characterData.spells_array_json);
            console.log("ComprehensiveFix: Spells saved successfully");
            
            // Create FormData for the main character save
            const formData = new FormData();
            formData.append('id', characterData.id);
            
            // Use our simplified direct API for basic character data
            const basicFields = [
                'name', 'race', 'class', 'level', 'armor_class', 
                'hit_points', 'max_hit_points'
            ];
            
            // Add basic fields to form data
            basicFields.forEach(field => {
                if (characterData[field] !== undefined) {
                    formData.append(field, characterData[field]);
                }
            });
            
            // First try our simplified direct API
            const directResponse = await fetch(`api/character_direct.php`, {
                method: 'POST',
                body: formData
            });
            
            const directResult = await directResponse.json();
            console.log("ComprehensiveFix: Direct API result:", directResult);
            
            if (directResult.success) {
                return directResult;
            }
            
            // If the direct API fails, try the original API as fallback
            console.log("ComprehensiveFix: Direct API failed, trying original API");
            
            // Create new FormData for the complete save
            const fullFormData = new FormData();
            fullFormData.append('action', 'save_character');
            fullFormData.append('id', characterData.id);
            
            // Define all fields to send
            const apiFields = [
                'name', 'race', 'class', 'level', 'armor_class', 
                'hit_points', 'max_hit_points', 'temp_hit_points',
                'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
                'gold', 'silver', 'copper', 'spell_save_dc', 'spell_attack_bonus',
                'spell_slots_json', 'spells_array_json', 'known_spells', 
                'weapons', 'gear', 'background', 'notes'
            ];
            
            // Add only the expected fields
            apiFields.forEach(field => {
                if (characterData[field] !== undefined) {
                    // Ensure values are strings
                    let value = characterData[field];
                    if (typeof value !== 'string') {
                        value = String(value);
                    }
                    fullFormData.append(field, value);
                }
            });
            
            // Try the original API
            const response = await fetch(`api/character_safe.php?id=${characterData.id}`, {
                method: 'POST',
                body: fullFormData
            });
            
            const result = await response.json();
            console.log("ComprehensiveFix: Original API result:", result);
            
            // If original API succeeded, return its result
            if (result.success) {
                return result;
            }
            
            // If both APIs failed but spells were saved, return partial success
            return {
                success: true,
                message: 'Spells saved successfully, but other character data may be incomplete',
                partial: true
            };
        } catch (error) {
            console.error("ComprehensiveFix: Error in saveCompleteCharacter:", error);
            throw error;
        }
    }
    
    // Save just the spells using our dedicated endpoint
    async function saveSpellsOnly(characterId, spellsJson) {
        console.log("ComprehensiveFix: Saving spells only");
        
        const formData = new FormData();
        formData.append('id', characterId);
        formData.append('spells_array_json', spellsJson);
        
        const response = await fetch('api/save_spells.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error('Failed to save spells: ' + (result.message || 'Unknown error'));
        }
        
        return result;
    }
    
    // Add the roll history styles
    addRollHistoryStyles();
    
    // Add a direct emergency fix for spell tooltips
    setTimeout(() => {
        // Add emergency tooltip fix styles
        const emergencyStyleFix = document.createElement('style');
        emergencyStyleFix.id = 'emergency-tooltip-fix';
        emergencyStyleFix.textContent = `
            .spell-item {
                position: relative !important;
                overflow: visible !important;
            }
            
            .spell-detail-tooltip {
                background-color: #2f3136 !important;
                color: white !important;
                border: 2px solid #7289da !important;
                padding: 15px !important;
                width: 350px !important;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4) !important;
                z-index: 9999 !important;
                position: absolute !important;
                left: 105% !important;
                top: 0 !important;
            }
            
            .spell-item:hover .spell-detail-tooltip {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Direct display method - double insurance */
            [data-display-spell-details="true"] .spell-detail-tooltip {
                position: static !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 100% !important;
                margin-top: 10px !important;
                margin-bottom: 20px !important;
            }
        `;
        document.head.appendChild(emergencyStyleFix);
        
        // Add a backup direct access button
        const spellList = document.getElementById('spellList');
        if (spellList) {
            const directAccessBtn = document.createElement('button');
            directAccessBtn.className = 'btn-primary';
            directAccessBtn.style.marginBottom = '20px';
            directAccessBtn.style.display = 'block';
            directAccessBtn.style.width = '100%';
            directAccessBtn.innerHTML = '<i class="fas fa-eye"></i> Force Show All Spell Details';
            directAccessBtn.title = 'Click this if spell details aren\'t showing on hover';
            
            directAccessBtn.addEventListener('click', function() {
                const spellList = document.getElementById('spellList');
                if (spellList.dataset.displaySpellDetails === 'true') {
                    spellList.dataset.displaySpellDetails = 'false';
                    this.innerHTML = '<i class="fas fa-eye"></i> Force Show All Spell Details';
                } else {
                    spellList.dataset.displaySpellDetails = 'true';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i> Hide All Spell Details';
                }
            });
            
            spellList.parentNode.insertBefore(directAccessBtn, spellList);
        }
    }, 3000);
    
    console.log("ComprehensiveFix: Initialization complete");
});