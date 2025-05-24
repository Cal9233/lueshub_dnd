document.addEventListener('DOMContentLoaded', () => {
    // Get Character ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('id');
    
    // Character data
    let characterData = {
        id: characterId,
        name: 'Character Name',
        race: 'Human',
        class: 'Fighter',
        level: 1,
        armor_class: 10,
        hit_points: 10,
        max_hit_points: 10,
        temp_hit_points: 0,
        temp_max_hit_points: 0, // If your DB has this field
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        gold: 0,
        silver: 0,
        copper: 0,
        spell_save_dc: 10,
        spell_attack_bonus: 0,
        spell_slots_json: '{}',
        known_spells: '',
        weapons: '',
        gear: '',
        background: '',
        notes: '[]'
    };
    
    // Notes data structure
    let notesData = [];
    
    // Spell slots data
    let spellSlots = {};
    
    // Roll history
    let rollHistory = [];
    
    // Editor state
    let currentNoteCategory = null;
    let currentNoteIndex = null;
    
    // DOM Elements
    const leftSidebar = document.getElementById('leftSidebar');
    const rightSidebar = document.getElementById('rightSidebar');
    const leftToggle = document.getElementById('leftToggle');
    const rightToggle = document.getElementById('rightToggle');
    const noteCategoriesContainer = document.getElementById('noteCategories');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const noteEditorModal = document.getElementById('noteEditorModal');
    const noteEditorContent = document.getElementById('noteEditorContent');
    const closeNoteEditorBtn = document.getElementById('closeNoteEditorBtn');
    const cancelNoteBtn = document.getElementById('cancelNoteBtn');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const spellSlotsModal = document.getElementById('spellSlotsModal');
    const spellSlotEditor = document.getElementById('spellSlotEditor');
    const closeSpellSlotsBtn = document.getElementById('closeSpellSlotsBtn');
    const addSpellLevelBtn = document.getElementById('addSpellLevelBtn');
    const cancelSpellSlotsBtn = document.getElementById('cancelSpellSlotsBtn');
    const saveSpellSlotsBtn = document.getElementById('saveSpellSlotsBtn');
    const rollDiceBtn = document.getElementById('rollDiceBtn');
    const rollResultModal = document.getElementById('rollResultModal');
    const shortRestBtn = document.getElementById('shortRestBtn');
    const longRestBtn = document.getElementById('longRestBtn');
    const saveCharacterBtn = document.getElementById('saveCharacterBtn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // Ability Scores & Modifiers
    const abilityInputs = {
        strength: document.getElementById('strength'),
        dexterity: document.getElementById('dexterity'),
        constitution: document.getElementById('constitution'),
        intelligence: document.getElementById('intelligence'),
        wisdom: document.getElementById('wisdom'),
        charisma: document.getElementById('charisma')
    };
    
    const abilityModifiers = {
        strength: document.getElementById('strMod'),
        dexterity: document.getElementById('dexMod'),
        constitution: document.getElementById('conMod'),
        intelligence: document.getElementById('intMod'),
        wisdom: document.getElementById('wisMod'),
        charisma: document.getElementById('chaMod')
    };
    
    // Character Form Fields
    const charNameInput = document.getElementById('charName');
    const charRaceInput = document.getElementById('charRace');
    const charClassInput = document.getElementById('charClass');
    const charLevelInput = document.getElementById('charLevel');
    const charACInput = document.getElementById('charAC');
    const currentHPInput = document.getElementById('currentHP');
    const maxHPInput = document.getElementById('maxHP');
    const tempHPInput = document.getElementById('tempHP');
    const goldInput = document.getElementById('gold');
    const silverInput = document.getElementById('silver');
    const copperInput = document.getElementById('copper');
    const spellDCInput = document.getElementById('spellDC');
    const spellAttackInput = document.getElementById('spellAttack');
    const knownSpellsInput = document.getElementById('knownSpells');
    const weaponsInput = document.getElementById('weapons');
    const gearInput = document.getElementById('gear');
    const backgroundInput = document.getElementById('background');
    const hpBarFill = document.getElementById('hpBarFill');
    const tempHPBar = document.getElementById('tempHPBar');
    const hpText = document.getElementById('hpText');
    const spellSlotContainer = document.getElementById('spellSlots');
    const rollHistory = document.getElementById('rollHistory');
    const configSpellsBtn = document.getElementById('configSpellsBtn');
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Skill items
    const skillItems = document.querySelectorAll('.skill-item');
    
    // Dice roller elements
    const numDiceSelect = document.getElementById('numDice');
    const diceTypeSelect = document.getElementById('diceType');
    const diceModifierSelect = document.getElementById('diceModifier');
    const rollDescriptionInput = document.getElementById('rollDescription');
    
    // Functions
    
    // Calculate ability modifier
    function calculateModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    
    // Update ability modifiers display
    function updateAbilityModifiers() {
        for (const ability in abilityInputs) {
            const score = parseInt(abilityInputs[ability].value) || 0;
            const modifier = calculateModifier(score);
            const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            abilityModifiers[ability].textContent = modifierText;
            
            // Update skill modifiers for this ability
            updateSkillModifiers(ability, modifier);
        }
    }
    
    // Update skill modifiers for a given ability
    function updateSkillModifiers(ability, modifier) {
        const skillElements = document.querySelectorAll(`.skill-item[data-ability="${ability}"]`);
        skillElements.forEach(skill => {
            const modElement = skill.querySelector('.skill-mod');
            modElement.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        });
    }
    
    // Update HP bar
    function updateHPBar() {
        const currentHP = parseInt(currentHPInput.value) || 0;
        const maxHP = parseInt(maxHPInput.value) || 1;
        const tempHP = parseInt(tempHPInput.value) || 0;
        
        // Calculate percentages
        const hpPercent = Math.min(100, Math.max(0, (currentHP / maxHP) * 100));
        const tempPercent = Math.min(100, Math.max(0, (tempHP / maxHP) * 100));
        
        // Update the HP bar
        hpBarFill.style.width = `${hpPercent}%`;
        tempHPBar.style.left = `${hpPercent}%`;
        tempHPBar.style.width = `${tempPercent}%`;
        
        // Update the text
        hpText.textContent = `${currentHP} / ${maxHP}${tempHP > 0 ? ` (+${tempHP})` : ''}`;
        
        // Update color based on HP percentage
        if (hpPercent <= 25) {
            hpBarFill.style.background = 'linear-gradient(to right, #F44336, #E57373)';
        } else if (hpPercent <= 50) {
            hpBarFill.style.background = 'linear-gradient(to right, #FFC107, #FFD54F)';
        } else {
            hpBarFill.style.background = 'linear-gradient(to right, #4CAF50, #8BC34A)';
        }
    }
    
    // Toggle sidebars
    function toggleLeftSidebar() {
        leftSidebar.classList.toggle('sidebar-collapsed');
        leftToggle.innerHTML = leftSidebar.classList.contains('sidebar-collapsed') 
            ? '<i class="fas fa-chevron-right"></i>' 
            : '<i class="fas fa-chevron-left"></i>';
    }
    
    function toggleRightSidebar() {
        rightSidebar.classList.toggle('sidebar-collapsed');
        rightToggle.innerHTML = rightSidebar.classList.contains('sidebar-collapsed') 
            ? '<i class="fas fa-chevron-left"></i>' 
            : '<i class="fas fa-chevron-right"></i>';
    }
    
    // Handle tab switching
    function switchTab(tabId) {
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}Tab`);
        });
    }
    
    // Load character data from server
    async function loadCharacter() {
        if (!characterId) return;
        
        try {
            const response = await fetch(`api/character_fix.php?id=${characterId}`);
            const data = await response.json();
            
            if (data.success && data.character) {
                characterData = data.character;
                
                // Load character data into form - safely handle strings with quotes
                charNameInput.value = characterData.name || '';
                charRaceInput.value = characterData.race || '';
                charClassInput.value = characterData.class || '';
                charLevelInput.value = characterData.level || 1;
                charACInput.value = characterData.armor_class || 10;
                currentHPInput.value = characterData.hit_points || 0;
                maxHPInput.value = characterData.max_hit_points || 0;
                tempHPInput.value = characterData.temp_hit_points || 0;
                goldInput.value = characterData.gold || 0;
                silverInput.value = characterData.silver || 0;
                copperInput.value = characterData.copper || 0;
                spellDCInput.value = characterData.spell_save_dc || 10;
                spellAttackInput.value = characterData.spell_attack_bonus || 0;
                knownSpellsInput.value = characterData.known_spells || '';
                weaponsInput.value = characterData.weapons || '';
                gearInput.value = characterData.gear || '';
                backgroundInput.value = characterData.background || '';
                
                // Load ability scores
                for (const ability in abilityInputs) {
                    abilityInputs[ability].value = characterData[ability] || 10;
                }
                
                // Parse notes JSON - safely handle escaping
                try {
                    // If the data is already an object (pre-parsed by JSON.parse in fetch),
                    // we don't need to parse it again
                    if (typeof characterData.notes === 'string') {
                        notesData = JSON.parse(characterData.notes || '[]');
                    } else if (Array.isArray(characterData.notes)) {
                        notesData = characterData.notes;
                    } else {
                        notesData = [];
                    }
                    
                    if (!Array.isArray(notesData)) notesData = [];
                } catch (e) {
                    console.error('Error parsing notes:', e);
                    notesData = [];
                }
                
                // Parse spell slots JSON - safely handle escaping
                try {
                    // If the data is already an object (pre-parsed by JSON.parse in fetch),
                    // we don't need to parse it again
                    if (typeof characterData.spell_slots_json === 'string') {
                        spellSlots = JSON.parse(characterData.spell_slots_json || '{}');
                    } else if (typeof characterData.spell_slots_json === 'object') {
                        spellSlots = characterData.spell_slots_json;
                    } else {
                        spellSlots = {};
                    }
                    
                    if (typeof spellSlots !== 'object' || spellSlots === null) spellSlots = {};
                } catch (e) {
                    console.error('Error parsing spell slots:', e);
                    spellSlots = {};
                }
                
                // Update UI
                updateAbilityModifiers();
                updateHPBar();
                renderNotes();
                renderSpellSlots();
                
                // Set username in nav
                document.getElementById('username').textContent = characterData.username || 'Adventurer';
            } else {
                showToast('Error loading character data');
            }
        } catch (error) {
            console.error('Error loading character:', error);
            showToast('Error loading character data');
        }
    }
    
    // Save character data to server
    async function saveCharacter() {
        if (!characterId) return;
        
        // Gather all character data from form
        const formData = new FormData();
        formData.append('action', 'save_character');
        formData.append('id', characterId);
        formData.append('name', charNameInput.value);
        formData.append('race', charRaceInput.value);
        formData.append('class', charClassInput.value);
        formData.append('level', charLevelInput.value);
        formData.append('armor_class', charACInput.value);
        formData.append('hit_points', currentHPInput.value);
        formData.append('max_hit_points', maxHPInput.value);
        formData.append('temp_hit_points', tempHPInput.value);
        formData.append('gold', goldInput.value);
        formData.append('silver', silverInput.value);
        formData.append('copper', copperInput.value);
        formData.append('spell_save_dc', spellDCInput.value);
        formData.append('spell_attack_bonus', spellAttackInput.value);
        formData.append('known_spells', knownSpellsInput.value);
        formData.append('weapons', weaponsInput.value);
        formData.append('gear', gearInput.value);
        formData.append('background', backgroundInput.value);
        
        // Ability scores
        for (const ability in abilityInputs) {
            formData.append(ability, abilityInputs[ability].value);
        }
        
        // Notes and spell slots as JSON
        formData.append('notes', JSON.stringify(notesData));
        formData.append('spell_slots_json', JSON.stringify(spellSlots));
        
        try {
            const response = await fetch(`api/character_fix.php?id=${characterId}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast('Character saved successfully!');
            } else {
                showToast('Error saving character: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving character:', error);
            showToast('Error saving character data');
        }
    }
    
    // Perform short rest
    async function doShortRest() {
        if (!characterId) return;
        
        try {
            const response = await fetch('api/rest.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    character_id: characterId,
                    rest_type: 'short'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update HP
                currentHPInput.value = data.new_hp || currentHPInput.value;
                updateHPBar();
                
                // Update spell slots if applicable
                if (data.spell_slots) {
                    spellSlots = data.spell_slots;
                    renderSpellSlots();
                }
                
                showToast('Short rest completed!');
            } else {
                showToast('Error: ' + (data.message || 'Could not complete short rest'));
            }
        } catch (error) {
            console.error('Error during short rest:', error);
            showToast('Error processing short rest');
        }
    }
    
    // Perform long rest
    async function doLongRest() {
        if (!characterId) return;
        
        try {
            const response = await fetch('api/rest.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    character_id: characterId,
                    rest_type: 'long'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update HP to max
                currentHPInput.value = maxHPInput.value;
                tempHPInput.value = 0;
                updateHPBar();
                
                // Restore all spell slots
                if (data.spell_slots) {
                    spellSlots = data.spell_slots;
                } else {
                    // Restore all spell slots to max
                    for (const level in spellSlots) {
                        spellSlots[level].current = spellSlots[level].max;
                    }
                }
                
                renderSpellSlots();
                showToast('Long rest completed!');
            } else {
                showToast('Error: ' + (data.message || 'Could not complete long rest'));
            }
        } catch (error) {
            console.error('Error during long rest:', error);
            showToast('Error processing long rest');
        }
    }
    
    // Roll dice
    function rollDice() {
        const numDice = parseInt(numDiceSelect.value) || 1;
        const diceType = diceTypeSelect.value;
        const modifier = parseInt(diceModifierSelect.value) || 0;
        const diceSize = parseInt(diceType.replace('d', '')) || 20;
        const description = rollDescriptionInput.value || 'Dice Roll';
        
        // Roll the dice
        const rolls = [];
        let total = 0;
        
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * diceSize) + 1;
            rolls.push(roll);
            total += roll;
        }
        
        total += modifier;
        
        // Create the formula string
        const modifierStr = modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : '';
        const formula = `${numDice}${diceType}${modifierStr}`;
        
        // Create the details string
        const rollsStr = rolls.join(' + ');
        const details = numDice > 1 
            ? `[${rollsStr}]${modifierStr ? ` ${modifierStr}` : ''}`
            : `[${rolls[0]}]${modifierStr ? ` ${modifierStr}` : ''}`;
        
        // Show the roll result modal
        document.getElementById('rollResultTitle').textContent = description;
        document.getElementById('rollResultValue').textContent = total;
        document.getElementById('rollResultFormula').textContent = formula;
        document.getElementById('rollResultDetails').textContent = details;
        
        rollResultModal.classList.add('show');
        
        // Add to roll history
        addRollToHistory(description, formula, total, details);
        
        // Save roll to server (if desired)
        saveRollToServer(description, formula, total, rolls, modifier);
        
        // Automatically hide the modal after 3 seconds
        setTimeout(() => {
            rollResultModal.classList.remove('show');
        }, 3000);
    }
    
    // Add roll to history UI
    function addRollToHistory(description, formula, total, details) {
        const rollItem = document.createElement('div');
        rollItem.className = 'roll-history-item';
        rollItem.innerHTML = `
            <div class="roll-history-title">${description}</div>
            <div class="roll-history-result">${total}</div>
            <div class="roll-history-formula">${formula}</div>
            <div class="roll-history-details">${details}</div>
        `;
        
        // Add to the top of the list
        const rollHistoryList = document.getElementById('rollHistory');
        rollHistoryList.insertBefore(rollItem, rollHistoryList.firstChild);
        
        // Limit to 10 items
        if (rollHistoryList.children.length > 10) {
            rollHistoryList.removeChild(rollHistoryList.lastChild);
        }
    }
    
    // Save roll to server
    async function saveRollToServer(action, roll, total, rolls, modifier) {
        if (!characterId) return;
        
        try {
            const response = await fetch('api/roll.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    character_id: characterId,
                    action,
                    roll,
                    total,
                    rolls_json: JSON.stringify(rolls),
                    modifier
                })
            });
            
            // No need to handle the response
        } catch (error) {
            console.error('Error saving roll:', error);
        }
    }
    
    // Roll a skill check
    function rollSkillCheck(ability, skill) {
        const abilityScore = parseInt(abilityInputs[ability].value) || 10;
        const modifier = calculateModifier(abilityScore);
        
        // Set the dice roller values
        numDiceSelect.value = 1;
        diceTypeSelect.value = 'd20';
        diceModifierSelect.value = modifier;
        rollDescriptionInput.value = skill;
        
        // Trigger the roll
        rollDice();
    }
    
    // Show toast notification
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Render notes
    function renderNotes() {
        noteCategoriesContainer.innerHTML = '';
        
        if (notesData.length === 0) {
            const emptyText = document.createElement('div');
            emptyText.className = 'empty-notes';
            emptyText.textContent = 'No notes yet. Add a section to get started!';
            noteCategoriesContainer.appendChild(emptyText);
            return;
        }
        
        notesData.forEach((category, catIndex) => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'note-category';
            
            // Category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'note-category-header';
            
            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.className = 'note-category-title-input';
            titleInput.value = category.title || 'New Section';
            titleInput.onchange = (e) => {
                notesData[catIndex].title = e.target.value;
            };
            
            const actions = document.createElement('div');
            actions.className = 'note-category-actions';
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn-sm';
            toggleBtn.innerHTML = category.isOpen ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
            toggleBtn.onclick = () => {
                category.isOpen = !category.isOpen;
                renderNotes();
            };
            
            const addNoteBtn = document.createElement('button');
            addNoteBtn.className = 'btn-sm btn-primary';
            addNoteBtn.innerHTML = '<i class="fas fa-plus"></i>';
            addNoteBtn.onclick = () => addNote(catIndex);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-sm btn-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = () => {
                if (confirm('Are you sure you want to delete this section?')) {
                    notesData.splice(catIndex, 1);
                    renderNotes();
                }
            };
            
            actions.appendChild(toggleBtn);
            actions.appendChild(addNoteBtn);
            actions.appendChild(deleteBtn);
            
            categoryHeader.appendChild(titleInput);
            categoryHeader.appendChild(actions);
            categoryEl.appendChild(categoryHeader);
            
            // Category content (notes)
            if (category.isOpen) {
                const categoryContent = document.createElement('div');
                categoryContent.className = 'note-category-content';
                
                if (category.notes && category.notes.length > 0) {
                    category.notes.forEach((note, noteIndex) => {
                        const noteEl = document.createElement('div');
                        noteEl.className = 'note-item';
                        
                        const noteHeader = document.createElement('div');
                        noteHeader.className = 'note-header';
                        
                        const noteTitleInput = document.createElement('input');
                        noteTitleInput.type = 'text';
                        noteTitleInput.className = 'note-title-input';
                        noteTitleInput.value = note.title || 'New Note';
                        noteTitleInput.onchange = (e) => {
                            notesData[catIndex].notes[noteIndex].title = e.target.value;
                        };
                        
                        const noteActions = document.createElement('div');
                        noteActions.className = 'note-actions';
                        
                        const editBtn = document.createElement('button');
                        editBtn.className = 'btn-sm';
                        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                        editBtn.onclick = () => openNoteEditor(catIndex, noteIndex);
                        
                        const deleteNoteBtn = document.createElement('button');
                        deleteNoteBtn.className = 'btn-sm btn-danger';
                        deleteNoteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                        deleteNoteBtn.onclick = () => {
                            if (confirm('Are you sure you want to delete this note?')) {
                                notesData[catIndex].notes.splice(noteIndex, 1);
                                renderNotes();
                            }
                        };
                        
                        noteActions.appendChild(editBtn);
                        noteActions.appendChild(deleteNoteBtn);
                        
                        noteHeader.appendChild(noteTitleInput);
                        noteHeader.appendChild(noteActions);
                        
                        const noteContent = document.createElement('div');
                        noteContent.className = 'note-content';
                        noteContent.innerHTML = note.content || '';
                        
                        noteEl.appendChild(noteHeader);
                        noteEl.appendChild(noteContent);
                        categoryContent.appendChild(noteEl);
                    });
                } else {
                    const emptyNotes = document.createElement('div');
                    emptyNotes.className = 'empty-note';
                    emptyNotes.textContent = 'No notes in this section yet.';
                    categoryContent.appendChild(emptyNotes);
                }
                
                categoryEl.appendChild(categoryContent);
            }
            
            noteCategoriesContainer.appendChild(categoryEl);
        });
    }
    
    // Add a new note category
    function addNoteCategory() {
        notesData.push({
            title: 'New Section',
            isOpen: true,
            notes: []
        });
        renderNotes();
    }
    
    // Add a new note to a category
    function addNote(categoryIndex) {
        if (!notesData[categoryIndex].notes) {
            notesData[categoryIndex].notes = [];
        }
        
        notesData[categoryIndex].notes.push({
            title: 'New Note',
            content: ''
        });
        
        renderNotes();
    }
    
    // Open the note editor
    function openNoteEditor(categoryIndex, noteIndex) {
        currentNoteCategory = categoryIndex;
        currentNoteIndex = noteIndex;
        
        noteEditorContent.value = notesData[categoryIndex].notes[noteIndex].content || '';
        noteEditorModal.classList.add('show');
    }
    
    // Save the note content
    function saveNoteContent() {
        if (currentNoteCategory !== null && currentNoteIndex !== null) {
            notesData[currentNoteCategory].notes[currentNoteIndex].content = noteEditorContent.value;
            renderNotes();
        }
        
        closeNoteEditor();
    }
    
    // Close the note editor
    function closeNoteEditor() {
        noteEditorModal.classList.remove('show');
        currentNoteCategory = null;
        currentNoteIndex = null;
        noteEditorContent.value = '';
    }
    
    // Render spell slots
    function renderSpellSlots() {
        spellSlotContainer.innerHTML = '';
        
        // Check if spellSlots is empty
        if (Object.keys(spellSlots).length === 0) {
            const emptyText = document.createElement('div');
            emptyText.className = 'empty-spell-slots';
            emptyText.textContent = 'No spell slots configured. Click "Configure Slots" to add them.';
            spellSlotContainer.appendChild(emptyText);
            return;
        }
        
        // Sort levels numerically
        const sortedLevels = Object.keys(spellSlots).sort((a, b) => parseInt(a) - parseInt(b));
        
        sortedLevels.forEach(level => {
            const slotInfo = spellSlots[level];
            
            const slotCard = document.createElement('div');
            slotCard.className = 'spell-slot-card';
            
            const slotHeader = document.createElement('div');
            slotHeader.className = 'spell-slot-header';
            slotHeader.textContent = `Level ${level}`;
            
            const slotControls = document.createElement('div');
            slotControls.className = 'spell-slot-controls';
            
            // Current slots
            const currentGroup = document.createElement('div');
            currentGroup.className = 'spell-slot-input-group';
            
            const currentLabel = document.createElement('label');
            currentLabel.textContent = 'Current';
            
            const currentInput = document.createElement('input');
            currentInput.type = 'number';
            currentInput.className = 'spell-slot-input';
            currentInput.value = slotInfo.current || 0;
            currentInput.min = 0;
            currentInput.max = slotInfo.max || 0;
            currentInput.onchange = (e) => {
                const value = parseInt(e.target.value) || 0;
                spellSlots[level].current = Math.min(value, slotInfo.max);
                e.target.value = spellSlots[level].current;
            };
            
            currentGroup.appendChild(currentLabel);
            currentGroup.appendChild(currentInput);
            
            // Max slots
            const maxGroup = document.createElement('div');
            maxGroup.className = 'spell-slot-input-group';
            
            const maxLabel = document.createElement('label');
            maxLabel.textContent = 'Max';
            
            const maxInput = document.createElement('input');
            maxInput.type = 'number';
            maxInput.className = 'spell-slot-input';
            maxInput.value = slotInfo.max || 0;
            maxInput.min = 0;
            maxInput.onchange = (e) => {
                const value = parseInt(e.target.value) || 0;
                spellSlots[level].max = value;
                // Ensure current doesn't exceed max
                if (spellSlots[level].current > value) {
                    spellSlots[level].current = value;
                    currentInput.value = value;
                }
            };
            
            maxGroup.appendChild(maxLabel);
            maxGroup.appendChild(maxInput);
            
            slotControls.appendChild(currentGroup);
            slotControls.appendChild(maxGroup);
            
            slotCard.appendChild(slotHeader);
            slotCard.appendChild(slotControls);
            
            spellSlotContainer.appendChild(slotCard);
        });
    }
    
    // Open spell slots configuration modal
    function openSpellSlotsConfig() {
        // Clone current spell slots for editing
        tempSpellSlots = JSON.parse(JSON.stringify(spellSlots));
        renderSpellSlotEditor();
        spellSlotsModal.classList.add('show');
    }
    
    // Render spell slot editor in modal
    function renderSpellSlotEditor() {
        spellSlotEditor.innerHTML = '';
        
        // Sort levels numerically
        const sortedLevels = Object.keys(tempSpellSlots).sort((a, b) => parseInt(a) - parseInt(b));
        
        sortedLevels.forEach(level => {
            const slotInfo = tempSpellSlots[level];
            
            const slotCard = document.createElement('div');
            slotCard.className = 'spell-slot-edit-card';
            
            const slotHeader = document.createElement('div');
            slotHeader.className = 'spell-slot-edit-header';
            
            const slotTitle = document.createElement('div');
            slotTitle.className = 'spell-slot-edit-title';
            slotTitle.textContent = `Level ${level}`;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'spell-slot-delete';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.onclick = () => {
                if (confirm(`Delete level ${level} spell slots?`)) {
                    delete tempSpellSlots[level];
                    renderSpellSlotEditor();
                }
            };
            
            slotHeader.appendChild(slotTitle);
            slotHeader.appendChild(deleteBtn);
            
            const slotControls = document.createElement('div');
            slotControls.className = 'spell-slot-edit-controls';
            
            // Current slots
            const currentGroup = document.createElement('div');
            currentGroup.className = 'spell-slot-input-group';
            
            const currentLabel = document.createElement('label');
            currentLabel.textContent = 'Current';
            
            const currentInput = document.createElement('input');
            currentInput.type = 'number';
            currentInput.className = 'spell-slot-input';
            currentInput.value = slotInfo.current || 0;
            currentInput.min = 0;
            currentInput.max = slotInfo.max || 0;
            currentInput.onchange = (e) => {
                const value = parseInt(e.target.value) || 0;
                tempSpellSlots[level].current = Math.min(value, slotInfo.max);
                e.target.value = tempSpellSlots[level].current;
            };
            
            currentGroup.appendChild(currentLabel);
            currentGroup.appendChild(currentInput);
            
            // Max slots
            const maxGroup = document.createElement('div');
            maxGroup.className = 'spell-slot-input-group';
            
            const maxLabel = document.createElement('label');
            maxLabel.textContent = 'Max';
            
            const maxInput = document.createElement('input');
            maxInput.type = 'number';
            maxInput.className = 'spell-slot-input';
            maxInput.value = slotInfo.max || 0;
            maxInput.min = 0;
            maxInput.onchange = (e) => {
                const value = parseInt(e.target.value) || 0;
                tempSpellSlots[level].max = value;
                // Ensure current doesn't exceed max
                if (tempSpellSlots[level].current > value) {
                    tempSpellSlots[level].current = value;
                    currentInput.value = value;
                }
            };
            
            maxGroup.appendChild(maxLabel);
            maxGroup.appendChild(maxInput);
            
            slotControls.appendChild(currentGroup);
            slotControls.appendChild(maxGroup);
            
            slotCard.appendChild(slotHeader);
            slotCard.appendChild(slotControls);
            
            spellSlotEditor.appendChild(slotCard);
        });
    }
    
    // Add a new spell slot level
    function addSpellLevel() {
        // Find the first level that doesn't exist (up to 9)
        for (let i = 1; i <= 9; i++) {
            if (!tempSpellSlots[i]) {
                tempSpellSlots[i] = {max: 0, current: 0};
                renderSpellSlotEditor();
                return;
            }
        }
        
        showToast('All spell levels (1-9) already exist');
    }
    
    // Save spell slot configuration
    function saveSpellSlots() {
        spellSlots = JSON.parse(JSON.stringify(tempSpellSlots));
        renderSpellSlots();
        closeSpellSlotsModal();
    }
    
    // Close spell slots configuration modal
    function closeSpellSlotsModal() {
        spellSlotsModal.classList.remove('show');
        tempSpellSlots = null;
    }
    
    // Event Listeners
    
    // Load character data on page load
    window.addEventListener('DOMContentLoaded', loadCharacter);
    
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        if (htmlElement.getAttribute('data-theme') === 'light') {
            htmlElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // Sidebar toggles
    leftToggle.addEventListener('click', toggleLeftSidebar);
    rightToggle.addEventListener('click', toggleRightSidebar);
    
    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Ability score inputs
    for (const ability in abilityInputs) {
        abilityInputs[ability].addEventListener('input', updateAbilityModifiers);
    }
    
    // HP inputs
    currentHPInput.addEventListener('input', updateHPBar);
    maxHPInput.addEventListener('input', updateHPBar);
    tempHPInput.addEventListener('input', updateHPBar);
    
    // Rest buttons
    shortRestBtn.addEventListener('click', doShortRest);
    longRestBtn.addEventListener('click', doLongRest);
    
    // Save character button
    saveCharacterBtn.addEventListener('click', saveCharacter);
    
    // Note editor
    addCategoryBtn.addEventListener('click', addNoteCategory);
    closeNoteEditorBtn.addEventListener('click', closeNoteEditor);
    cancelNoteBtn.addEventListener('click', closeNoteEditor);
    saveNoteBtn.addEventListener('click', saveNoteContent);
    
    // Spell slots configuration
    configSpellsBtn.addEventListener('click', openSpellSlotsConfig);
    closeSpellSlotsBtn.addEventListener('click', closeSpellSlotsModal);
    cancelSpellSlotsBtn.addEventListener('click', closeSpellSlotsModal);
    saveSpellSlotsBtn.addEventListener('click', saveSpellSlots);
    addSpellLevelBtn.addEventListener('click', addSpellLevel);
    
    // Dice roller
    rollDiceBtn.addEventListener('click', rollDice);
    
    // Skill check rolls
    skillItems.forEach(item => {
        const rollBtn = item.querySelector('.roll-skill-btn');
        rollBtn.addEventListener('click', () => {
            const ability = item.dataset.ability;
            const skill = item.dataset.skill;
            rollSkillCheck(ability, skill);
        });
    });
    
    // Close roll result modal when clicked
    rollResultModal.addEventListener('click', () => {
        rollResultModal.classList.remove('show');
    });
});