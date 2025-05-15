// Complete replacement of spell display with inline details
document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for other scripts to load
    setTimeout(function() {
        console.log("InlineSpellDetails: Applying inline spell details");
        
        // First, add a style for our new display
        const inlineStyle = document.createElement('style');
        inlineStyle.textContent = `
            .inline-spell-item {
                background: #36393f;
                border-radius: 8px;
                margin-bottom: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                overflow: hidden;
                transition: box-shadow 0.2s ease;
            }
            
            .inline-spell-item:hover {
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .inline-spell-header {
                padding: 12px 15px;
                background: #2f3136;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .inline-spell-name {
                font-weight: bold;
                font-size: 18px;
                color: #ffffff;
            }
            
            .inline-spell-meta {
                font-size: 14px;
                color: #b9bbbe;
            }
            
            .inline-spell-chevron {
                transition: transform 0.3s ease;
            }
            
            .inline-spell-content {
                padding: 0;
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease, padding 0.3s ease;
            }
            
            .inline-spell-item.expanded .inline-spell-content {
                padding: 15px;
                max-height: 1000px;
            }
            
            .inline-spell-item.expanded .inline-spell-chevron {
                transform: rotate(180deg);
            }
            
            .inline-spell-property {
                margin-bottom: 10px;
            }
            
            .inline-spell-property-label {
                font-weight: bold;
                color: #b9bbbe;
            }
            
            .inline-spell-description {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .inline-spell-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-bottom: 10px;
            }
            
            .inline-spell-tag {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 2px 8px;
                font-size: 12px;
            }
            
            .inline-spell-tag.ritual {
                background: rgba(75, 0, 130, 0.3);
                color: #e6e6fa;
            }
            
            .inline-spell-tag.concentration {
                background: rgba(139, 0, 0, 0.3);
                color: #ffcccb;
            }
            
            .inline-spell-tag.prepared {
                background: rgba(0, 128, 0, 0.3);
                color: #ccffcc;
            }
            
            .inline-spell-actions {
                display: flex;
                gap: 10px;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .inline-spell-btn {
                background: #2f3136;
                border: none;
                border-radius: 4px;
                padding: 8px 12px;
                font-size: 14px;
                color: #ffffff;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .inline-spell-btn:hover {
                background: #7289da;
            }
            
            .inline-level-header {
                background: #2f3136;
                border-radius: 5px;
                padding: 8px 15px;
                font-weight: bold;
                color: #7289da;
                margin-top: 25px;
                margin-bottom: 15px;
                border-left: 4px solid #7289da;
                font-size: 18px;
            }
            
            .inline-expand-all-btn {
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
            
            .inline-expand-all-btn:hover {
                background: #5e77cc;
            }
        `;
        document.head.appendChild(inlineStyle);
        
        // Check if window.characterData exists and has spells
        function hasSpells() {
            return window.characterData && 
                   Array.isArray(window.characterData.spells_array) && 
                   window.characterData.spells_array.length > 0;
        }
        
        // Function to get all spells grouped by level
        function getGroupedSpells() {
            if (!hasSpells()) return {};
            
            // Group spells by level
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
        
        // Create spell entry HTML
        function createSpellElement(spell, index) {
            const levelText = spell.level === 'cantrip' || spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`;
            const schoolText = spell.school ? spell.school.charAt(0).toUpperCase() + spell.school.slice(1) : 'Unknown';
            
            const element = document.createElement('div');
            element.className = 'inline-spell-item';
            element.dataset.index = index;
            
            // Create header (always visible)
            const header = document.createElement('div');
            header.className = 'inline-spell-header';
            
            const nameContainer = document.createElement('div');
            nameContainer.innerHTML = `
                <div class="inline-spell-name">${spell.name}</div>
                <div class="inline-spell-meta">${levelText} • ${schoolText}</div>
            `;
            
            const chevron = document.createElement('div');
            chevron.className = 'inline-spell-chevron';
            chevron.innerHTML = '<i class="fas fa-chevron-down"></i>';
            
            header.appendChild(nameContainer);
            header.appendChild(chevron);
            
            // Create collapsible content
            const content = document.createElement('div');
            content.className = 'inline-spell-content';
            
            // Properties grid (casting time, range, etc)
            const properties = document.createElement('div');
            properties.className = 'inline-spell-properties';
            
            // Basic properties
            const basicProps = [
                { label: 'Casting Time', value: spell.casting_time || 'N/A' },
                { label: 'Range', value: spell.range || 'N/A' },
                { label: 'Duration', value: spell.duration || 'N/A' },
                { label: 'Components', value: spell.components || 'N/A' }
            ];
            
            basicProps.forEach(prop => {
                const propDiv = document.createElement('div');
                propDiv.className = 'inline-spell-property';
                propDiv.innerHTML = `<span class="inline-spell-property-label">${prop.label}:</span> ${prop.value}`;
                properties.appendChild(propDiv);
            });
            
            // Tags (ritual, concentration, prepared)
            const tags = document.createElement('div');
            tags.className = 'inline-spell-tags';
            
            if (spell.ritual) {
                const tag = document.createElement('span');
                tag.className = 'inline-spell-tag ritual';
                tag.textContent = 'Ritual';
                tags.appendChild(tag);
            }
            
            if (spell.concentration) {
                const tag = document.createElement('span');
                tag.className = 'inline-spell-tag concentration';
                tag.textContent = 'Concentration';
                tags.appendChild(tag);
            }
            
            if (spell.prepared) {
                const tag = document.createElement('span');
                tag.className = 'inline-spell-tag prepared';
                tag.textContent = 'Prepared';
                tags.appendChild(tag);
            }
            
            // Description
            const description = document.createElement('div');
            description.className = 'inline-spell-description';
            
            // Format with paragraphs if needed
            if (spell.description && spell.description.includes('\n')) {
                const paragraphs = spell.description.split('\n').filter(p => p.trim());
                paragraphs.forEach((paragraph, i) => {
                    if (i > 0) description.appendChild(document.createElement('br'));
                    description.appendChild(document.createTextNode(paragraph));
                });
            } else {
                description.textContent = spell.description || 'No description available.';
            }
            
            // Higher levels
            if (spell.higher_levels) {
                const higherLevels = document.createElement('div');
                higherLevels.className = 'inline-spell-higher-levels';
                higherLevels.innerHTML = `<br><strong>At Higher Levels:</strong> ${spell.higher_levels}`;
                description.appendChild(higherLevels);
            }
            
            // Action buttons
            const actions = document.createElement('div');
            actions.className = 'inline-spell-actions';
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'inline-spell-btn edit-spell';
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editBtn.dataset.index = index;
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof window.openSpellEditor === 'function') {
                    window.openSpellEditor(spell, index);
                } else {
                    console.error("InlineSpellDetails: openSpellEditor function not available");
                    alert(`Cannot edit spell: ${spell.name} - Editor function unavailable`);
                }
            });
            
            // Cast button
            const castBtn = document.createElement('button');
            castBtn.className = 'inline-spell-btn cast-spell';
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
            prepareBtn.className = 'inline-spell-btn prepare-spell';
            prepareBtn.innerHTML = `<i class="fas fa-book"></i> ${spell.prepared ? 'Unprepare' : 'Prepare'}`;
            prepareBtn.dataset.index = index;
            prepareBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof window.toggleSpellPrepared === 'function') {
                    window.toggleSpellPrepared(index);
                } else {
                    // Simple fallback
                    spell.prepared = !spell.prepared;
                    renderInlineSpells();
                }
            });
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'inline-spell-btn delete-spell';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteBtn.dataset.index = index;
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${spell.name}"?`)) {
                    if (window.characterData && Array.isArray(window.characterData.spells_array)) {
                        window.characterData.spells_array.splice(index, 1);
                        renderInlineSpells();
                    }
                }
            });
            
            // Add action buttons
            actions.appendChild(editBtn);
            actions.appendChild(castBtn);
            actions.appendChild(prepareBtn);
            actions.appendChild(deleteBtn);
            
            // Assemble content area
            content.appendChild(properties);
            if (tags.children.length > 0) {
                content.appendChild(tags);
            }
            content.appendChild(description);
            content.appendChild(actions);
            
            // Add click handler to toggle expansion
            header.addEventListener('click', function() {
                element.classList.toggle('expanded');
            });
            
            // Assemble the complete element
            element.appendChild(header);
            element.appendChild(content);
            
            return element;
        }
        
        // Main render function
        function renderInlineSpells() {
            const spellList = document.getElementById('spellList');
            if (!spellList) return;
            
            // Clear existing content
            spellList.innerHTML = '';
            
            // Add "expand all" button
            const expandAllBtn = document.createElement('button');
            expandAllBtn.className = 'inline-expand-all-btn';
            expandAllBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i> Expand All Spells';
            expandAllBtn.addEventListener('click', function() {
                const isExpanding = this.innerHTML.includes('Expand');
                
                // Update all spell items
                document.querySelectorAll('.inline-spell-item').forEach(item => {
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
            
            if (!hasSpells()) {
                const noSpells = document.createElement('div');
                noSpells.style.padding = '20px';
                noSpells.style.textAlign = 'center';
                noSpells.style.color = '#b9bbbe';
                noSpells.innerHTML = 'No spells found. Click "Add Spell" to get started!';
                spellList.appendChild(noSpells);
                return;
            }
            
            // Group spells by level and render them
            const spellsByLevel = getGroupedSpells();
            const sortedLevels = Object.keys(spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b));
            
            sortedLevels.forEach(level => {
                // Create level header
                const levelHeader = document.createElement('div');
                levelHeader.className = 'inline-level-header';
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
            console.log("InlineSpellDetails: Custom renderSpells called");
            
            try {
                // Call original first if it exists
                if (typeof originalRenderSpells === 'function') {
                    try {
                        originalRenderSpells.apply(this, arguments);
                    } catch (e) {
                        console.error("InlineSpellDetails: Error in original renderSpells:", e);
                    }
                }
                
                // Then render our inline version
                renderInlineSpells();
                return true;
            } catch (error) {
                console.error("InlineSpellDetails: Error rendering inline spells:", error);
                return false;
            }
        };
        
        // Initial render
        setTimeout(renderInlineSpells, 1000);
        
        console.log("InlineSpellDetails: Inline spell details applied");
    }, 3000);
});