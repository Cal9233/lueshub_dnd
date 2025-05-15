// LuesHub D&D 3D Dice Roller

// Global variables
let scene, camera, renderer, physicsWorld;
let diceObjects = [];
let diceResults = {};
let isDragging = false;
let rollInProgress = false;
let selectedDiceType = null;
let canvasContainer = null;
let lastMousePosition = { x: 0, y: 0 };
let diceMeshes = {}; // Cache for loaded dice meshes
let diceBodyMaterials = {};
let tableBody, floorBody, wallBodies = [];

// Constants
const DICE_MASS = 300;
const THROW_FORCE_FACTOR = 20;
const DICE_SCALE = 0.5;
const TABLE_SIZE = 50;
const WALL_HEIGHT = 5;
const WALL_THICKNESS = 2;

// Dice faces configuration
const DICE_FACE_CONFIG = {
    d4: [1, 2, 3, 4],
    d6: [1, 2, 3, 4, 5, 6],
    d8: [1, 2, 3, 4, 5, 6, 7, 8],
    d10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0], // 0 represents 10
    d12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    d20: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    d100: [10, 20, 30, 40, 50, 60, 70, 80, 90, 0] // 0 represents 100
};

// Dice Colors
const DICE_COLORS = {
    d4: 0x8b5cf6,  // Purple
    d6: 0x3b82f6,  // Blue
    d8: 0x10b981,  // Green
    d10: 0xef4444, // Red
    d12: 0xf59e0b, // Amber
    d20: 0x6366f1, // Indigo
    d100: 0xec4899 // Pink
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI event listeners
    initUI();
    
    try {
        // Initialize 3D scene
        initPhysics();
        initScene();
        
        // Add event listeners
        window.addEventListener('resize', onWindowResize);
        
        // Start animation loop
        animate();
        
        // Show the canvas and hide loading overlay immediately
        document.getElementById('loading-overlay').style.display = 'none';
    } catch (error) {
        console.error("Error initializing 3D dice:", error);
        
        // Show error message and fallback to 2D
        document.getElementById('loading-overlay').innerHTML = `
            <i class="fas fa-dice"></i>
            <p>Using 2D dice roller instead. Click "Roll Dice" to start.</p>
        `;
        
        // Set up fallback 2D dice
        setupFallback2DDice();
    }
});

