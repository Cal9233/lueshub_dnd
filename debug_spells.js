// Debug script to test spell parsing
document.addEventListener('DOMContentLoaded', () => {
    console.log("Debug script loaded");
    
    // Test parsing from a string
    try {
        // Test 1: Parse JSON from a string
        const testJson = '[{"id": "1682541230001","name": "Command","level": "1","school": "enchantment","casting_time": "1 action","range": "60 feet","duration": "1 round","components": "V","description": "Test spell","higher_levels": "Test higher levels","ritual": false,"concentration": false,"prepared": false}]';
        
        const parsedArray = JSON.parse(testJson);
        console.log("Test 1 - Successfully parsed JSON:", parsedArray);
        
        // Test 2: Check if we can access properties
        if (parsedArray && parsedArray.length > 0) {
            const spell = parsedArray[0];
            console.log("Test 2 - Spell properties:", {
                name: spell.name,
                level: spell.level,
                description: spell.description
            });
        }
        
        // Test 3: Try manipulating the data
        if (parsedArray && parsedArray.length > 0) {
            parsedArray[0].name = "Modified Command";
            console.log("Test 3 - Modified spell:", parsedArray[0]);
        }
        
        // Test 4: Stringify it back
        const stringified = JSON.stringify(parsedArray);
        console.log("Test 4 - Stringified back:", stringified);
        
    } catch (error) {
        console.error("Error in parsing tests:", error);
    }
    
    // Create a simple test element to display a spell
    try {
        const testSpell = {
            id: "test-id",
            name: "Test Spell", 
            level: "1",
            school: "enchantment",
            casting_time: "1 action",
            range: "60 feet",
            duration: "1 round",
            components: "V",
            description: "This is a test spell description.",
            higher_levels: "This is a test higher levels description.",
            ritual: false,
            concentration: false,
            prepared: false
        };
        
        const testContainer = document.createElement('div');
        testContainer.style.border = '2px solid red';
        testContainer.style.padding = '20px';
        testContainer.style.margin = '20px';
        testContainer.style.backgroundColor = '#f8f8f8';
        
        const heading = document.createElement('h2');
        heading.textContent = 'Debug Spell Display';
        testContainer.appendChild(heading);
        
        const spellDisplay = document.createElement('div');
        spellDisplay.innerHTML = `
            <h3>${testSpell.name}</h3>
            <p><strong>Level:</strong> ${testSpell.level}</p>
            <p><strong>School:</strong> ${testSpell.school}</p>
            <p><strong>Casting Time:</strong> ${testSpell.casting_time}</p>
            <p><strong>Range:</strong> ${testSpell.range}</p>
            <p><strong>Duration:</strong> ${testSpell.duration}</p>
            <p><strong>Components:</strong> ${testSpell.components}</p>
            <p><strong>Description:</strong> ${testSpell.description}</p>
            <p><strong>At Higher Levels:</strong> ${testSpell.higher_levels}</p>
            <p><strong>Ritual:</strong> ${testSpell.ritual}</p>
            <p><strong>Concentration:</strong> ${testSpell.concentration}</p>
            <p><strong>Prepared:</strong> ${testSpell.prepared}</p>
        `;
        testContainer.appendChild(spellDisplay);
        
        // Append to body or another container
        document.body.appendChild(testContainer);
        
        console.log("Test display created");
    } catch (error) {
        console.error("Error creating test display:", error);
    }
    
    // Try to patch into the character load process
    const originalLoadCharacter = window.loadCharacter;
    if (typeof originalLoadCharacter === 'function') {
        console.log("Found loadCharacter function, patching...");
        
        window.loadCharacter = async function() {
            console.log("Patched loadCharacter called");
            try {
                await originalLoadCharacter.apply(this, arguments);
                
                // After loading, check the spells_array
                console.log("Character loaded, checking spells_array:", window.characterData.spells_array);
                
                if (window.characterData.spells_array) {
                    // Attempt to fix any issues
                    if (typeof window.characterData.spells_array === 'string') {
                        console.log("spells_array is a string, attempting to parse");
                        try {
                            window.characterData.spells_array = JSON.parse(window.characterData.spells_array);
                        } catch (e) {
                            console.error("Failed to parse spells_array string:", e);
                        }
                    }
                    
                    // Check if it's an array of strings instead of objects
                    if (Array.isArray(window.characterData.spells_array) && 
                        window.characterData.spells_array.length > 0 && 
                        typeof window.characterData.spells_array[0] === 'string') {
                        console.log("Found array of strings instead of objects, attempting to fix");
                        try {
                            const fixedArray = window.characterData.spells_array.map(str => {
                                if (typeof str === 'string') {
                                    try {
                                        return JSON.parse(str);
                                    } catch (e) {
                                        console.error("Failed to parse spell string:", str);
                                        return null;
                                    }
                                }
                                return str;
                            }).filter(spell => spell !== null);
                            
                            window.characterData.spells_array = fixedArray;
                            console.log("Fixed spells_array:", window.characterData.spells_array);
                            
                            // Re-render spells
                            if (typeof window.renderSpells === 'function') {
                                window.renderSpells();
                                console.log("Re-rendered spells with fixed data");
                            }
                        } catch (e) {
                            console.error("Failed to fix spells_array:", e);
                        }
                    }
                }
            } catch (e) {
                console.error("Error in patched loadCharacter:", e);
            }
        };
        
        console.log("Patched loadCharacter function");
    } else {
        console.log("loadCharacter function not found");
    }
});