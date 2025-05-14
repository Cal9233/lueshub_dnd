// Emergency spell rendering function
document.addEventListener('DOMContentLoaded', function() {
    console.log("EmergencyRender: Initializing emergency spell rendering system");
    
    // Create a button to manually render spells
    setTimeout(function() {
        const renderBtn = document.createElement('button');
        renderBtn.id = 'emergencyRenderBtn';
        renderBtn.textContent = '🔵 Show Spells';
        renderBtn.style.position = 'fixed';
        renderBtn.style.bottom = '10px';
        renderBtn.style.left = '180px';
        renderBtn.style.zIndex = '9999';
        renderBtn.style.padding = '8px 12px';
        renderBtn.style.backgroundColor = '#3498db';
        renderBtn.style.color = 'white';
        renderBtn.style.border = 'none';
        renderBtn.style.borderRadius = '4px';
        renderBtn.style.fontWeight = 'bold';
        renderBtn.style.cursor = 'pointer';
        
        renderBtn.addEventListener('click', emergencyRenderSpells);
        document.body.appendChild(renderBtn);
    }, 1500);
    
    // Emergency render function
    function emergencyRenderSpells() {
        if (!window.characterData || !Array.isArray(window.characterData.spells_array)) {
            alert("No spells found. Add a spell first.");
            return;
        }
        
        // Get spell list container
        const existingSpellList = document.getElementById('spellList');
        const emptySpellList = document.getElementById('emptySpellList');
        
        if (existingSpellList) {
            // Create spell cards
            const spells = window.characterData.spells_array;
            
            if (spells.length === 0) {
                alert("No spells found in character data.");
                return;
            }
            
            // Clear existing content
            existingSpellList.innerHTML = '';
            
            // Hide empty message if it exists
            if (emptySpellList) {
                emptySpellList.style.display = 'none';
            }
            
            // Create spell cards
            spells.forEach((spell, index) => {
                const card = createSpellCard(spell, index);
                existingSpellList.appendChild(card);
            });
            
            alert(`Rendered ${spells.length} spells successfully!`);
        } else {
            // Create our own container
            createFloatingSpellList(window.characterData.spells_array);
        }
    }
    
    // Create a floating window with spell list if container doesn't exist
    function createFloatingSpellList(spells) {
        const floatingContainer = document.createElement('div');
        floatingContainer.id = 'floatingSpellList';
        floatingContainer.style.position = 'fixed';
        floatingContainer.style.top = '50%';
        floatingContainer.style.left = '50%';
        floatingContainer.style.transform = 'translate(-50%, -50%)';
        floatingContainer.style.width = '80%';
        floatingContainer.style.maxWidth = '800px';
        floatingContainer.style.maxHeight = '80vh';
        floatingContainer.style.backgroundColor = '#2c3e50';
        floatingContainer.style.color = '#ecf0f1';
        floatingContainer.style.padding = '20px';
        floatingContainer.style.borderRadius = '8px';
        floatingContainer.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
        floatingContainer.style.zIndex = '10000';
        floatingContainer.style.overflowY = 'auto';
        
        // Add header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '15px';
        header.style.paddingBottom = '10px';
        header.style.borderBottom = '1px solid #34495e';
        
        const title = document.createElement('h2');
        title.textContent = 'Your Spells';
        title.style.margin = '0';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = '#ecf0f1';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(floatingContainer);
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        floatingContainer.appendChild(header);
        
        // Add spell count
        const countDiv = document.createElement('div');
        countDiv.textContent = `${spells.length} spells found`;
        countDiv.style.marginBottom = '15px';
        countDiv.style.color = '#bdc3c7';
        floatingContainer.appendChild(countDiv);
        
        // Create a container for the spells
        const spellsContainer = document.createElement('div');
        spellsContainer.style.display = 'grid';
        spellsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
        spellsContainer.style.gap = '15px';
        
        // Add spell cards
        spells.forEach((spell, index) => {
            const card = createFloatingSpellCard(spell, index);
            spellsContainer.appendChild(card);
        });
        
        floatingContainer.appendChild(spellsContainer);
        document.body.appendChild(floatingContainer);
    }
    
    // Create a spell card for the floating display
    function createFloatingSpellCard(spell, index) {
        const card = document.createElement('div');
        card.className = 'floating-spell-card';
        card.style.backgroundColor = '#34495e';
        card.style.borderRadius = '5px';
        card.style.padding = '15px';
        card.style.position = 'relative';
        
        // Level indicator
        const levelBadge = document.createElement('div');
        levelBadge.style.position = 'absolute';
        levelBadge.style.top = '10px';
        levelBadge.style.right = '10px';
        levelBadge.style.backgroundColor = spell.level === 'cantrip' ? '#27ae60' : '#f39c12';
        levelBadge.style.color = 'white';
        levelBadge.style.padding = '3px 8px';
        levelBadge.style.borderRadius = '10px';
        levelBadge.style.fontSize = '12px';
        levelBadge.style.fontWeight = 'bold';
        levelBadge.textContent = spell.level === 'cantrip' ? 'Cantrip' : `Level ${spell.level}`;
        card.appendChild(levelBadge);
        
        // Spell name
        const nameElement = document.createElement('h3');
        nameElement.textContent = spell.name;
        nameElement.style.margin = '0 0 10px 0';
        nameElement.style.paddingRight = '80px'; // Space for the level badge
        card.appendChild(nameElement);
        
        // School and metadata
        const metaDiv = document.createElement('div');
        metaDiv.style.fontSize = '14px';
        metaDiv.style.color = '#bdc3c7';
        metaDiv.style.marginBottom = '10px';
        
        // Format school with capital first letter
        const schoolFormatted = spell.school.charAt(0).toUpperCase() + spell.school.slice(1);
        metaDiv.textContent = `${schoolFormatted}`;
        
        // Add ritual/concentration if applicable
        if (spell.ritual) {
            const ritualSpan = document.createElement('span');
            ritualSpan.textContent = ' • Ritual';
            ritualSpan.style.color = '#9b59b6';
            metaDiv.appendChild(ritualSpan);
        }
        if (spell.concentration) {
            const concSpan = document.createElement('span');
            concSpan.textContent = ' • Concentration';
            concSpan.style.color = '#e74c3c';
            metaDiv.appendChild(concSpan);
        }
        card.appendChild(metaDiv);
        
        // Spell properties
        const propsDiv = document.createElement('div');
        propsDiv.style.display = 'grid';
        propsDiv.style.gridTemplateColumns = 'repeat(2, 1fr)';
        propsDiv.style.gap = '5px';
        propsDiv.style.marginBottom = '10px';
        propsDiv.style.fontSize = '13px';
        
        const properties = [
            { label: 'Casting Time', value: spell.casting_time },
            { label: 'Range', value: spell.range },
            { label: 'Duration', value: spell.duration },
            { label: 'Components', value: spell.components }
        ];
        
        properties.forEach(prop => {
            const propDiv = document.createElement('div');
            
            const propLabel = document.createElement('span');
            propLabel.textContent = `${prop.label}: `;
            propLabel.style.color = '#7f8c8d';
            propDiv.appendChild(propLabel);
            
            const propValue = document.createElement('span');
            propValue.textContent = prop.value;
            propDiv.appendChild(propValue);
            
            propsDiv.appendChild(propDiv);
        });
        card.appendChild(propsDiv);
        
        // Spell description (truncated)
        const descDiv = document.createElement('div');
        descDiv.style.fontSize = '14px';
        descDiv.style.marginBottom = '10px';
        descDiv.style.maxHeight = '80px';
        descDiv.style.overflowY = 'auto';
        descDiv.style.paddingRight = '5px';
        
        // Truncate long descriptions
        const shortDesc = spell.description.length > 150 ? 
            spell.description.substring(0, 150) + '...' : 
            spell.description;
        descDiv.textContent = shortDesc;
        card.appendChild(descDiv);
        
        // View full button for long descriptions
        if (spell.description.length > 150) {
            const viewFullBtn = document.createElement('button');
            viewFullBtn.textContent = 'View Full Description';
            viewFullBtn.style.backgroundColor = '#3498db';
            viewFullBtn.style.color = 'white';
            viewFullBtn.style.border = 'none';
            viewFullBtn.style.padding = '5px 10px';
            viewFullBtn.style.borderRadius = '3px';
            viewFullBtn.style.cursor = 'pointer';
            viewFullBtn.style.marginRight = '5px';
            viewFullBtn.style.fontSize = '12px';
            
            viewFullBtn.addEventListener('click', function() {
                alert(spell.name + '\n\n' + spell.description + 
                      (spell.higher_levels ? '\n\nAt Higher Levels: ' + spell.higher_levels : ''));
            });
            
            card.appendChild(viewFullBtn);
        }
        
        return card;
    }
    
    // Create a spell card for the standard UI
    function createSpellCard(spell, index) {
        const card = document.createElement('div');
        card.className = 'spell-card';
        
        // Level label for display
        const levelLabel = spell.level === 'cantrip' 
            ? 'Cantrip' 
            : `Level ${spell.level}`;
        
        // Format school with capital first letter
        const schoolFormatted = spell.school.charAt(0).toUpperCase() + spell.school.slice(1);
        
        // Card HTML
        card.innerHTML = `
            <div class="spell-card-header">
                <h3 class="spell-card-title">${spell.name}</h3>
                <div class="spell-card-subtitle">
                    <span class="spell-school-tag spell-school-${spell.school}">${schoolFormatted}</span>
                    ${levelLabel}
                </div>
                ${spell.prepared ? '<div class="spell-card-prepared"><i class="fas fa-check"></i></div>' : ''}
            </div>
            <div class="spell-card-body">
                <div class="spell-card-properties">
                    <div class="spell-card-property">
                        <span class="spell-card-property-label">Casting Time:</span> ${spell.casting_time}
                    </div>
                    <div class="spell-card-property">
                        <span class="spell-card-property-label">Range:</span> ${spell.range}
                    </div>
                    <div class="spell-card-property">
                        <span class="spell-card-property-label">Duration:</span> ${spell.duration}
                    </div>
                    <div class="spell-card-property">
                        <span class="spell-card-property-label">Components:</span> ${spell.components}
                    </div>
                </div>
                <div class="spell-card-tags">
                    ${spell.ritual ? '<span class="spell-card-tag ritual">Ritual</span>' : ''}
                    ${spell.concentration ? '<span class="spell-card-tag concentration">Concentration</span>' : ''}
                </div>
                <div class="spell-card-description">${spell.description}</div>
                ${spell.higher_levels ? `<div class="spell-card-higher-levels"><strong>At Higher Levels:</strong> ${spell.higher_levels}</div>` : ''}
            </div>
            <div class="spell-card-actions">
                <button class="spell-card-btn edit-spell" data-index="${index}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="spell-card-btn cast-spell" data-index="${index}">
                    <i class="fas fa-magic"></i> Cast
                </button>
                <button class="spell-card-btn prepare-spell" data-index="${index}">
                    <i class="fas fa-book"></i> ${spell.prepared ? 'Unprepare' : 'Prepare'}
                </button>
                <button class="spell-card-btn delete delete-spell" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Bind action buttons
        card.querySelector('.edit-spell').addEventListener('click', () => {
            alert(`Edit spell: ${spell.name}\nThis would normally open the spell editor for editing.`);
        });
        
        card.querySelector('.cast-spell').addEventListener('click', () => {
            alert(`Cast spell: ${spell.name}\nThis would normally mark a spell slot as used.`);
        });
        
        card.querySelector('.prepare-spell').addEventListener('click', () => {
            // Toggle prepared status
            spell.prepared = !spell.prepared;
            alert(`${spell.name} is now ${spell.prepared ? 'prepared' : 'unprepared'}`);
            
            // Re-render this card
            const newCard = createSpellCard(spell, index);
            card.parentNode.replaceChild(newCard, card);
        });
        
        card.querySelector('.delete-spell').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${spell.name}"?`)) {
                window.characterData.spells_array.splice(index, 1);
                alert(`Deleted spell: ${spell.name}`);
                
                // Re-render the full list
                emergencyRenderSpells();
            }
        });
        
        return card;
    }
    
    // Add window.renderSpells as a fallback if it doesn't exist
    if (typeof window.renderSpells !== 'function') {
        console.log("EmergencyRender: Adding fallback renderSpells function");
        window.renderSpells = function() {
            console.log("EmergencyRender: Fallback renderSpells called");
            emergencyRenderSpells();
            return true;
        };
    }
    
    console.log("EmergencyRender: Initialization complete");
});