// Setup fallback 2D dice system
function setupFallback2DDice() {
    // Get the roll button
    const rollButton = document.getElementById('roll-dice');
    
    // Override the roll dice function
    window.rollDice = function() {
        // Get user input values
        const diceCount = parseInt(document.getElementById('dice-count').value);
        const modifier = parseInt(document.getElementById('dice-modifier').value);
        const diceType = selectedDiceType || 'd20';
        
        // Validate inputs
        if (diceCount <= 0 || diceCount > 10) return;
        
        // Get max value based on dice type
        const maxValue = parseInt(diceType.substring(1));
        
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
        let resultText = `${diceCount}${diceType}: [${results.join(', ')}]`;
        if (modifier !== 0) {
            resultText += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
        }
        
        // Update UI
        document.getElementById('dice-result').innerHTML = `<span>${resultText}</span>`;
        document.getElementById('dice-total').innerHTML = `<span>Total: ${total}</span>`;
        
        // Add to roll history
        const rollLog = document.getElementById('roll-log');
        const entry = document.createElement('div');
        entry.className = 'roll-log-entry';
        
        entry.innerHTML = `
            <div class="roll-log-dice">${diceCount}${diceType}</div>
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
        const rollData = {
            roll: `${diceCount}${diceType}`,
            total: total,
            action: `Rolled ${diceCount} ${diceType}`,
            rolls_json: JSON.stringify(results),
            modifier: modifier
        };
        
        // Send to API
        fetch('api/roll.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rollData)
        })
        .catch(error => {
            console.error('Error saving roll:', error);
        });
    };
    
    // Handle clear dice
    const clearButton = document.getElementById('clear-dice');
    clearButton.addEventListener('click', function() {
        document.getElementById('dice-result').innerHTML = `<span>Roll the dice to see results</span>`;
        document.getElementById('dice-total').innerHTML = `<span>Total: 0</span>`;
    });
}

// Initialize UI elements and event handlers
function initUI() {
    // Get DOM elements
    canvasContainer = document.getElementById('dice-canvas-container');
    const rollButton = document.getElementById('roll-dice');
    const clearButton = document.getElementById('clear-dice');
    const diceItems = document.querySelectorAll('.dice-item');
    const increaseBtn = document.getElementById('increase-dice');
    const decreaseBtn = document.getElementById('decrease-dice');
    const increaseMod = document.getElementById('increase-mod');
    const decreaseMod = document.getElementById('decrease-mod');
    
    // Select d20 by default
    selectDiceType('d20');
    
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
    
    // Canvas mouse events for throwing dice
    canvasContainer.addEventListener('mousedown', onMouseDown);
    canvasContainer.addEventListener('mousemove', onMouseMove);
    canvasContainer.addEventListener('mouseup', onMouseUp);
    
    // Touch events for mobile
    canvasContainer.addEventListener('touchstart', onTouchStart);
    canvasContainer.addEventListener('touchmove', onTouchMove);
    canvasContainer.addEventListener('touchend', onTouchEnd);
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

// Initialize physics world using Cannon.js
function initPhysics() {
    try {
        // Create world with gravity
        physicsWorld = new CANNON.World();
        physicsWorld.gravity.set(0, -9.82 * 2, 0); // Earth gravity doubled for faster settling
        physicsWorld.broadphase = new CANNON.NaiveBroadphase();
        physicsWorld.solver.iterations = 10;
        physicsWorld.allowSleep = true;
    } catch (error) {
        console.error('Error initializing physics:', error);
        document.getElementById('loading-overlay').innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error initializing physics engine. Please try refreshing the page.</p>
        `;
        return;
    }
    
    // Create table surface
    const tableShape = new CANNON.Box(new CANNON.Vec3(TABLE_SIZE/2, 1, TABLE_SIZE/2));
    tableBody = new CANNON.Body({
        mass: 0, // Static body
        position: new CANNON.Vec3(0, -1, 0)
    });
    tableBody.addShape(tableShape);
    physicsWorld.addBody(tableBody);
    
    // Create invisible floor below the table (to catch falling dice)
    const floorShape = new CANNON.Box(new CANNON.Vec3(TABLE_SIZE, 1, TABLE_SIZE));
    floorBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(0, -50, 0)
    });
    floorBody.addShape(floorShape);
    physicsWorld.addBody(floorBody);
    
    // Create walls to keep dice on the table
    createWalls();
    
    // Check if CANNON is loaded properly, if not show error
    if (typeof CANNON === 'undefined') {
        console.error('CANNON is not defined! Physics library not loaded.');
        document.getElementById('loading-overlay').innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>Error loading physics engine. Please try refreshing the page.</p>
        `;
        return;
    }
    
    // Create materials for dice
    const diceTypes = Object.keys(DICE_FACE_CONFIG);
    for (const type of diceTypes) {
        diceBodyMaterials[type] = new CANNON.Material(type + 'Material');
    }
    
    // Create table material
    const tableMaterial = new CANNON.Material('tableMaterial');
    tableBody.material = tableMaterial;
    
    // Create contact materials with increased friction and restitution
    for (const type of diceTypes) {
        const contactMaterial = new CANNON.ContactMaterial(
            diceBodyMaterials[type],
            tableMaterial,
            {
                friction: 0.5,
                restitution: 0.3
            }
        );
        physicsWorld.addContactMaterial(contactMaterial);
    }
}

// Create walls around the table
function createWalls() {
    // Define wall dimensions
    const wallOptions = [
        // Position format: [x, y, z, width, height, depth]
        [0, WALL_HEIGHT/2, TABLE_SIZE/2 + WALL_THICKNESS/2, TABLE_SIZE, WALL_HEIGHT, WALL_THICKNESS],  // Front
        [0, WALL_HEIGHT/2, -TABLE_SIZE/2 - WALL_THICKNESS/2, TABLE_SIZE, WALL_HEIGHT, WALL_THICKNESS], // Back
        [TABLE_SIZE/2 + WALL_THICKNESS/2, WALL_HEIGHT/2, 0, WALL_THICKNESS, WALL_HEIGHT, TABLE_SIZE],  // Right
        [-TABLE_SIZE/2 - WALL_THICKNESS/2, WALL_HEIGHT/2, 0, WALL_THICKNESS, WALL_HEIGHT, TABLE_SIZE]  // Left
    ];
    
    wallOptions.forEach(wall => {
        const [x, y, z, width, height, depth] = wall;
        const wallShape = new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
        const wallBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(x, y, z)
        });
        wallBody.addShape(wallShape);
        physicsWorld.addBody(wallBody);
        wallBodies.push(wallBody);
    });
}

// Initialize Three.js scene, camera, and renderer
function initScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x283141); // Dark blue-gray background
    
    // Create camera
    camera = new THREE.PerspectiveCamera(45, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    camera.position.set(0, 30, 30);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('dice-canvas'),
        antialias: true
    });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    
    // Add lights
    addLights();
    
    // Create table surface
    createTable();
    
    // Create orbit controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Limit camera below horizontal
    controls.minDistance = 10;
    controls.maxDistance = 50;
    
    // Preload dice models
    preloadDiceModels();
}

// Add lights to the scene
function addLights() {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Directional light for shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Point lights at corners of the table
    const pointLightPositions = [
        [TABLE_SIZE/2 - 5, 15, TABLE_SIZE/2 - 5],
        [TABLE_SIZE/2 - 5, 15, -TABLE_SIZE/2 + 5],
        [-TABLE_SIZE/2 + 5, 15, TABLE_SIZE/2 - 5],
        [-TABLE_SIZE/2 + 5, 15, -TABLE_SIZE/2 + 5]
    ];
    
    pointLightPositions.forEach((pos, index) => {
        const [x, y, z] = pos;
        const pointLight = new THREE.PointLight(0xffffff, 0.3, 100);
        pointLight.position.set(x, y, z);
        scene.add(pointLight);
    });
}

// Create 3D table
function createTable() {
    // Create table surface
    const tableGeometry = new THREE.BoxGeometry(TABLE_SIZE, 2, TABLE_SIZE);
    const tableMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2d3748,  // Dark blue-gray
        roughness: 0.7,
        metalness: 0.1
    });
    const tableMesh = new THREE.Mesh(tableGeometry, tableMaterial);
    tableMesh.position.set(0, -1, 0);
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);
    
    // Create table border
    const borderOptions = [
        // Position format: [x, y, z, width, height, depth]
        [0, WALL_HEIGHT/2, TABLE_SIZE/2 + WALL_THICKNESS/2, TABLE_SIZE, WALL_HEIGHT, WALL_THICKNESS],  // Front
        [0, WALL_HEIGHT/2, -TABLE_SIZE/2 - WALL_THICKNESS/2, TABLE_SIZE, WALL_HEIGHT, WALL_THICKNESS], // Back
        [TABLE_SIZE/2 + WALL_THICKNESS/2, WALL_HEIGHT/2, 0, WALL_THICKNESS, WALL_HEIGHT, TABLE_SIZE],  // Right
        [-TABLE_SIZE/2 - WALL_THICKNESS/2, WALL_HEIGHT/2, 0, WALL_THICKNESS, WALL_HEIGHT, TABLE_SIZE]  // Left
    ];
    
    const borderMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a5568,  // Medium blue-gray
        roughness: 0.8,
        metalness: 0.2
    });
    
    borderOptions.forEach(border => {
        const [x, y, z, width, height, depth] = border;
        const borderGeometry = new THREE.BoxGeometry(width, height, depth);
        const borderMesh = new THREE.Mesh(borderGeometry, borderMaterial);
        borderMesh.position.set(x, y, z);
        borderMesh.castShadow = true;
        borderMesh.receiveShadow = true;
        scene.add(borderMesh);
    });
    
    // Add some visual cues to the table
    addTableDecoration();
}

// Add decorative elements to the table
function addTableDecoration() {
    // Add a subtle grid pattern on the table
    const gridSize = TABLE_SIZE;
    const gridDivisions = 20;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x4a5568, 0x4a5568);
    gridHelper.position.y = 0.01; // Slightly above the table surface to avoid z-fighting
    scene.add(gridHelper);
    
    // Add a custom texture or pattern to the table surface
    const textureSize = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const ctx = canvas.getContext('2d');
    
    // Fill with base color
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, textureSize, textureSize);
    
    // Create a subtle pattern
    ctx.strokeStyle = '#3c4a61';
    ctx.lineWidth = 2;
    
    // Create a circular pattern
    const centerX = textureSize / 2;
    const centerY = textureSize / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;
    
    // Draw concentric circles
    for (let radius = maxRadius; radius > 0; radius -= 50) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Convert canvas to texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    // Apply texture to the table
    const tableTop = new THREE.Mesh(
        new THREE.PlaneGeometry(TABLE_SIZE, TABLE_SIZE),
        new THREE.MeshStandardMaterial({ 
            map: texture,
            roughness: 0.7,
            metalness: 0.1
        })
    );
    tableTop.rotation.x = -Math.PI / 2;
    tableTop.position.y = 0.02; // Slightly above the table to avoid z-fighting
    tableTop.receiveShadow = true;
    scene.add(tableTop);
}

// Preload dice models
function preloadDiceModels() {
    const diceTypes = Object.keys(DICE_FACE_CONFIG);
    
    diceTypes.forEach(type => {
        const geometry = createDiceGeometry(type);
        const material = new THREE.MeshStandardMaterial({
            color: DICE_COLORS[type],
            roughness: 0.5,
            metalness: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.scale.set(DICE_SCALE, DICE_SCALE, DICE_SCALE);
        
        // Create text textures for dice faces
        applyTextToFaces(mesh, type);
        
        // Store preloaded mesh
        diceMeshes[type] = mesh;
    });
}

// Create geometry for different dice types
function createDiceGeometry(diceType) {
    let geometry;
    
    switch(diceType) {
        case 'd4':
            geometry = new THREE.TetrahedronGeometry(2);
            break;
        case 'd6':
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
        case 'd8':
            geometry = new THREE.OctahedronGeometry(2);
            break;
        case 'd10':
            geometry = createD10Geometry();
            break;
        case 'd12':
            geometry = new THREE.DodecahedronGeometry(2);
            break;
        case 'd20':
            geometry = new THREE.IcosahedronGeometry(2);
            break;
        case 'd100':
            geometry = createD10Geometry(); // d100 uses same shape as d10
            break;
        default:
            geometry = new THREE.BoxGeometry(2, 2, 2);
    }
    
    return geometry;
}

// Special case for d10 (10-sided die)
function createD10Geometry() {
    // Create a custom pentagonal trapezohedron for d10
    const pentagonalTrapezohedron = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];

    // Define the vertices for a pentagonal trapezohedron (simplified version)
    // Top and bottom vertices
    vertices.push(0, 1.5, 0);  // Top vertex (0)
    vertices.push(0, -1.5, 0); // Bottom vertex (1)
    
    // Middle ring of vertices (pentagon at the equator)
    const pentagonRadius = 1.2;
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5;
        const x = Math.cos(angle) * pentagonRadius;
        const z = Math.sin(angle) * pentagonRadius;
        vertices.push(x, 0, z);  // Equator vertices (2-6)
    }
    
    // Offset ring of vertices (pentagon above the equator)
    const offsetY = 0.7;
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 + Math.PI / 5;
        const x = Math.cos(angle) * pentagonRadius * 0.8;
        const z = Math.sin(angle) * pentagonRadius * 0.8;
        vertices.push(x, offsetY, z);  // Upper offset vertices (7-11)
    }
    
    // Offset ring of vertices (pentagon below the equator)
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 + Math.PI / 5;
        const x = Math.cos(angle) * pentagonRadius * 0.8;
        const z = Math.sin(angle) * pentagonRadius * 0.8;
        vertices.push(x, -offsetY, z);  // Lower offset vertices (12-16)
    }
    
    // Define triangular faces for the top half
    for (let i = 0; i < 5; i++) {
        const nextI = (i + 1) % 5;
        indices.push(0, i + 7, (nextI) + 7);  // Top vertex to upper offset
        indices.push(i + 2, i + 7, 0);        // Top vertex connection
        indices.push(i + 2, (nextI) + 2, i + 7); // Equator to upper offset
        indices.push((nextI) + 2, (nextI) + 7, i + 7); // Complete the face
    }
    
    // Define triangular faces for the bottom half
    for (let i = 0; i < 5; i++) {
        const nextI = (i + 1) % 5;
        indices.push(1, (nextI) + 12, i + 12);  // Bottom vertex to lower offset
        indices.push(i + 2, 1, i + 12);        // Bottom vertex connection
        indices.push(i + 2, i + 12, (nextI) + 2); // Equator to lower offset
        indices.push((nextI) + 2, i + 12, (nextI) + 12); // Complete the face
    }
    
    // Set up the geometry
    pentagonalTrapezohedron.setIndex(indices);
    pentagonalTrapezohedron.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    pentagonalTrapezohedron.computeVertexNormals();
    
    return pentagonalTrapezohedron;
}

// Apply text to dice faces
function applyTextToFaces(mesh, diceType) {
    // Create text textures for faces based on dice type
    const faces = DICE_FACE_CONFIG[diceType];
    
    // The text application depends on the dice type
    // This is a simplified version - in a full implementation you'd have specific 
    // mapping for each dice type based on its geometry
    
    // For demo purposes, we'll use geometry groups
    if (mesh.geometry.groups) {
        mesh.geometry.groups.forEach((group, i) => {
            if (i < faces.length) {
                // Create canvas for text
                const canvas = document.createElement('canvas');
                canvas.width = 128;
                canvas.height = 128;
                const ctx = canvas.getContext('2d');
                
                // Fill with dice color but slightly lighter
                const color = DICE_COLORS[diceType];
                const colorHex = '#' + color.toString(16).padStart(6, '0');
                ctx.fillStyle = colorHex;
                ctx.fillRect(0, 0, 128, 128);
                
                // Add text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 80px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(faces[i].toString(), 64, 64);
                
                // Create texture from canvas
                const texture = new THREE.CanvasTexture(canvas);
                
                // Create material with texture
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.5,
                    metalness: 0.2
                });
                
                // Apply to this group
                if (!mesh.material.length) {
                    mesh.material = [];
                    for (let j = 0; j < mesh.geometry.groups.length; j++) {
                        mesh.material.push(mesh.material.clone());
                    }
                }
                
                mesh.material[i] = material;
            }
        });
    }
}

// Create physics body for dice
function createDiceBody(diceType, position) {
    let shape;
    
    // Create appropriate physics shape based on dice type
    switch(diceType) {
        case 'd4':
            shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1)); // Simplified
            break;
        case 'd6':
            shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
            break;
        case 'd8':
            shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1)); // Simplified
            break;
        case 'd10':
        case 'd100':
            shape = new CANNON.Cylinder(1, 1, 2, 10); // Simplified
            break;
        case 'd12':
            shape = new CANNON.Box(new CANNON.Vec3(1.2, 1.2, 1.2)); // Simplified
            break;
        case 'd20':
            shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1)); // Simplified
            break;
        default:
            shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    }
    
    // Create body with appropriate mass
    const body = new CANNON.Body({
        mass: DICE_MASS,
        position: new CANNON.Vec3(position.x, position.y, position.z),
        material: diceBodyMaterials[diceType],
        angularDamping: 0.1,
        linearDamping: 0.1,
        allowSleep: true,
        sleepSpeedLimit: 0.5,
        sleepTimeLimit: 0.1
    });
    
    body.addShape(shape);
    
    // Store the dice type in userData
    body.userData = { diceType };
    
    // Add to physics world
    physicsWorld.addBody(body);
    
    return body;
}

// Add a new die to the scene
function addDie(diceType, position = { x: 0, y: 10, z: 0 }) {
    // Clone the preloaded mesh
    const mesh = diceMeshes[diceType].clone();
    mesh.position.copy(position);
    scene.add(mesh);
    
    // Create physics body
    const body = createDiceBody(diceType, position);
    
    // Add to dice objects array
    diceObjects.push({ 
        mesh, 
        body, 
        diceType,
        isResting: false
    });
    
    return { mesh, body };
}

// Roll the dice
function rollDice() {
    if (rollInProgress) return;
    
    // Get user input values
    const diceCount = parseInt(document.getElementById('dice-count').value);
    const modifier = parseInt(document.getElementById('dice-modifier').value);
    
    // Validate inputs
    if (!selectedDiceType || diceCount <= 0 || diceCount > 10) return;
    
    // Begin new roll
    rollInProgress = true;
    clearDice(); // Clear existing dice
    diceResults = {};
    
    // Position spacing for multiple dice
    const spacing = 2;
    const startPos = {
        x: -spacing * (diceCount - 1) / 2,
        y: 15, // Height above table
        z: -5
    };
    
    // Add the requested number of dice
    for (let i = 0; i < diceCount; i++) {
        const position = {
            x: startPos.x + i * spacing,
            y: startPos.y + Math.random() * 2,
            z: startPos.z + Math.random() * 2
        };
        
        const die = addDie(selectedDiceType, position);
        
        // Apply random rotation and force
        const angle = Math.random() * Math.PI * 2;
        die.body.quaternion.setFromAxisAngle(
            new CANNON.Vec3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize(),
            angle
        );
        
        // Apply random initial force and torque
        die.body.applyLocalForce(
            new CANNON.Vec3(
                (Math.random() - 0.5) * THROW_FORCE_FACTOR,
                -THROW_FORCE_FACTOR / 2,
                THROW_FORCE_FACTOR
            ),
            new CANNON.Vec3(0, 0, 0)
        );
        
        die.body.angularVelocity.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
    }
    
    // Store the roll configuration for result calculation
    diceResults = {
        diceType: selectedDiceType,
        count: diceCount,
        modifier: modifier,
        values: [],
        completed: false,
        timestamp: new Date().toLocaleTimeString()
    };
    
    // Update UI with "Rolling..." status
    updateResultsUI("Rolling dice...", "");
    
    // Check for results after dice have settled
    checkDiceResults();
}

// Clear all dice from the scene
function clearDice() {
    // Remove dice meshes from scene
    for (const die of diceObjects) {
        scene.remove(die.mesh);
        physicsWorld.removeBody(die.body);
    }
    
    // Clear array
    diceObjects = [];
    
    // Reset results display
    updateResultsUI("Roll the dice to see results", "Total: 0");
}

// Check if dice have settled and calculate results
function checkDiceResults() {
    if (!rollInProgress || diceObjects.length === 0) return;
    
    // Count how many dice are still moving
    let movingDice = 0;
    
    diceObjects.forEach(die => {
        const velocity = die.body.velocity.norm();
        const angularVelocity = die.body.angularVelocity.norm();
        
        // Check if this die is still moving significantly
        if (velocity > 0.1 || angularVelocity > 0.1) {
            movingDice++;
            die.isResting = false;
        } else if (!die.isResting) {
            // Die just came to rest - determine its value
            die.isResting = true;
            determineDiceValue(die);
        }
    });
    
    // If all dice have stopped moving
    if (movingDice === 0) {
        // Calculate final results if not already done
        if (!diceResults.completed) {
            // Ensure all dice have values
            if (diceResults.values.length === diceObjects.length) {
                calculateFinalResults();
            } else {
                // Force calculation of any missing values
                diceObjects.forEach(die => {
                    if (!die.result) {
                        determineDiceValue(die);
                    }
                });
                calculateFinalResults();
            }
        }
    } else {
        // Check again in a short time
        setTimeout(checkDiceResults, 500);
    }
}

// Determine the value of a die based on its final orientation
function determineDiceValue(die) {
    // In a complete implementation, this would use raycasting or orientation
    // to determine which face is up. For this demo, we'll use a simplified approach.
    
    // Get dice faces for this dice type
    const faces = DICE_FACE_CONFIG[die.diceType];
    
    // For this demo, we'll generate a random but weighted result
    let result;
    
    // Simple implementation - in a real app, you'd determine the face by physics orientation
    if (die.diceType === 'd20' && Math.random() < 0.05) {
        // 5% chance of natural 20
        result = 20;
    } else if (die.diceType === 'd20' && Math.random() < 0.05) {
        // 5% chance of natural 1
        result = 1;
    } else {
        // Otherwise random
        result = faces[Math.floor(Math.random() * faces.length)];
        
        // Handle special cases
        if (die.diceType === 'd10' && result === 0) result = 10;
        if (die.diceType === 'd100' && result === 0) result = 100;
    }
    
    // Store the result on the die object
    die.result = result;
    
    // Add to results array if not already there
    if (!diceResults.values.includes(result)) {
        diceResults.values.push(result);
    }
}

// Calculate final roll results
function calculateFinalResults() {
    if (!diceResults || diceResults.completed) return;
    
    // Calculate sum
    let sum = 0;
    for (const value of diceResults.values) {
        // Handle d100 specially (multiply by 10)
        if (diceResults.diceType === 'd100') {
            sum += value;
        } else {
            sum += value;
        }
    }
    
    // Add modifier
    const total = sum + diceResults.modifier;
    
    // Update results
    diceResults.sum = sum;
    diceResults.total = total;
    diceResults.completed = true;
    
    // Update UI
    updateResultsUI(
        formatDiceResults(),
        `Total: ${total}`
    );
    
    // Add to roll history
    addToRollHistory();
    
    // Roll is complete
    rollInProgress = false;
    
    // Save roll to database if user is logged in
    saveRollToDatabase();
}

// Format dice results for display
function formatDiceResults() {
    if (!diceResults || !diceResults.completed) return "";
    
    const { diceType, values, modifier } = diceResults;
    
    // Basic format: "2d20: [15, 8] + 3 = 26"
    let result = `${diceResults.count}${diceType}: [${values.join(', ')}]`;
    
    // Add modifier if non-zero
    if (modifier !== 0) {
        result += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
    }
    
    return result;
}

// Add roll to history log
function addToRollHistory() {
    const rollLog = document.getElementById('roll-log');
    const entry = document.createElement('div');
    entry.className = 'roll-log-entry';
    
    entry.innerHTML = `
        <div class="roll-log-dice">${diceResults.count}${diceResults.diceType}</div>
        <div class="roll-log-result">[${diceResults.values.join(', ')}]</div>
        <div class="roll-log-total">Total: ${diceResults.total}</div>
    `;
    
    // Add to top of log
    rollLog.insertBefore(entry, rollLog.firstChild);
    
    // Limit history length
    while (rollLog.children.length > 10) {
        rollLog.removeChild(rollLog.lastChild);
    }
}

// Update results UI
function updateResultsUI(result, total) {
    document.getElementById('dice-result').innerHTML = `<span>${result}</span>`;
    document.getElementById('dice-total').innerHTML = `<span>${total}</span>`;
}

// Save roll to database
function saveRollToDatabase() {
    // Only save completed rolls
    if (!diceResults || !diceResults.completed) return;
    
    // Prepare data
    const rollData = {
        roll: `${diceResults.count}${diceResults.diceType}`,
        total: diceResults.total,
        action: `Rolled ${diceResults.count} ${diceResults.diceType}`,
        rolls_json: JSON.stringify(diceResults.values),
        modifier: diceResults.modifier
    };
    
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

// Mouse events for manual dice throwing
function onMouseDown(event) {
    isDragging = true;
    lastMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (!isDragging) return;
    
    // Track mouse movement
    const mousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    
    // Calculate movement
    const deltaX = mousePosition.x - lastMousePosition.x;
    const deltaY = mousePosition.y - lastMousePosition.y;
    
    // Store current position
    lastMousePosition = mousePosition;
}

function onMouseUp(event) {
    if (!isDragging) return;
    isDragging = false;
    
    // Check if we should throw dice
    const mousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    
    // Calculate throw velocity
    const deltaX = mousePosition.x - lastMousePosition.x;
    const deltaY = mousePosition.y - lastMousePosition.y;
    
    // If enough velocity, roll dice
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        // Manual throw not implemented in this demo
        rollDice();
    }
}

// Touch events (adapted from mouse events)
function onTouchStart(event) {
    if (event.touches.length === 1) {
        isDragging = true;
        lastMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
}

function onTouchMove(event) {
    if (!isDragging || event.touches.length !== 1) return;
    
    // Prevent scrolling
    event.preventDefault();
    
    // Track touch movement
    const touchPosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
    };
    
    // Calculate movement
    const deltaX = touchPosition.x - lastMousePosition.x;
    const deltaY = touchPosition.y - lastMousePosition.y;
    
    // Store current position
    lastMousePosition = touchPosition;
}

function onTouchEnd(event) {
    if (!isDragging) return;
    isDragging = false;
    
    // Simple tap is equivalent to clicking roll button
    rollDice();
}

// Handle window resize
function onWindowResize() {
    // Update camera
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    
    // Update renderer
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Step physics simulation
    physicsWorld.step(1/60);
    
    // Update dice positions
    diceObjects.forEach(die => {
        die.mesh.position.copy(die.body.position);
        die.mesh.quaternion.copy(die.body.quaternion);
    });
    
    // Render scene
    renderer.render(scene, camera);
}