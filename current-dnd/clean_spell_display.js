// Clean implementation of expandable spell details
document.addEventListener('DOMContentLoaded', function() {
    console.log("CleanSpellDisplay: Initializing expandable spell display");
    
    // Wait for everything to load
    setTimeout(function() {
        // Add styles for expandable spell display
        const expandableSpellStyles = document.createElement('style');
        expandableSpellStyles.textContent = `
            /* Spell container styling */
            .spell-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 10px;
            }
            
            /* Level headers */
            .spell-level-header {
                background: #2f3136;
                border-radius: 5px;
                padding: 12px 15px;
                font-weight: bold;
                color: #7289da;
                margin-top: 25px;
                margin-bottom: 15px;
                border-left: 4px solid #7289da;
                font-size: 18px;
            }
            
            /* Expandable spell items */
            .expandable-spell {
                background: #36393f;
                border-radius: 8px;
                margin-bottom: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                overflow: hidden;
                transition: box-shadow 0.2s ease;
            }
            
            .expandable-spell:hover {
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            /* Spell header (always visible) */
            .spell-header {
                padding: 12px 15px;
                background: #2f3136;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .spell-title {
                font-weight: bold;
                font-size: 18px;
                color: #ffffff;
            }
            
            .spell-subtitle {
                font-size: 14px;
                color: #b9bbbe;
                margin-top: 4px;
            }
            
            .spell-chevron {
                transition: transform 0.3s ease;
            }
            
            /* Spell content (expandable) */
            .spell-content {
                padding: 0;
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease, padding 0.3s ease;
            }
            
            .expandable-spell.expanded .spell-content {
                padding: 15px;
                max-height: 1000px;
            }
            
            .expandable-spell.expanded .spell-chevron {
                transform: rotate(180deg);
            }
            
            /* Spell details */
            .spell-property {
                margin-bottom: 10px;
            }
            
            .property-label {
                font-weight: bold;
                color: #b9bbbe;
            }
            
            .spell-description {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                line-height: 1.4;
            }
            
            /* Spell tags */
            .spell-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-bottom: 10px;
            }
            
            .spell-tag {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 2px 8px;
                font-size: 12px;
            }
            
            .spell-tag.ritual {
                background: rgba(75, 0, 130, 0.3);
                color: #e6e6fa;
            }
            
            .spell-tag.concentration {
                background: rgba(139, 0, 0, 0.3);
                color: #ffcccb;
            }
            
            .spell-tag.prepared {
                background: rgba(0, 128, 0, 0.3);
                color: #ccffcc;
            }
            
            /* Spell actions */
            .spell-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .spell-btn {
                background: #2f3136;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                font-size: 14px;
                color: #ffffff;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .spell-btn:hover {
                background: #7289da;
            }
            
            /* Global controls */
            .expand-all-btn {
                display: block;
                width: 100%;
                background: #7289da;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 10px;
                margin-bottom: 20px;
                cursor: pointer;
                font-weight: bold;
                transition: background 0.2s;
            }
            
            .expand-all-btn:hover {
                background: #5e77cc;
            }
            
            /* Empty state */
            .no-spells-message {
                padding: 20px;
                text-align: center;
                color: #b9bbbe;
                font-style: italic;
            }
        `;
        document.head.appendChild(expandableSpellStyles);
        
        // Check if window.characterData exists and has spells
        function hasSpells() {
            return window.characterData && 
                   Array.isArray(window.characterData.spells_array) && 
                   window.characterData.spells_array.length > 0;
        }
        
        // Get spells grouped by level
        function getGroupedSpells() {
            if (!hasSpells()) return {};
            
            const spellsByLevel = {};
            window.characterData.spells_array.forEach(spell => {
                const level = spell.level === 'cantrip' ? 0 : parseInt(spell.level) || 0;
                if (!spellsByLevel[level]) {
                    spellsByLevel[level] = [];
                }
                spellsByLevel[level].push(spell);
            });
            
            return spellsByLevel;
        }
        
        // Create a spell element
        function createSpellElement(spell, index) {
            const levelText = spell.level === 'cantrip' || spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
            const schoolText = spell.school ? spell.school.charAt(0).toUpperCase() + spell.school.slice(1) : 'Unknown';
            
            const spellItem = document.createElement('div');
            spellItem.className = 'expandable-spell';
            spellItem.dataset.index = index;
            
            // Header section (always visible)
            const header = document.createElement('div');
            header.className = 'spell-header';
            
            const titleArea = document.createElement('div');
            titleArea.innerHTML = `
                <div class="spell-title">${spell.name}</div>
                <div class="spell-subtitle">${levelText} • ${schoolText}</div>
            `;
            
            const chevron = document.createElement('div');
            chevron.className = 'spell-chevron';
            chevron.innerHTML = '<i class="fas fa-chevron-down"></i>';
            
            header.appendChild(titleArea);
            header.appendChild(chevron);
            
            // Content section (expandable)
            const content = document.createElement('div');
            content.className = 'spell-content';
            
            // Basic properties
            const properties = document.createElement('div');
            properties.className = 'spell-properties';
            
            const basicProps = [
                { label: 'Casting Time', value: spell.casting_time || 'N/A' },
                { label: 'Range', value: spell.range || 'N/A' },
                { label: 'Duration', value: spell.duration || 'N/A' },
                { label: 'Components', value: spell.components || 'N/A' }
            ];
            
            basicProps.forEach(prop => {
                const propDiv = document.createElement('div');
                propDiv.className = 'spell-property';
                propDiv.innerHTML = `<span class="property-label">${prop.label}:</span> ${prop.value}`;
                properties.appendChild(propDiv);
            });
            
            // Tags
            const tags = document.createElement('div');
            tags.className = 'spell-tags';
            
            if (spell.ritual) {
                const tag = document.createElement('span');
                tag.className = 'spell-tag ritual';
                tag.textContent = 'Ritual';
                tags.appendChild(tag);
            }
            
            if (spell.concentration) {
                const tag = document.createElement('span');
                tag.className = 'spell-tag concentration';
                tag.textContent = 'Concentration';
                tags.appendChild(tag);
            }
            
            if (spell.prepared) {
                const tag = document.createElement('span');
                tag.className = 'spell-tag prepared';
                tag.textContent = 'Prepared';
                tags.appendChild(tag);
            }
            
            // Description
            const description = document.createElement('div');
            description.className = 'spell-description';
            
            if (spell.description && spell.description.includes('\n')) {
                spell.description.split('\n').filter(p => p.trim()).forEach((paragraph, i) => {
                    if (i > 0) description.appendChild(document.createElement('br'));
                    description.appendChild(document.createTextNode(paragraph));
                });
            } else {
                description.textContent = spell.description || 'No description available.';
            }
            
            // Higher levels section
            if (spell.higher_levels) {
                const higherLevels = document.createElement('div');
                higherLevels.style.marginTop = '10px';
                higherLevels.style.fontStyle = 'italic';
                higherLevels.innerHTML = `<strong>At Higher Levels:</strong> ${spell.higher_levels}`;
                description.appendChild(higherLevels);
            }
            
            // Action buttons
            const actions = document.createElement('div');
            actions.className = 'spell-actions';
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'spell-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editBtn.dataset.index = index;
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Check for standard function first
                if (typeof window.openSpellEditor === 'function') {
                    window.openSpellEditor(spell, index);
                    return;
                }
                
                // Try alternate edit methods
                if (typeof window.editSpell === 'function') {
                    window.editSpell(index);
                    return;
                }
                
                // Find and trigger original edit button as fallback
                const originalEditBtns = document.querySelectorAll('.edit-spell-btn, .edit-spell, button[data-action="edit-spell"]');
                for (const btn of originalEditBtns) {
                    if (btn.dataset.index == index) {
                        btn.click();
                        return;
                    }
                }
                
                // If we couldn't find a way to edit, try to open the spell modal directly
                if (window.$ && typeof window.$.modal === 'function') {
                    const spellModal = document.getElementById('spellEditorModal');
                    if (spellModal) {
                        // Fill in the spell data
                        const nameField = document.getElementById('spellName');
                        const levelField = document.getElementById('spellLevel');
                        const schoolField = document.getElementById('spellSchool');
                        
                        if (nameField) nameField.value = spell.name;
                        if (levelField) levelField.value = spell.level;
                        if (schoolField) schoolField.value = spell.school;
                        
                        // Open the modal
                        window.$(spellModal).modal('show');
                        return;
                    }
                }
                
                // Last resort
                alert(`Edit spell: ${spell.name}\nPlease use the original spell list to edit this spell.`);
            });
            
            // Cast button
            const castBtn = document.createElement('button');
            castBtn.className = 'spell-btn';
            castBtn.innerHTML = '<i class="fas fa-magic"></i> Cast';
            castBtn.dataset.index = index;
            castBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Try to set up dice for casting this spell
                function setupDiceForSpell() {
                    const numDiceSelect = document.getElementById('numDice');
                    const diceTypeSelect = document.getElementById('diceType');
                    const diceModifierSelect = document.getElementById('diceModifier');
                    const rollDescriptionInput = document.getElementById('rollDescription');
                    
                    if (!numDiceSelect || !diceTypeSelect || !diceModifierSelect || !rollDescriptionInput) {
                        return false;
                    }
                    
                    // Set default values
                    numDiceSelect.value = '1';
                    diceTypeSelect.value = 'd20';
                    diceModifierSelect.value = '0';
                    
                    // Get spell level
                    const spellLevel = spell.level === 'cantrip' ? 0 : parseInt(spell.level) || 0;
                    
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
                    
                    // Apply spell attack bonus
                    const spellAttackInput = document.getElementById('spellAttack');
                    if (spellAttackInput) {
                        const attackBonus = parseInt(spellAttackInput.value) || 0;
                        if (attackBonus !== 0) {
                            // Find closest value in the modifier dropdown
                            if (diceModifierSelect.options.length > 0) {
                                let closestValue = 0;
                                let minDiff = 1000;
                                
                                for (let i = 0; i < diceModifierSelect.options.length; i++) {
                                    const optionValue = parseInt(diceModifierSelect.options[i].value) || 0;
                                    const diff = Math.abs(optionValue - attackBonus);
                                    
                                    if (diff < minDiff) {
                                        minDiff = diff;
                                        closestValue = optionValue;
                                    }
                                }
                                
                                diceModifierSelect.value = closestValue.toString();
                            }
                        }
                    }
                    
                    // Set description
                    rollDescriptionInput.value = `Cast ${spell.name}`;
                    
                    return true;
                }
                
                // First try official method
                if (typeof window.castSpell === 'function') {
                    window.castSpell(spell);
                    return;
                }
                
                // Try alternate methods
                if (typeof window.rollSpell === 'function') {
                    window.rollSpell(index);
                    return;
                }
                
                // Find and trigger original cast button
                const originalCastBtns = document.querySelectorAll('.cast-spell-btn, .cast-spell, button[data-action="cast-spell"]');
                for (const btn of originalCastBtns) {
                    if (btn.dataset.index == index) {
                        btn.click();
                        return;
                    }
                }
                
                // Try to set up the dice roller directly
                if (setupDiceForSpell()) {
                    // Try to click the roll button
                    const rollBtn = document.getElementById('rollDiceBtn');
                    if (rollBtn) {
                        rollBtn.click();
                        return;
                    }
                }
                
                // Last resort: Show alert with spell details for manual rolling
                let message = `Cast spell: ${spell.name}`;
                if (spell.damage) message += `\nDamage: ${spell.damage}`;
                if (spell.save_dc) message += `\nSave DC: ${spell.save_dc}`;
                alert(message);
            });
            
            // Prepare button
            const prepareBtn = document.createElement('button');
            prepareBtn.className = 'spell-btn';
            prepareBtn.innerHTML = `<i class="fas fa-book"></i> ${spell.prepared ? 'Unprepare' : 'Prepare'}`;
            prepareBtn.dataset.index = index;
            prepareBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // First try standard method
                if (typeof window.toggleSpellPrepared === 'function') {
                    window.toggleSpellPrepared(index);
                    return;
                }
                
                // Try alternate methods
                if (typeof window.prepareSpell === 'function') {
                    window.prepareSpell(index);
                    return;
                }
                
                // Find and trigger original prepare button
                const originalPrepareBtns = document.querySelectorAll('.prepare-spell-btn, .prepare-spell, button[data-action="prepare-spell"]');
                for (const btn of originalPrepareBtns) {
                    if (btn.dataset.index == index) {
                        btn.click();
                        return;
                    }
                }
                
                // If all else fails, do it manually
                spell.prepared = !spell.prepared;
                // Update in main array
                if (window.characterData && Array.isArray(window.characterData.spells_array)) {
                    const globalIndex = window.characterData.spells_array.indexOf(spell);
                    if (globalIndex !== -1) {
                        window.characterData.spells_array[globalIndex].prepared = spell.prepared;
                    }
                }
                renderExpandableSpells();
                
                // Try to trigger a save
                const saveBtn = document.getElementById('saveCharacterBtn');
                if (saveBtn) {
                    // Don't auto-save, just notify user
                    alert(`Spell ${spell.prepared ? 'prepared' : 'unprepared'}. Remember to save your character!`);
                }
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'spell-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.dataset.index = index;
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Confirm deletion
                if (!confirm(`Are you sure you want to delete "${spell.name}"?`)) {
                    return;
                }
                
                // Try standard method - direct array modification
                if (window.characterData && Array.isArray(window.characterData.spells_array)) {
                    const globalIndex = window.characterData.spells_array.indexOf(spell);
                    if (globalIndex !== -1) {
                        window.characterData.spells_array.splice(globalIndex, 1);
                        renderExpandableSpells();
                        
                        // Try to trigger a save or notify
                        const saveBtn = document.getElementById('saveCharacterBtn');
                        if (saveBtn) {
                            // Don't auto-save, just notify user
                            alert(`Spell deleted. Remember to save your character!`);
                        }
                        return;
                    }
                }
                
                // Try alternate methods
                if (typeof window.deleteSpell === 'function') {
                    window.deleteSpell(index);
                    return;
                }
                
                // Find and trigger original delete button
                const originalDeleteBtns = document.querySelectorAll('.delete-spell-btn, .delete-spell, button[data-action="delete-spell"]');
                for (const btn of originalDeleteBtns) {
                    if (btn.dataset.index == index) {
                        btn.click();
                        return;
                    }
                }
                
                // Last resort
                alert(`Cannot delete spell: ${spell.name}. Please use the original spell list to delete this spell.`);
            });
            
            // Add buttons
            actions.appendChild(editBtn);
            actions.appendChild(castBtn);
            actions.appendChild(prepareBtn);
            actions.appendChild(deleteBtn);
            
            // Assemble content
            content.appendChild(properties);
            if (tags.children.length > 0) {
                content.appendChild(tags);
            }
            content.appendChild(description);
            content.appendChild(actions);
            
            // Toggle expansion on header click
            header.addEventListener('click', function() {
                spellItem.classList.toggle('expanded');
            });
            
            // Assemble spell item
            spellItem.appendChild(header);
            spellItem.appendChild(content);
            
            return spellItem;
        }
        
        // Main render function
        function renderExpandableSpells() {
            const spellList = document.getElementById('spellList');
            if (!spellList) return;
            
            // Clear existing content
            spellList.innerHTML = '';
            
            // Add expand all button
            const expandAllBtn = document.createElement('button');
            expandAllBtn.className = 'expand-all-btn';
            expandAllBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i> Expand All Spells';
            expandAllBtn.addEventListener('click', function() {
                const isExpanding = this.innerHTML.includes('Expand');
                
                // Update all spell items
                document.querySelectorAll('.expandable-spell').forEach(item => {
                    if (isExpanding) {
                        item.classList.add('expanded');
                    } else {
                        item.classList.remove('expanded');
                    }
                });
                
                // Update button text
                this.innerHTML = isExpanding ? 
                    '<i class="fas fa-compress-arrows-alt"></i> Collapse All Spells' : 
                    '<i class="fas fa-expand-arrows-alt"></i> Expand All Spells';
            });
            spellList.appendChild(expandAllBtn);
            
            // Show message if no spells
            if (!hasSpells()) {
                const noSpells = document.createElement('div');
                noSpells.className = 'no-spells-message';
                noSpells.textContent = 'No spells found. Click "Add Spell" to get started!';
                spellList.appendChild(noSpells);
                return;
            }
            
            // Render spells grouped by level
            const spellsByLevel = getGroupedSpells();
            const sortedLevels = Object.keys(spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b));
            
            sortedLevels.forEach(level => {
                // Create level header
                const levelHeader = document.createElement('div');
                levelHeader.className = 'spell-level-header';
                levelHeader.textContent = level === '0' || level === 0 ? 'Cantrips' : `Level ${level} Spells`;
                spellList.appendChild(levelHeader);
                
                // Create spells for this level
                spellsByLevel[level].forEach((spell, index) => {
                    const globalIndex = window.characterData.spells_array.indexOf(spell);
                    const spellItem = createSpellElement(spell, globalIndex);
                    spellList.appendChild(spellItem);
                });
            });
        }
        
        // Override the original renderSpells function
        const originalRenderSpells = window.renderSpells;
        window.renderSpells = function() {
            // Call original first if it exists (for compatibility)
            if (typeof originalRenderSpells === 'function') {
                try {
                    originalRenderSpells.apply(this, arguments);
                } catch (e) {
                    console.error("Error in original renderSpells:", e);
                }
            }
            
            // Then render our expandable version
            renderExpandableSpells();
            return true;
        };
        
        // Initial render
        setTimeout(renderExpandableSpells, 1000);
        
        console.log("CleanSpellDisplay: Expandable spell display initialized");
    }, 2000);
});