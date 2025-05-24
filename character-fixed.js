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
        spell_slots_object: {},
        known_spells: '',
        spells_array: [], // New array for structured spell data
        weapons: '',
        gear: '',
        background: '',
        notes: '[]',
        notes_array: [],
        // New fields for enhanced UI
        portrait_url: '',
        initiative: 0,
        speed: 30,
        hit_dice_current: 1,
        hit_dice_max: 1,
        hit_dice_type: 'd8',
        passive_perception: 10,
        proficiency_bonus: 2,
        spellcasting_ability: 'intelligence'
    };
    
    // Notes data structure - use the pre-parsed array from API
    let notesData = [];
    
    // Rich text editor state
    let richTextEditor = {
        currentCommand: null,
        selectedFormat: null,
        linkUrl: '',
        currentFilter: 'all'
    };
    
    // Spell slots data - use the pre-parsed object from API
    let spellSlots = {};
    
    // Roll history
    let rollHistory = [];
    
    // Editor state
    let currentNoteCategory = null;
    let currentNoteIndex = null;
    
    // Debounce function for auto-save
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Auto-save debounced function
    const autoSave = debounce(() => {
        saveCharacter(true);
    }, 5000);
    
    // DOM Elements
    const leftSidebar = document.getElementById('leftSidebar');
    const rightSidebar = document.getElementById('rightSidebar');
    const leftToggle = document.getElementById('leftToggle');
    const rightToggle = document.getElementById('rightToggle');
    const noteCategoriesContainer = document.getElementById('noteCategories');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const notesSearch = document.getElementById('notesSearch');
    const filterOptions = document.querySelectorAll('.filter-option');
    
    // Rich Text Editor Elements
    const noteEditorModal = document.getElementById('noteEditorModal');
    const noteEditorTitle = document.getElementById('noteEditorTitle');
    const noteEditorContent = document.getElementById('noteEditorContent');
    const noteTags = document.getElementById('noteTags');
    const richTextToolbar = document.getElementById('richTextToolbar');
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const headingSelect = document.getElementById('headingSelect');
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
    const rollHistoryContainer = document.getElementById('rollHistory');
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
            const response = await fetch(`api/character_safe.php?id=${characterId}`);
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
                
                // Use pre-parsed notes array from API
                if (characterData.notes_array && Array.isArray(characterData.notes_array)) {
                    notesData = characterData.notes_array;
                    
                    // Upgrade old notes to new format if needed
                    notesData.forEach(category => {
                        if (category.notes && Array.isArray(category.notes)) {
                            category.notes.forEach(note => {
                                // Ensure all required fields exist
                                if (!note.html && note.content) {
                                    // Convert plain text to HTML
                                    note.html = `<p>${note.content.replace(/\n/g, '</p><p>')}</p>`;
                                }
                                
                                // Ensure tags exist
                                if (!note.tags) {
                                    note.tags = [];
                                }
                                
                                // Ensure lastModified exists
                                if (!note.lastModified) {
                                    note.lastModified = new Date().toISOString();
                                }
                                
                                // Ensure isImportant exists
                                if (note.isImportant === undefined) {
                                    note.isImportant = note.tags && note.tags.includes('important');
                                }
                            });
                        }
                    });
                } else {
                    notesData = [];
                    console.error('Notes data is not an array:', characterData.notes_array);
                }
                
                // Use pre-parsed spell slots object from API
                if (characterData.spell_slots_object && typeof characterData.spell_slots_object === 'object') {
                    spellSlots = characterData.spell_slots_object;
                } else {
                    spellSlots = {};
                    console.error('Spell slots data is not an object:', characterData.spell_slots_object);
                }
                
                // Migrate spells from legacy format if needed
                migrateSpellsIfNeeded();
                
                // Update UI
                updateAbilityModifiers();
                updateHPBar();
                renderNotes();
                renderSpells();
                renderSpellSlots();
                
                // Set username in nav
                document.getElementById('username').textContent = characterData.username || 'Adventurer';
                
                console.log("Character loaded successfully:", characterData);
            } else {
                showToast('Error loading character data: ' + (data.message || 'Unknown error'));
                console.error('API error:', data);
            }
        } catch (error) {
            console.error('Error loading character:', error);
            showToast('Error loading character data');
        }
    }
    
    // Save character data to server
    async function saveCharacter(silentSave = false) {
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
        formData.append('spellcasting_ability', characterData.spellcasting_ability || 'intelligence');
        
        // Ability scores
        for (const ability in abilityInputs) {
            formData.append(ability, abilityInputs[ability].value);
        }
        
        // Notes and spell slots as JSON
        try {
            formData.append('notes', JSON.stringify(notesData));
        } catch (e) {
            console.error('Error stringifying notes:', e);
            formData.append('notes', '[]');
        }
        
        try {
            formData.append('spell_slots_json', JSON.stringify(spellSlots));
        } catch (e) {
            console.error('Error stringifying spell slots:', e);
            formData.append('spell_slots_json', '{}');
        }
        
        // Save structured spell data
        try {
            formData.append('spells_array_json', JSON.stringify(characterData.spells_array || []));
        } catch (e) {
            console.error('Error stringifying spells array:', e);
            formData.append('spells_array_json', '[]');
        }
        
        try {
            const response = await fetch(`api/character_safe.php?id=${characterId}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast('Character saved successfully!');
            } else {
                showToast('Error saving character: ' + (data.message || 'Unknown error'));
                console.error('Save error:', data);
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
        if (rollHistoryList) {
            rollHistoryList.insertBefore(rollItem, rollHistoryList.firstChild);
            
            // Limit to 10 items
            if (rollHistoryList.children.length > 10) {
                rollHistoryList.removeChild(rollHistoryList.lastChild);
            }
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
    
    // Filter notes based on criteria
    function filterNotes(filter, searchTerm = '') {
        let filteredNotes = [];
        
        notesData.forEach((category) => {
            if (!category.notes || !Array.isArray(category.notes)) return;
            
            category.notes.forEach((note, noteIndex) => {
                // Apply filter
                let passesFilter = false;
                
                switch (filter) {
                    case 'all':
                        passesFilter = true;
                        break;
                    case 'recent':
                        // Notes from the last 7 days
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        const noteDate = note.lastModified ? new Date(note.lastModified) : new Date(0);
                        passesFilter = noteDate > sevenDaysAgo;
                        break;
                    case 'important':
                        passesFilter = note.isImportant || (note.tags && note.tags.includes('important'));
                        break;
                }
                
                // Apply search term if present
                let passesSearch = true;
                if (searchTerm && searchTerm.trim().length > 0) {
                    const search = searchTerm.toLowerCase();
                    passesSearch = 
                        (note.title && note.title.toLowerCase().includes(search)) || 
                        (note.content && note.content.toLowerCase().includes(search)) ||
                        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(search)));
                }
                
                if (passesFilter && passesSearch) {
                    filteredNotes.push({
                        note,
                        categoryIndex: notesData.indexOf(category),
                        noteIndex
                    });
                }
            });
        });
        
        // Sort by last modified, newest first
        filteredNotes.sort((a, b) => {
            const dateA = a.note.lastModified ? new Date(a.note.lastModified) : new Date(0);
            const dateB = b.note.lastModified ? new Date(b.note.lastModified) : new Date(0);
            return dateB - dateA;
        });
        
        return filteredNotes;
    }
    
    // Format date for note display
    function formatNoteDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        
        // Check if invalid date
        if (isNaN(date.getTime())) return '';
        
        // Today
        if (date.toDateString() === now.toDateString()) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Within the last 7 days
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        if (date > oneWeekAgo) {
            const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
            return date.toLocaleString([], options);
        }
        
        // Older than a week
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleString([], options);
    }

    // Render notes
    function renderNotes() {
        if (!noteCategoriesContainer) {
            console.error('Note categories container not found');
            return;
        }
        
        // Clear container
        noteCategoriesContainer.innerHTML = '';
        
        // Check for empty notes
        if (!Array.isArray(notesData) || notesData.length === 0) {
            const emptyText = document.createElement('div');
            emptyText.className = 'empty-notes';
            emptyText.innerHTML = '<i class="fas fa-sticky-note empty-icon"></i><p>No notes yet. Click "New Note" to get started!</p>';
            noteCategoriesContainer.appendChild(emptyText);
            return;
        }
        
        // Get filter and search values
        const filterValue = richTextEditor.currentFilter || 'all';
        const searchTerm = notesSearch ? notesSearch.value : '';
        
        // If we're filtering, render in flat list view
        if (filterValue !== 'all' || searchTerm) {
            // Get filtered notes
            const filteredNotes = filterNotes(filterValue, searchTerm);
            
            if (filteredNotes.length === 0) {
                const emptyText = document.createElement('div');
                emptyText.className = 'empty-notes';
                emptyText.innerHTML = '<i class="fas fa-search empty-icon"></i><p>No notes match your filters. Try a different search.</p>';
                noteCategoriesContainer.appendChild(emptyText);
                return;
            }
            
            // Create container for flat view
            const flatViewContainer = document.createElement('div');
            flatViewContainer.className = 'notes-flat-view';
            
            // Render each note
            filteredNotes.forEach(({ note, categoryIndex, noteIndex }) => {
                const noteEl = createNoteElement(note, categoryIndex, noteIndex);
                flatViewContainer.appendChild(noteEl);
            });
            
            noteCategoriesContainer.appendChild(flatViewContainer);
            return;
        }
        
        // Standard category view (no filtering)
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
                autoSave();
            };
            
            const actions = document.createElement('div');
            actions.className = 'note-category-actions';
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'note-category-action';
            toggleBtn.innerHTML = category.isOpen ? '<i class="fas fa-chevron-up"></i>' : '<i class="fas fa-chevron-down"></i>';
            toggleBtn.title = category.isOpen ? 'Collapse section' : 'Expand section';
            toggleBtn.onclick = () => {
                category.isOpen = !category.isOpen;
                renderNotes();
            };
            
            const addNoteBtn = document.createElement('button');
            addNoteBtn.className = 'note-category-action';
            addNoteBtn.innerHTML = '<i class="fas fa-plus"></i>';
            addNoteBtn.title = 'Add note to this section';
            addNoteBtn.onclick = () => addNote(catIndex);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'note-category-action';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete this section';
            deleteBtn.onclick = () => {
                if (confirm('Are you sure you want to delete this section and all its notes?')) {
                    notesData.splice(catIndex, 1);
                    renderNotes();
                    autoSave();
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
                
                if (category.notes && Array.isArray(category.notes) && category.notes.length > 0) {
                    category.notes.forEach((note, noteIndex) => {
                        const noteEl = createNoteElement(note, catIndex, noteIndex);
                        categoryContent.appendChild(noteEl);
                    });
                } else {
                    const emptyNotes = document.createElement('div');
                    emptyNotes.className = 'empty-note';
                    emptyNotes.innerHTML = '<i class="fas fa-sticky-note"></i><p>No notes in this section yet.</p>';
                    categoryContent.appendChild(emptyNotes);
                }
                
                categoryEl.appendChild(categoryContent);
            }
            
            noteCategoriesContainer.appendChild(categoryEl);
        });
    }
    
    // Create a note element
    function createNoteElement(note, categoryIndex, noteIndex) {
        const noteEl = document.createElement('div');
        noteEl.className = 'note-item';
        
        // Add important class if the note is marked as important
        if (note.isImportant || (note.tags && note.tags.includes('important'))) {
            noteEl.classList.add('important');
        }
        
        // Note header
        const noteHeader = document.createElement('div');
        noteHeader.className = 'note-header';
        
        const noteTitleInput = document.createElement('div');
        noteTitleInput.className = 'note-title-input';
        noteTitleInput.textContent = note.title || 'New Note';
        
        const noteActions = document.createElement('div');
        noteActions.className = 'note-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'note-action';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit note';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            openNoteEditor(categoryIndex, noteIndex);
        };
        
        const toggleImportantBtn = document.createElement('button');
        toggleImportantBtn.className = 'note-action';
        toggleImportantBtn.innerHTML = note.isImportant ? 
            '<i class="fas fa-star"></i>' : 
            '<i class="far fa-star"></i>';
        toggleImportantBtn.title = note.isImportant ? 'Remove importance' : 'Mark as important';
        toggleImportantBtn.onclick = (e) => {
            e.stopPropagation();
            note.isImportant = !note.isImportant;
            
            // Add or remove 'important' tag
            if (note.isImportant) {
                if (!note.tags) note.tags = [];
                if (!note.tags.includes('important')) {
                    note.tags.push('important');
                }
            } else {
                if (note.tags && note.tags.includes('important')) {
                    note.tags = note.tags.filter(tag => tag !== 'important');
                }
            }
            
            renderNotes();
            autoSave();
        };
        
        const deleteNoteBtn = document.createElement('button');
        deleteNoteBtn.className = 'note-action';
        deleteNoteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteNoteBtn.title = 'Delete note';
        deleteNoteBtn.onclick = (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this note?')) {
                notesData[categoryIndex].notes.splice(noteIndex, 1);
                renderNotes();
                autoSave();
            }
        };
        
        noteActions.appendChild(toggleImportantBtn);
        noteActions.appendChild(editBtn);
        noteActions.appendChild(deleteNoteBtn);
        
        noteHeader.appendChild(noteTitleInput);
        noteHeader.appendChild(noteActions);
        
        // Note metadata (timestamp, tags)
        if (note.lastModified || (note.tags && note.tags.length > 0)) {
            const noteMetadata = document.createElement('div');
            noteMetadata.className = 'note-metadata';
            
            if (note.lastModified) {
                const timestamp = document.createElement('span');
                timestamp.className = 'note-timestamp';
                timestamp.innerHTML = `<i class="far fa-clock"></i> ${formatNoteDate(note.lastModified)}`;
                noteMetadata.appendChild(timestamp);
            }
            
            noteEl.appendChild(noteHeader);
            noteEl.appendChild(noteMetadata);
            
            // Tags
            if (note.tags && note.tags.length > 0) {
                const noteTags = document.createElement('div');
                noteTags.className = 'note-tags';
                
                note.tags.forEach(tag => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'note-tag';
                    tagEl.textContent = tag;
                    noteTags.appendChild(tagEl);
                });
                
                noteEl.appendChild(noteTags);
            }
        } else {
            noteEl.appendChild(noteHeader);
        }
        
        // Note content
        const noteContent = document.createElement('div');
        noteContent.className = 'note-content';
        
        // Prefer HTML content if available
        if (note.html) {
            noteContent.innerHTML = note.html;
        } else {
            noteContent.textContent = note.content || '';
        }
        
        noteEl.appendChild(noteContent);
        
        // Make entire note clickable
        noteEl.addEventListener('click', () => {
            openNoteEditor(categoryIndex, noteIndex);
        });
        
        return noteEl;
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
        
        const newNote = {
            title: 'New Note',
            content: '',
            html: '',
            tags: [],
            isImportant: false,
            lastModified: new Date().toISOString()
        };
        
        notesData[categoryIndex].notes.push(newNote);
        
        // Open the editor for the new note
        const noteIndex = notesData[categoryIndex].notes.length - 1;
        openNoteEditor(categoryIndex, noteIndex);
        
        renderNotes();
    }
    
    // Rich text editor functions
    function initRichTextEditor() {
        // Set up toolbar button functionality
        if (toolbarButtons) {
            toolbarButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const command = button.dataset.command;
                    executeRichTextCommand(command);
                });
            });
        }
        
        // Set up heading select functionality
        if (headingSelect) {
            headingSelect.addEventListener('change', () => {
                const tag = headingSelect.value;
                if (tag) {
                    document.execCommand('formatBlock', false, tag);
                } else {
                    document.execCommand('formatBlock', false, 'p');
                }
            });
        }
    }
    
    function executeRichTextCommand(command) {
        // Handle special cases
        if (command === 'createLink') {
            const url = prompt('Enter the link URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else {
            // Execute standard commands
            document.execCommand(command, false, null);
            
            // Update active state for buttons
            const button = document.querySelector(`[data-command="${command}"]`);
            if (button) {
                button.classList.toggle('active', document.queryCommandState(command));
            }
        }
    }
    
    // Create a new note directly (not in a specific category)
    function createNewNote() {
        // If no categories exist, create one
        if (!notesData.length) {
            addNoteCategory();
        }
        
        // Add note to the first category
        const newNote = {
            title: 'New Note',
            content: '',
            html: '',
            tags: [],
            isImportant: false,
            lastModified: new Date().toISOString()
        };
        
        notesData[0].notes.push(newNote);
        openNoteEditor(0, notesData[0].notes.length - 1);
        renderNotes();
    }
    
    // Open the note editor
    function openNoteEditor(categoryIndex, noteIndex) {
        if (categoryIndex >= notesData.length || !notesData[categoryIndex].notes || 
            noteIndex >= notesData[categoryIndex].notes.length) {
            console.error('Invalid note index');
            return;
        }
    
        currentNoteCategory = categoryIndex;
        currentNoteIndex = noteIndex;
        
        const note = notesData[categoryIndex].notes[noteIndex];
        
        // Set note title
        noteEditorTitle.value = note.title || 'New Note';
        
        // Set note content - prefer HTML content if available
        if (note.html) {
            noteEditorContent.innerHTML = note.html;
        } else {
            // Convert plain text to HTML if needed
            noteEditorContent.innerHTML = note.content ? `<p>${note.content.replace(/\n/g, '</p><p>')}</p>` : '';
        }
        
        // Set tags
        noteTags.value = note.tags ? note.tags.join(', ') : '';
        
        // Focus the editor
        noteEditorModal.classList.add('show');
        setTimeout(() => noteEditorContent.focus(), 100);
    }
    
    // Save the note content
    function saveNoteContent() {
        if (currentNoteCategory !== null && currentNoteIndex !== null &&
            currentNoteCategory < notesData.length && 
            notesData[currentNoteCategory].notes && 
            currentNoteIndex < notesData[currentNoteCategory].notes.length) {
            
            const note = notesData[currentNoteCategory].notes[currentNoteIndex];
            
            // Save title
            note.title = noteEditorTitle.value || 'Untitled Note';
            
            // Save HTML content
            note.html = noteEditorContent.innerHTML;
            
            // Extract plain text content for compatibility and search
            note.content = noteEditorContent.innerText || '';
            
            // Save tags
            note.tags = noteTags.value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            
            // Update modification time
            note.lastModified = new Date().toISOString();
            
            // Check if note has important tag
            note.isImportant = note.tags.includes('important');
            
            // Auto-save
            renderNotes();
            autoSave();
        }
        
        closeNoteEditor();
    }
    
    // Close the note editor
    function closeNoteEditor() {
        noteEditorModal.classList.remove('show');
        currentNoteCategory = null;
        currentNoteIndex = null;
        noteEditorTitle.value = '';
        noteEditorContent.innerHTML = '';
        noteTags.value = '';
    }
    
    // Render spell slots
    function renderSpellSlots() {
        if (!spellSlotContainer) {
            console.error('Spell slot container not found');
            return;
        }
    
        spellSlotContainer.innerHTML = '';
        
        // Check if spellSlots is empty
        if (typeof spellSlots !== 'object' || spellSlots === null || Object.keys(spellSlots).length === 0) {
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
    
    // Enhanced UI elements
    
    // Portrait upload handling
    function handlePortraitUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                // Set portrait in UI
                portraitContainer.innerHTML = `<img src="${event.target.result}" alt="Character Portrait" style="width: 100%; height: 100%; object-fit: cover;">`;
                // Store in character data to save
                characterData.portrait_url = event.target.result;
                
                // Add overlay back
                const overlay = document.createElement('div');
                overlay.className = 'portrait-overlay';
                overlay.innerHTML = `
                    <button class="portrait-upload-btn" id="portraitUploadBtn">
                        <i class="fas fa-camera"></i>
                    </button>
                `;
                portraitContainer.appendChild(overlay);
                portraitContainer.querySelector('#portraitUploadBtn').addEventListener('click', handlePortraitUpload);
                
                // Auto-save
                autoSave();
            };
            reader.readAsDataURL(file);
        };
        
        input.click();
    }
    
    // Detailed HP update function for UI
    function updateHPDisplay() {
        const currentHP = parseInt(currentHPInput.value) || 0;
        const maxHP = parseInt(maxHPInput.value) || 1;
        const tempHP = parseInt(tempHPInput.value) || 0;
        
        // Update HP shield display
        currentHpDisplay.textContent = currentHP;
        maxHpDisplay.textContent = `/ ${maxHP}`;
        
        // Show/hide temp HP display
        if (tempHP > 0) {
            tempHpDisplay.textContent = `+${tempHP}`;
            tempHpDisplay.style.display = 'block';
        } else {
            tempHpDisplay.style.display = 'none';
        }
        
        // Update HP bar as well
        updateHPBar();
        
        // Update shield color based on HP percentage
        const hpPercent = (currentHP / maxHP) * 100;
        let shieldColor;
        
        if (hpPercent <= 25) {
            shieldColor = '#F44336'; // Red
        } else if (hpPercent <= 50) {
            shieldColor = '#FFC107'; // Yellow/Orange
        } else {
            shieldColor = '#4CAF50'; // Green
        }
        
        const shield = document.querySelector('.hp-shield');
        if (shield) {
            shield.style.backgroundColor = shieldColor;
        }
    }
    
    // Function to update passive perception
    function updatePassivePerception() {
        const wisScore = parseInt(abilityInputs.wisdom.value) || 10;
        const wisModifier = calculateModifier(wisScore);
        const profBonus = parseInt(characterData.proficiency_bonus) || 2;
        
        // Passive perception = 10 + wisdom modifier + proficiency bonus (if proficient)
        // For simplicity, we're just adding the wisdom modifier here
        const passive = 10 + wisModifier;
        
        if (passivePerception) {
            passivePerception.textContent = passive;
        }
        
        // Save to character data
        characterData.passive_perception = passive;
    }
    
    // Function to update proficiency bonus based on level
    function updateProficiencyBonus() {
        const level = parseInt(charLevelInput.value) || 1;
        let bonus = 2; // Default for levels 1-4
        
        if (level >= 17) {
            bonus = 6;
        } else if (level >= 13) {
            bonus = 5;
        } else if (level >= 9) {
            bonus = 4;
        } else if (level >= 5) {
            bonus = 3;
        }
        
        if (proficiencyBonus) {
            proficiencyBonus.textContent = `+${bonus}`;
        }
        
        // Save to character data
        characterData.proficiency_bonus = bonus;
    }
    
    // Function to handle hit dice usage
    function useHitDice() {
        const currentDice = parseInt(characterData.hit_dice_current) || 0;
        if (currentDice <= 0) {
            showToast('No hit dice remaining');
            return;
        }
        
        // Determine hit dice type
        const diceType = characterData.hit_dice_type || 'd8';
        const diceSize = parseInt(diceType.replace('d', '')) || 8;
        
        // Roll the hit die + CON modifier
        const conModifier = calculateModifier(parseInt(abilityInputs.constitution.value) || 10);
        const roll = Math.floor(Math.random() * diceSize) + 1;
        const healingAmount = Math.max(1, roll + conModifier); // Minimum 1 HP
        
        // Update hit points (can't exceed max)
        const currentHP = parseInt(currentHPInput.value) || 0;
        const maxHP = parseInt(maxHPInput.value) || 1;
        const newHP = Math.min(currentHP + healingAmount, maxHP);
        
        currentHPInput.value = newHP;
        
        // Update hit dice count
        characterData.hit_dice_current = currentDice - 1;
        currentHitDice.textContent = characterData.hit_dice_current;
        
        // Update displays
        updateHPDisplay();
        
        // Show success message
        showToast(`Rolled ${diceType} (${roll}) + ${conModifier} for healing. Recovered ${healingAmount} HP.`);
        
        // Auto-save
        autoSave();
    }
    
    // Function to restore hit dice
    function restoreHitDice() {
        // On a long rest, you regain up to half your total number of Hit Dice
        const maxDice = parseInt(characterData.hit_dice_max) || 1;
        const currentDice = parseInt(characterData.hit_dice_current) || 0;
        
        // Can recover up to half max hit dice (rounded down)
        const diceToRecover = Math.floor(maxDice / 2);
        // But can't exceed max
        const newDiceCount = Math.min(currentDice + diceToRecover, maxDice);
        
        characterData.hit_dice_current = newDiceCount;
        currentHitDice.textContent = newDiceCount;
        
        showToast(`Restored ${newDiceCount - currentDice} hit dice. Now have ${newDiceCount}/${maxDice}.`);
        
        // Auto-save
        autoSave();
    }
    
    // Function to handle level change
    function handleLevelChange(adjustment) {
        const current = parseInt(charLevelInput.value) || 1;
        const newLevel = Math.max(1, Math.min(20, current + adjustment));
        
        if (newLevel !== current) {
            charLevelInput.value = newLevel;
            
            // Update hit dice max based on level
            characterData.hit_dice_max = newLevel;
            maxHitDice.textContent = newLevel;
            
            // Update proficiency bonus
            updateProficiencyBonus();
            
            // Auto-save
            autoSave();
        }
    }

    // Enhanced HP button handlers
    function handleHPChange(field, adjustment) {
        const inputField = field === 'current' ? currentHPInput :
                          field === 'max' ? maxHPInput : 
                          field === 'temp' ? tempHPInput : null;
        
        if (!inputField) return;
        
        const current = parseInt(inputField.value) || 0;
        const newValue = Math.max(0, current + adjustment);
        
        inputField.value = newValue;
        updateHPDisplay();
        
        // Auto-save
        autoSave();
    }
    
    // Load character data on page load
    window.addEventListener('DOMContentLoaded', loadCharacter);
    
    // Theme toggle
    if (themeToggle) {
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
    }
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        if (themeToggle && savedTheme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // Sidebar toggles
    if (leftToggle) leftToggle.addEventListener('click', toggleLeftSidebar);
    if (rightToggle) rightToggle.addEventListener('click', toggleRightSidebar);
    
    // Tab switching
    if (tabButtons) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });
    }
    
    // Ability score inputs
    for (const ability in abilityInputs) {
        if (abilityInputs[ability]) {
            abilityInputs[ability].addEventListener('input', updateAbilityModifiers);
        }
    }
    
    // HP inputs
    if (currentHPInput) currentHPInput.addEventListener('input', updateHPBar);
    if (maxHPInput) maxHPInput.addEventListener('input', updateHPBar);
    if (tempHPInput) tempHPInput.addEventListener('input', updateHPBar);
    
    // Rest buttons
    if (shortRestBtn) shortRestBtn.addEventListener('click', doShortRest);
    if (longRestBtn) longRestBtn.addEventListener('click', doLongRest);
    
    // Save character button
    if (saveCharacterBtn) saveCharacterBtn.addEventListener('click', saveCharacter);
    
    // Note editor and rich text functionality
    if (addCategoryBtn) addCategoryBtn.addEventListener('click', addNoteCategory);
    if (addNoteBtn) addNoteBtn.addEventListener('click', createNewNote);
    if (closeNoteEditorBtn) closeNoteEditorBtn.addEventListener('click', closeNoteEditor);
    if (cancelNoteBtn) cancelNoteBtn.addEventListener('click', closeNoteEditor);
    if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveNoteContent);
    
    // Note search and filter functionality
    if (notesSearch) {
        notesSearch.addEventListener('input', () => {
            renderNotes();
        });
    }
    
    // Add filter functionality
    if (filterOptions && filterOptions.length > 0) {
        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Update active class
                filterOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update filter state
                richTextEditor.currentFilter = option.dataset.filter;
                
                // Rerender notes
                renderNotes();
            });
        });
    }
    
    // Initialize rich text editor
    initRichTextEditor();
    
    // Spell slots configuration
    if (configSpellsBtn) configSpellsBtn.addEventListener('click', openSpellSlotsConfig);
    if (closeSpellSlotsBtn) closeSpellSlotsBtn.addEventListener('click', closeSpellSlotsModal);
    if (cancelSpellSlotsBtn) cancelSpellSlotsBtn.addEventListener('click', closeSpellSlotsModal);
    if (saveSpellSlotsBtn) saveSpellSlotsBtn.addEventListener('click', saveSpellSlots);
    if (addSpellLevelBtn) addSpellLevelBtn.addEventListener('click', addSpellLevel);
    
    // Dice roller
    if (rollDiceBtn) rollDiceBtn.addEventListener('click', rollDice);
    
    // Skill check rolls
    if (skillItems) {
        skillItems.forEach(item => {
            const rollBtn = item.querySelector('.roll-skill-btn');
            if (rollBtn) {
                rollBtn.addEventListener('click', () => {
                    const ability = item.dataset.ability;
                    const skill = item.dataset.skill;
                    rollSkillCheck(ability, skill);
                });
            }
        });
    }
    
    // Close roll result modal when clicked
    if (rollResultModal) {
        rollResultModal.addEventListener('click', () => {
            rollResultModal.classList.remove('show');
        });
    }
    
    // Enhanced UI event listeners
    
    // Portrait upload
    if (portraitUploadBtn) {
        portraitUploadBtn.addEventListener('click', handlePortraitUpload);
    }
    
    // Level buttons
    if (levelDownBtn) {
        levelDownBtn.addEventListener('click', () => handleLevelChange(-1));
    }
    
    if (levelUpBtn) {
        levelUpBtn.addEventListener('click', () => handleLevelChange(1));
    }
    
    // HP control buttons
    if (hpDecreaseBtn) {
        hpDecreaseBtn.addEventListener('click', () => handleHPChange('current', -1));
    }
    
    if (hpIncreaseBtn) {
        hpIncreaseBtn.addEventListener('click', () => handleHPChange('current', 1));
    }
    
    if (maxHpDecreaseBtn) {
        maxHpDecreaseBtn.addEventListener('click', () => handleHPChange('max', -1));
    }
    
    if (maxHpIncreaseBtn) {
        maxHpIncreaseBtn.addEventListener('click', () => handleHPChange('max', 1));
    }
    
    if (tempHpDecreaseBtn) {
        tempHpDecreaseBtn.addEventListener('click', () => handleHPChange('temp', -1));
    }
    
    if (tempHpIncreaseBtn) {
        tempHpIncreaseBtn.addEventListener('click', () => handleHPChange('temp', 1));
    }
    
    // Hit dice buttons
    if (useHitDiceBtn) {
        useHitDiceBtn.addEventListener('click', useHitDice);
    }
    
    if (restoreHitDiceBtn) {
        restoreHitDiceBtn.addEventListener('click', restoreHitDice);
    }
    
    // Auto-update derived stats when relevant inputs change
    if (charLevelInput) {
        charLevelInput.addEventListener('change', () => {
            updateProficiencyBonus();
            
            // Update hit dice max based on level
            const level = parseInt(charLevelInput.value) || 1;
            characterData.hit_dice_max = level;
            if (maxHitDice) maxHitDice.textContent = level;
            
            autoSave();
        });
    }
    
    if (abilityInputs.wisdom) {
        abilityInputs.wisdom.addEventListener('change', updatePassivePerception);
    }
    
    // Update HP display when any HP input changes
    if (currentHPInput) {
        currentHPInput.addEventListener('change', updateHPDisplay);
    }
    
    if (maxHPInput) {
        maxHPInput.addEventListener('change', updateHPDisplay);
    }
    
    if (tempHPInput) {
        tempHPInput.addEventListener('change', updateHPDisplay);
    }
    
    // Spell Management Functions
    
    // State for spell editor
    let currentEditingSpell = null;
    let currentEditingSpellIndex = -1;
    
    // Get spell editor DOM elements
    const spellEditorModal = document.getElementById('spellEditorModal');
    const spellEditorTitle = document.getElementById('spellEditorTitle');
    const spellNameInput = document.getElementById('spellName');
    const spellLevelSelect = document.getElementById('spellLevel');
    const spellSchoolSelect = document.getElementById('spellSchool');
    const spellCastingTimeInput = document.getElementById('spellCastingTime');
    const spellRangeInput = document.getElementById('spellRange');
    const spellDurationInput = document.getElementById('spellDuration');
    const spellComponentsInput = document.getElementById('spellComponents');
    const spellDescriptionInput = document.getElementById('spellDescription');
    const spellHigherLevelsInput = document.getElementById('spellHigherLevels');
    const spellRitualCheck = document.getElementById('spellRitual');
    const spellConcentrationCheck = document.getElementById('spellConcentration');
    const spellPreparedCheck = document.getElementById('spellPrepared');
    const spellList = document.getElementById('spellList');
    const emptySpellList = document.getElementById('emptySpellList');
    const spellLevelFilter = document.getElementById('spellLevelFilter');
    const spellSchoolFilter = document.getElementById('spellSchoolFilter');
    const spellSearchInput = document.getElementById('spellSearchInput');
    const addSpellBtn = document.getElementById('addSpellBtn');
    const saveSpellBtn = document.getElementById('saveSpellBtn');
    const cancelSpellBtn = document.getElementById('cancelSpellBtn');
    const closeSpellEditorBtn = document.getElementById('closeSpellEditorBtn');
    
    // Open spell editor modal
    function openSpellEditor(spell = null, index = -1) {
        // Set the modal title based on whether we're editing or adding
        spellEditorTitle.textContent = spell ? 'Edit Spell' : 'Add New Spell';
        
        currentEditingSpell = spell;
        currentEditingSpellIndex = index;
        
        // Set form values
        if (spell) {
            spellNameInput.value = spell.name || '';
            spellLevelSelect.value = spell.level || 'cantrip';
            spellSchoolSelect.value = spell.school || 'evocation';
            spellCastingTimeInput.value = spell.casting_time || '';
            spellRangeInput.value = spell.range || '';
            spellDurationInput.value = spell.duration || '';
            spellComponentsInput.value = spell.components || '';
            spellDescriptionInput.value = spell.description || '';
            spellHigherLevelsInput.value = spell.higher_levels || '';
            spellRitualCheck.checked = spell.ritual || false;
            spellConcentrationCheck.checked = spell.concentration || false;
            spellPreparedCheck.checked = spell.prepared || false;
        } else {
            // Reset form
            spellNameInput.value = '';
            spellLevelSelect.value = 'cantrip';
            spellSchoolSelect.value = 'evocation';
            spellCastingTimeInput.value = '1 action';
            spellRangeInput.value = '60 feet';
            spellDurationInput.value = 'Instantaneous';
            spellComponentsInput.value = 'V, S';
            spellDescriptionInput.value = '';
            spellHigherLevelsInput.value = '';
            spellRitualCheck.checked = false;
            spellConcentrationCheck.checked = false;
            spellPreparedCheck.checked = false;
        }
        
        // Show the modal
        spellEditorModal.classList.add('show');
    }
    
    // Close spell editor modal
    function closeSpellEditor() {
        spellEditorModal.classList.remove('show');
        currentEditingSpell = null;
        currentEditingSpellIndex = -1;
    }
    
    // Save spell from editor
    function saveSpell() {
        // Validate required fields
        if (!spellNameInput.value) {
            showToast('Spell name is required');
            return;
        }
        
        if (!spellDescriptionInput.value) {
            showToast('Spell description is required');
            return;
        }
        
        // Create spell object
        const spell = {
            id: currentEditingSpell ? currentEditingSpell.id : Date.now().toString(),
            name: spellNameInput.value,
            level: spellLevelSelect.value,
            school: spellSchoolSelect.value,
            casting_time: spellCastingTimeInput.value,
            range: spellRangeInput.value,
            duration: spellDurationInput.value,
            components: spellComponentsInput.value,
            description: spellDescriptionInput.value,
            higher_levels: spellHigherLevelsInput.value,
            ritual: spellRitualCheck.checked,
            concentration: spellConcentrationCheck.checked,
            prepared: spellPreparedCheck.checked
        };
        
        // Add or update the spell in the array
        if (currentEditingSpellIndex >= 0) {
            // Updating existing spell
            characterData.spells_array[currentEditingSpellIndex] = spell;
        } else {
            // Adding new spell
            if (!Array.isArray(characterData.spells_array)) {
                characterData.spells_array = [];
            }
            characterData.spells_array.push(spell);
        }
        
        // Render the spells list
        renderSpells();
        
        // Auto save
        autoSave();
        
        // Close the modal
        closeSpellEditor();
        
        // Show success message
        showToast(currentEditingSpellIndex >= 0 ? 'Spell updated successfully' : 'Spell added successfully');
    }
    
    // Delete spell
    function deleteSpell(spell, index) {
        if (confirm(`Are you sure you want to delete "${spell.name}"?`)) {
            characterData.spells_array.splice(index, 1);
            renderSpells();
            autoSave();
            showToast('Spell deleted');
        }
    }
    
    // Toggle spell prepared status
    function toggleSpellPrepared(index) {
        const spell = characterData.spells_array[index];
        if (spell) {
            spell.prepared = !spell.prepared;
            renderSpells();
            autoSave();
            showToast(spell.prepared ? `${spell.name} marked as prepared` : `${spell.name} marked as unprepared`);
        }
    }
    
    // Cast spell (use a spell slot)
    function castSpell(spell) {
        // Skip for cantrips
        if (spell.level === 'cantrip') {
            showToast(`${spell.name} cast successfully`);
            return;
        }
        
        // Check if we have a spell slot of this level
        const level = parseInt(spell.level);
        if (isNaN(level)) return;
        
        if (!spellSlots[level] || spellSlots[level].current <= 0) {
            showToast(`No level ${level} spell slots remaining`);
            return;
        }
        
        // Decrement the spell slot
        spellSlots[level].current--;
        
        // Update the UI
        renderSpellSlots();
        
        // Auto save
        autoSave();
        
        // Show message
        showToast(`${spell.name} cast successfully using level ${level} spell slot`);
    }
    
    // Filter and render spells list
    function renderSpells() {
        // Handle empty or invalid data
        if (!Array.isArray(characterData.spells_array) || characterData.spells_array.length === 0) {
            if (spellList) spellList.innerHTML = '';
            if (emptySpellList) emptySpellList.style.display = 'flex';
            return;
        }
        
        if (emptySpellList) emptySpellList.style.display = 'none';
        
        // Get filter values
        const levelFilter = spellLevelFilter ? spellLevelFilter.value : 'all';
        const schoolFilter = spellSchoolFilter ? spellSchoolFilter.value : 'all';
        const searchText = spellSearchInput ? spellSearchInput.value.toLowerCase() : '';
        
        // Filter spells based on criteria
        const filteredSpells = characterData.spells_array.filter(spell => {
            // Level filter
            if (levelFilter !== 'all' && spell.level !== levelFilter) return false;
            
            // School filter
            if (schoolFilter !== 'all' && spell.school !== schoolFilter) return false;
            
            // Search text
            if (searchText && 
                !spell.name.toLowerCase().includes(searchText) &&
                !spell.description.toLowerCase().includes(searchText)) {
                return false;
            }
            
            return true;
        });
        
        // Sort spells by level then name
        filteredSpells.sort((a, b) => {
            // Sort cantrips first
            if (a.level === 'cantrip' && b.level !== 'cantrip') return -1;
            if (a.level !== 'cantrip' && b.level === 'cantrip') return 1;
            
            // Sort by level number
            const levelA = a.level === 'cantrip' ? 0 : parseInt(a.level);
            const levelB = b.level === 'cantrip' ? 0 : parseInt(b.level);
            
            if (levelA !== levelB) return levelA - levelB;
            
            // Sort by name within same level
            return a.name.localeCompare(b.name);
        });
        
        // Render the spells list
        if (spellList) {
            spellList.innerHTML = '';
            
            if (filteredSpells.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-spell-list';
                emptyMessage.style.display = 'flex';
                emptyMessage.innerHTML = `
                    <i class="fas fa-search empty-icon"></i>
                    <p>No spells match your filters. Try adjusting your search criteria.</p>
                `;
                spellList.appendChild(emptyMessage);
                return;
            }
            
            filteredSpells.forEach((spell, index) => {
                const originalIndex = characterData.spells_array.findIndex(s => s.id === spell.id);
                const spellCard = createSpellCard(spell, originalIndex);
                spellList.appendChild(spellCard);
            });
        }
        
        // Also update legacy format for backward compatibility
        updateLegacySpellFormat();
    }
    
    // Convert structured spell data to legacy format
    function updateLegacySpellFormat() {
        if (Array.isArray(characterData.spells_array) && characterData.spells_array.length > 0 && knownSpellsInput) {
            let legacyText = '';
            
            // Group spells by level
            const spellsByLevel = {};
            
            characterData.spells_array.forEach(spell => {
                const level = spell.level === 'cantrip' ? 'Cantrips' : `Level ${spell.level}`;
                if (!spellsByLevel[level]) {
                    spellsByLevel[level] = [];
                }
                spellsByLevel[level].push(spell.name);
            });
            
            // Create text with level headings and spell lists
            const levelOrder = ['Cantrips', ...Array.from({length: 9}, (_, i) => `Level ${i+1}`)];
            levelOrder.forEach(level => {
                if (spellsByLevel[level] && spellsByLevel[level].length > 0) {
                    legacyText += `${level}:\n`;
                    spellsByLevel[level].forEach(name => {
                        legacyText += `- ${name}\n`;
                    });
                    legacyText += '\n';
                }
            });
            
            // Set the legacy text
            knownSpellsInput.value = legacyText.trim();
            characterData.known_spells = legacyText.trim();
        }
    }
    
    // Parse legacy spell format to structured format (for migration)
    function parseSpellsFromLegacy() {
        // Get spell text from input or directly from character data
        const legacyText = knownSpellsInput ? knownSpellsInput.value : characterData.known_spells || '';
        
        if (!legacyText || legacyText.trim() === '') {
            return [];
        }
        
        const lines = legacyText.split('\n');
        
        let currentLevel = 'cantrip';
        const spells = [];
        const processedNames = new Set(); // To avoid duplicates
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            
            // Skip empty lines
            if (!trimmedLine) return;
            
            // Check if this is a level heading
            if (trimmedLine.endsWith(':')) {
                const levelText = trimmedLine.slice(0, -1).toLowerCase();
                
                if (levelText === 'cantrips') {
                    currentLevel = 'cantrip';
                } else if (levelText.startsWith('level ')) {
                    const levelNum = levelText.replace('level ', '');
                    currentLevel = levelNum;
                }
                
                return;
            }
            
            // Handle different spell entry formats
            let spellName = null;
            
            // Check if this is a spell entry (starting with - or *)
            if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                spellName = trimmedLine.substring(1).trim();
            } 
            // Try to handle plain text entries as well
            else if (!trimmedLine.includes(':') && /^[A-Za-z\s']+$/.test(trimmedLine)) {
                spellName = trimmedLine;
            }
            
            if (spellName && !processedNames.has(spellName.toLowerCase())) {
                processedNames.add(spellName.toLowerCase());
                
                spells.push({
                    id: Date.now() + Math.random().toString(36).substring(2, 9), // Generate unique id
                    name: spellName,
                    level: currentLevel,
                    school: 'evocation', // Default
                    casting_time: '1 action', // Default
                    range: '60 feet', // Default
                    duration: 'Instantaneous', // Default
                    components: 'V, S', // Default
                    description: 'No description provided.', // Default
                    higher_levels: '', // Default
                    ritual: false,
                    concentration: false,
                    prepared: false
                });
            }
        });
        
        // Handle completely unstructured lists as a fallback
        if (spells.length === 0 && legacyText.trim() !== '') {
            // Try splitting by commas if nothing else worked
            const commaList = legacyText.split(',');
            if (commaList.length > 1) {
                commaList.forEach(spellName => {
                    const name = spellName.trim();
                    if (name && !processedNames.has(name.toLowerCase())) {
                        processedNames.add(name.toLowerCase());
                        spells.push({
                            id: Date.now() + Math.random().toString(36).substring(2, 9),
                            name: name,
                            level: 'cantrip', // Assume cantrip as default
                            school: 'evocation', // Default
                            casting_time: '1 action', // Default
                            range: '60 feet', // Default
                            duration: 'Instantaneous', // Default
                            components: 'V, S', // Default
                            description: 'No description provided.', // Default
                            higher_levels: '', // Default
                            ritual: false,
                            concentration: false,
                            prepared: false
                        });
                    }
                });
            }
        }
        
        return spells;
    }
    
    // Migrate from legacy spell format if needed
    function migrateSpellsIfNeeded() {
        // Ensure spells_array is properly initialized
        if (!Array.isArray(characterData.spells_array)) {
            characterData.spells_array = [];
        }
        
        // Only migrate from legacy if we have no structured data yet
        if (characterData.spells_array.length === 0) {
            // Check if we have legacy data
            if (characterData.known_spells && characterData.known_spells.trim() !== '') {
                console.log("Migrating spells from legacy format:", characterData.known_spells);
                const parsedSpells = parseSpellsFromLegacy();
                
                if (parsedSpells.length > 0) {
                    characterData.spells_array = parsedSpells;
                    console.log("Successfully migrated", parsedSpells.length, "spells");
                    showToast(`Migrated ${parsedSpells.length} spells from legacy format`);
                    renderSpells();
                } else {
                    console.log("No spells found in legacy format");
                }
            } else {
                console.log("No legacy spell data to migrate");
            }
        } else {
            console.log("Using existing structured spell data:", characterData.spells_array.length, "spells");
            
            // Ensure all spells have the necessary properties
            characterData.spells_array.forEach(spell => {
                // Generate ID if missing
                if (!spell.id) {
                    spell.id = Date.now() + Math.random().toString(36).substring(2, 9);
                }
                
                // Ensure other required properties have defaults
                spell.school = spell.school || 'evocation';
                spell.casting_time = spell.casting_time || '1 action';
                spell.range = spell.range || '60 feet';
                spell.duration = spell.duration || 'Instantaneous';
                spell.components = spell.components || 'V, S';
                spell.description = spell.description || 'No description provided.';
                
                // Boolean properties
                spell.ritual = !!spell.ritual;
                spell.concentration = !!spell.concentration;
                spell.prepared = !!spell.prepared;
            });
        }
    }
    
    // Create a spell card element
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
        
        // Add event listeners to buttons
        card.querySelector('.edit-spell').addEventListener('click', () => {
            openSpellEditor(spell, index);
        });
        
        card.querySelector('.cast-spell').addEventListener('click', () => {
            castSpell(spell);
        });
        
        card.querySelector('.prepare-spell').addEventListener('click', () => {
            toggleSpellPrepared(index);
        });
        
        card.querySelector('.delete-spell').addEventListener('click', () => {
            deleteSpell(spell, index);
        });
        
        return card;
    }
    
    // Initialize enhanced displays on first load
    window.addEventListener('load', () => {
        // Set initial values for enhanced UI displays
        if (currentHPInput && maxHPInput && tempHPInput) {
            updateHPDisplay();
        }
        
        if (abilityInputs.wisdom) {
            updatePassivePerception();
        }
        
        if (charLevelInput) {
            updateProficiencyBonus();
        }
        
        // Initialize spell system
        renderSpells();
        
        // Set up spell management UI listeners
        if (addSpellBtn) {
            addSpellBtn.addEventListener('click', () => openSpellEditor());
        }
        
        if (saveSpellBtn) {
            saveSpellBtn.addEventListener('click', saveSpell);
        }
        
        if (cancelSpellBtn) {
            cancelSpellBtn.addEventListener('click', closeSpellEditor);
        }
        
        if (closeSpellEditorBtn) {
            closeSpellEditorBtn.addEventListener('click', closeSpellEditor);
        }
        
        // Set up filter listeners
        if (spellLevelFilter) {
            spellLevelFilter.addEventListener('change', renderSpells);
        }
        
        if (spellSchoolFilter) {
            spellSchoolFilter.addEventListener('change', renderSpells);
        }
        
        if (spellSearchInput) {
            spellSearchInput.addEventListener('input', debounce(() => renderSpells(), 300));
        }
        
        // Set spellcasting ability listener
        if (spellCastingAbility) {
            spellCastingAbility.addEventListener('change', (e) => {
                characterData.spellcasting_ability = e.target.value;
                autoSave();
            });
            
            // Set initial value
            if (characterData.spellcasting_ability) {
                spellCastingAbility.value = characterData.spellcasting_ability;
            }
        }
    });
});