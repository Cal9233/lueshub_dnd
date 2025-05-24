// Simple 2D Dice Roller

document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI
    initUI();
});

// Global variables
let selectedDiceType = 'd20'; // Default to d20

// Initialize UI elements and event handlers
function initUI() {
    // Get DOM elements
    const rollButton = document.getElementById('roll-dice');
    const clearButton = document.getElementById('clear-dice');
    const diceItems = document.querySelectorAll('.dice-item');
    const increaseBtn = document.getElementById('increase-dice');
    const decreaseBtn = document.getElementById('decrease-dice');
    const increaseMod = document.getElementById('increase-mod');
    const decreaseMod = document.getElementById('decrease-mod');
    
    // Select d20 by default
    selectDiceType('d20');
    
    // Set default dice roll result text
    document.getElementById('dice-result').innerHTML = '<span>Roll the dice to see results</span>';
    document.getElementById('dice-total').innerHTML = '<span>Total: 0</span>';
    
    // Hide loading overlay
    document.getElementById('loading-overlay').style.display = 'none';
    
    // Dice selection
    diceItems.forEach(item => {
        item.addEventListener('click', () => {
            const diceType = item.getAttribute('data-dice');
            selectDiceType(diceType);
        });
    });
    
    // Roll and clear buttons
    rollButton.addEventListener('click', rollDice);
    clearButton.addEventListener('click', clearDice);
    
    // Dice count buttons
    increaseBtn.addEventListener('click', () => {
        const countInput = document.getElementById('dice-count');
        const newValue = Math.min(parseInt(countInput.value) + 1, 10);
        countInput.value = newValue;
    });
    
    decreaseBtn.addEventListener('click', () => {
        const countInput = document.getElementById('dice-count');
        const newValue = Math.max(parseInt(countInput.value) - 1, 1);
        countInput.value = newValue;
    });
    
    // Modifier buttons
    increaseMod.addEventListener('click', () => {
        const modInput = document.getElementById('dice-modifier');
        const newValue = Math.min(parseInt(modInput.value) + 1, 20);
        modInput.value = newValue;
    });
    
    decreaseMod.addEventListener('click', () => {
        const modInput = document.getElementById('dice-modifier');
        const newValue = Math.max(parseInt(modInput.value) - 1, -20);
        modInput.value = newValue;
    });
}

// Helper function to select a dice type
function selectDiceType(diceType) {
    // Remove selection from all dice items
    document.querySelectorAll('.dice-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to the selected dice item
    const selectedItem = document.querySelector(`.dice-item[data-dice="${diceType}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        selectedDiceType = diceType;
        console.log("Selected dice type:", diceType);
    }
}

// Roll the dice
function rollDice() {
    console.log("Rolling dice...");
    
    // Get user input values
    const diceCount = parseInt(document.getElementById('dice-count').value);
    const modifier = parseInt(document.getElementById('dice-modifier').value);
    
    // Validate inputs
    if (!selectedDiceType || diceCount <= 0 || diceCount > 10) {
        console.log("Invalid inputs:", selectedDiceType, diceCount);
        return;
    }
    
    console.log(`Rolling ${diceCount}${selectedDiceType} with modifier ${modifier}`);
    
    // Get max value based on dice type
    let maxValue;
    switch(selectedDiceType) {
        case 'd4': maxValue = 4; break;
        case 'd6': maxValue = 6; break;
        case 'd8': maxValue = 8; break;
        case 'd10': maxValue = 10; break;
        case 'd12': maxValue = 12; break;
        case 'd20': maxValue = 20; break;
        case 'd100': maxValue = 100; break;
        default: maxValue = 20;
    }
    
    // Roll dice
    let results = [];
    let sum = 0;
    
    for (let i = 0; i < diceCount; i++) {
        // Generate random number between 1 and max
        let roll = Math.floor(Math.random() * maxValue) + 1;
        results.push(roll);
        sum += roll;
    }
    
    // Calculate total
    const total = sum + modifier;
    
    // Format results
    let resultText = `${diceCount}${selectedDiceType}: [${results.join(', ')}]`;
    if (modifier !== 0) {
        resultText += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
    }
    
    // Update UI
    document.getElementById('dice-result').innerHTML = `<span>${resultText}</span>`;
    document.getElementById('dice-total').innerHTML = `<span>Total: ${total}</span>`;
    
    // Add short delay before showing results
    setTimeout(() => {
        // Animate dice roll effect in canvas
        animateDiceRoll(selectedDiceType, results);
    }, 100);
    
    // Add to roll history
    const rollLog = document.getElementById('roll-log');
    const entry = document.createElement('div');
    entry.className = 'roll-log-entry';
    
    entry.innerHTML = `
        <div class="roll-log-dice">${diceCount}${selectedDiceType}</div>
        <div class="roll-log-result">[${results.join(', ')}]</div>
        <div class="roll-log-total">Total: ${total}</div>
    `;
    
    // Add to top of log
    rollLog.insertBefore(entry, rollLog.firstChild);
    
    // Limit history length
    while (rollLog.children.length > 10) {
        rollLog.removeChild(rollLog.lastChild);
    }
    
    // Save roll to database
    saveRollToDatabase(diceCount, selectedDiceType, results, modifier, total);
}

// Animate simple 2D dice roll in canvas
function animateDiceRoll(diceType, finalResults) {
    const canvas = document.getElementById('dice-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match container
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    // Animation constants
    const diceSize = 80;
    const diceSpacing = diceSize + 20;
    const startX = (canvas.width - (finalResults.length * diceSpacing - 20)) / 2;
    const startY = (canvas.height - diceSize) / 2;
    const numFrames = 20; // Number of animation frames
    
    // Create array of dice positions and rotations
    const dice = finalResults.map((finalValue, index) => {
        return {
            x: startX + index * diceSpacing,
            y: startY - 150, // Start above final position
            size: diceSize,
            rotation: 0,
            speedX: (Math.random() - 0.5) * 10,
            speedY: Math.random() * 5 + 5,
            rotationSpeed: Math.random() * 0.5 + 0.1,
            value: 1, // Start with random value
            finalValue: finalValue,
            finalX: startX + index * diceSpacing,
            finalY: startY
        };
    });
    
    // Animation variables
    let frame = 0;
    
    // Animation function
    function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card-bg');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid pattern for table
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 1;
        
        // Draw grid
        const gridSize = 50;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw concentric circles
        ctx.strokeStyle = '#3c4a61';
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) * 0.8;
        
        for (let radius = maxRadius; radius > 0; radius -= 50) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Update and draw each die
        dice.forEach((die, index) => {
            if (frame < numFrames - 5) {
                // During animation, dice are falling and spinning
                die.y += die.speedY;
                die.x += die.speedX;
                die.rotation += die.rotationSpeed;
                
                // Change value during animation
                if (frame % 3 === 0) {
                    let maxValue;
                    switch(diceType) {
                        case 'd4': maxValue = 4; break;
                        case 'd6': maxValue = 6; break;
                        case 'd8': maxValue = 8; break;
                        case 'd10': maxValue = 10; break;
                        case 'd12': maxValue = 12; break;
                        case 'd20': maxValue = 20; break;
                        case 'd100': maxValue = 100; break;
                        default: maxValue = 20;
                    }
                    die.value = Math.floor(Math.random() * maxValue) + 1;
                }
                
                // Bounce off sides
                if (die.x < 0 || die.x > canvas.width - die.size) {
                    die.speedX *= -0.8;
                }
                
                // Slow down
                die.speedY *= 0.9;
                die.speedX *= 0.9;
                die.rotationSpeed *= 0.9;
            } else {
                // In final frames, snap to final position and value
                const progress = (frame - (numFrames - 5)) / 5;
                die.x = die.x * (1 - progress) + die.finalX * progress;
                die.y = die.y * (1 - progress) + die.finalY * progress;
                die.rotation *= (1 - progress);
                die.value = die.finalValue;
            }
            
            // Draw die with current position, rotation and value
            ctx.save();
            ctx.translate(die.x + die.size/2, die.y + die.size/2);
            ctx.rotate(die.rotation);
            ctx.translate(-(die.x + die.size/2), -(die.y + die.size/2));
            drawDice(ctx, diceType, die.value, die.x, die.y, die.size);
            ctx.restore();
        });
        
        // Continue animation if not finished
        frame++;
        if (frame < numFrames) {
            requestAnimationFrame(animate);
        }
    }
    
    // Start animation
    animate();
}

// Draw a single die
function drawDice(ctx, diceType, value, x, y, size) {
    // Set colors based on dice type
    let diceColor;
    switch(diceType) {
        case 'd4': diceColor = '#8b5cf6'; break; // Purple
        case 'd6': diceColor = '#3b82f6'; break; // Blue
        case 'd8': diceColor = '#10b981'; break; // Green
        case 'd10': diceColor = '#ef4444'; break; // Red
        case 'd12': diceColor = '#f59e0b'; break; // Amber
        case 'd20': diceColor = '#6366f1'; break; // Indigo
        case 'd100': diceColor = '#ec4899'; break; // Pink
        default: diceColor = '#6366f1'; // Default to Indigo
    }
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + size/2 + 5, y + size + 5, size/2, size/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw shape based on dice type
    ctx.fillStyle = diceColor;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Add gradient for 3D effect
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, lightenColor(diceColor, 20));
    gradient.addColorStop(1, darkenColor(diceColor, 20));
    ctx.fillStyle = gradient;
    
    switch(diceType) {
        case 'd4':
            // Draw a triangle
            ctx.beginPath();
            ctx.moveTo(x + size/2, y);
            ctx.lineTo(x, y + size);
            ctx.lineTo(x + size, y + size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Add highlight
            ctx.beginPath();
            ctx.moveTo(x + size/2, y + 5);
            ctx.lineTo(x + 10, y + size - 10);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
            break;
            
        case 'd6':
            // Draw a square with 3D effect
            // Top face
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 10);
            ctx.lineTo(x + size - 10, y + 10);
            ctx.lineTo(x + size - 10, y + size - 10);
            ctx.lineTo(x + 10, y + size - 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Front face
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x + size - 10, y + 10);
            ctx.lineTo(x + 10, y + 10);
            ctx.closePath();
            ctx.fillStyle = lightenColor(diceColor, 30);
            ctx.fill();
            ctx.stroke();
            
            // Side face
            ctx.beginPath();
            ctx.moveTo(x + size, y);
            ctx.lineTo(x + size, y + size);
            ctx.lineTo(x + size - 10, y + size - 10);
            ctx.lineTo(x + size - 10, y + 10);
            ctx.closePath();
            ctx.fillStyle = darkenColor(diceColor, 30);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'd8':
            // Draw an octagon
            ctx.beginPath();
            const octRadius = size/2;
            const octCenter = {x: x + size/2, y: y + size/2};
            for (let i = 0; i < 8; i++) {
                const angle = i * Math.PI / 4;
                const pointX = octCenter.x + octRadius * Math.cos(angle);
                const pointY = octCenter.y + octRadius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(pointX, pointY);
                } else {
                    ctx.lineTo(pointX, pointY);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Add highlight
            ctx.beginPath();
            ctx.moveTo(octCenter.x - octRadius/2, octCenter.y - octRadius/2);
            ctx.lineTo(octCenter.x + octRadius/2, octCenter.y - octRadius/2);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
            break;
            
        case 'd10':
        case 'd100':
            // Draw a pentagon
            ctx.beginPath();
            const pentRadius = size/2;
            const pentCenter = {x: x + size/2, y: y + size/2};
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - Math.PI/2;
                const pointX = pentCenter.x + pentRadius * Math.cos(angle);
                const pointY = pentCenter.y + pentRadius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(pointX, pointY);
                } else {
                    ctx.lineTo(pointX, pointY);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // For d100, add '%' after number
            if (diceType === 'd100') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(pentCenter.x, pentCenter.y, pentRadius * 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
            
        case 'd12':
            // Draw a dodecagon with 3D effect
            ctx.beginPath();
            const dodecRadius = size/2 * 0.9;
            const dodecCenter = {x: x + size/2, y: y + size/2};
            for (let i = 0; i < 12; i++) {
                const angle = i * Math.PI / 6;
                const pointX = dodecCenter.x + dodecRadius * Math.cos(angle);
                const pointY = dodecCenter.y + dodecRadius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(pointX, pointY);
                } else {
                    ctx.lineTo(pointX, pointY);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Add inner lines for 3D effect
            for (let i = 0; i < 6; i++) {
                const angle = i * Math.PI / 3;
                const startX = dodecCenter.x + dodecRadius * 0.3 * Math.cos(angle);
                const startY = dodecCenter.y + dodecRadius * 0.3 * Math.sin(angle);
                const endX = dodecCenter.x + dodecRadius * Math.cos(angle);
                const endY = dodecCenter.y + dodecRadius * Math.sin(angle);
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.stroke();
            }
            break;
            
        case 'd20':
            // Draw an icosahedron-like shape
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2 * 0.95, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Add inner lines for 3D effect
            const d20Center = {x: x + size/2, y: y + size/2};
            const d20Radius = size/2 * 0.95;
            
            // Draw triangular facets
            for (let i = 0; i < 5; i++) {
                const angle1 = i * Math.PI * 2 / 5;
                const angle2 = ((i + 1) % 5) * Math.PI * 2 / 5;
                
                const x1 = d20Center.x + Math.cos(angle1) * d20Radius;
                const y1 = d20Center.y + Math.sin(angle1) * d20Radius;
                const x2 = d20Center.x + Math.cos(angle2) * d20Radius;
                const y2 = d20Center.y + Math.sin(angle2) * d20Radius;
                
                ctx.beginPath();
                ctx.moveTo(d20Center.x, d20Center.y);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.stroke();
            }
            break;
    }
    
    // Draw the number
    ctx.fillStyle = 'white';
    ctx.font = 'bold ' + (size/2) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toString(), x + size/2, y + size/2);
    
    // Add a small highlight for 3D effect
    if (diceType !== 'd4') {
        ctx.beginPath();
        ctx.arc(x + size/3, y + size/3, size/10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }
}

// Helper function to lighten a color
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
        0x1000000 + 
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

// Helper function to darken a color
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (
        0x1000000 + 
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

// Clear dice results
function clearDice() {
    // Clear canvas
    const canvas = document.getElementById('dice-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset results display
    document.getElementById('dice-result').innerHTML = '<span>Roll the dice to see results</span>';
    document.getElementById('dice-total').innerHTML = '<span>Total: 0</span>';
}

// Save roll to database
function saveRollToDatabase(diceCount, diceType, results, modifier, total) {
    // Prepare data
    const rollData = {
        roll: `${diceCount}${diceType}`,
        total: total,
        action: `Rolled ${diceCount} ${diceType}`,
        rolls_json: JSON.stringify(results),
        modifier: modifier
    };
    
    console.log("Saving roll to database:", rollData);
    
    // Send to API
    fetch('api/roll.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rollData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Roll saved:', data);
    })
    .catch(error => {
        console.error('Error saving roll:', error);
    });
}