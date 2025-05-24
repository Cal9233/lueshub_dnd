// Isometric 3D Dice Roller
class IsometricDiceRoller {
    constructor() {
        // Scene elements
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Physics world
        this.world = null;
        this.diceObjects = [];
        this.diceResults = {};
        
        // Container reference
        this.container = document.getElementById('dice-canvas-container');
        
        // Dice materials
        this.diceMaterials = {};
        this.diceGeometries = {};
        
        // Container dimensions
        this.containerSize = {
            width: 30,
            height: 20,
            depth: 30
        };
        
        // Constants
        this.DICE_MASS = 300;
        this.DICE_SCALE = {
            d4: 1.5,
            d6: 1.2,
            d8: 1.2,
            d10: 1.0,
            d12: 1.0,
            d20: 0.9,
            d100: 1.0
        };
        
        // Dice face configuration for result detection
        this.DICE_FACE_CONFIG = {
            d4: [1, 2, 3, 4],
            d6: [1, 2, 3, 4, 5, 6],
            d8: [1, 2, 3, 4, 5, 6, 7, 8],
            d10: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],  // 0 represents 10
            d12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            d20: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            d100: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]  // Tens place (multiply by 10)
        };
        
        // Dice Colors
        this.DICE_COLORS = {
            d4: 0x8b5cf6,  // Purple
            d6: 0x3b82f6,  // Blue
            d8: 0x10b981,  // Green
            d10: 0xef4444, // Red
            d12: 0xf59e0b, // Amber
            d20: 0x6366f1, // Indigo
            d100: 0xec4899 // Pink
        };
        
        // Initialize the 3D scene
        this.init();
    }
    
    init() {
        // Create physics world
        this.initPhysics();
        
        // Create Three.js scene
        this.initScene();
        
        // Create dice materials and geometries
        this.createDiceMaterials();
        this.createDiceGeometries();
        
        // Create container walls
        this.createDiceContainer();
        
        // Start animation loop
        this.animate();
    }
    
    initPhysics() {
        // Initialize Cannon.js physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82 * 3, 0);  // Earth gravity multiplied for faster settling
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 20;
        this.world.allowSleep = true;
    }
    
    initScene() {
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x283141);  // Dark blue-gray background
        
        // Create camera - use isometric-like view
        this.camera = new THREE.PerspectiveCamera(
            40,  // FOV
            this.container.clientWidth / this.container.clientHeight,  // Aspect ratio
            0.1,  // Near plane
            1000  // Far plane
        );
        
        // Position camera for isometric-like view
        this.camera.position.set(
            this.containerSize.width * 0.8,
            this.containerSize.height * 1.5,
            this.containerSize.depth * 0.8
        );
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('dice-canvas'),
            antialias: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add lighting
        this.addLights();
        
        // Add orbit controls (limited)
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;  // Limit below horizontal
        this.controls.minDistance = 15;
        this.controls.maxDistance = 50;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light (with shadows)
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(
            this.containerSize.width/2,
            this.containerSize.height*2,
            this.containerSize.depth/2
        );
        mainLight.castShadow = true;
        
        // Configure shadow properties
        mainLight.shadow.camera.left = -this.containerSize.width;
        mainLight.shadow.camera.right = this.containerSize.width;
        mainLight.shadow.camera.top = this.containerSize.depth;
        mainLight.shadow.camera.bottom = -this.containerSize.depth;
        mainLight.shadow.camera.near = 1;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Add some fill lights from different angles
        const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight1.position.set(-this.containerSize.width, this.containerSize.height, 0);
        this.scene.add(fillLight1);
        
        const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight2.position.set(0, this.containerSize.height, -this.containerSize.depth);
        this.scene.add(fillLight2);
        
        // Add a subtle point light in the center of the container
        const pointLight = new THREE.PointLight(0xffffff, 0.4, 50);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }
    
    createDiceMaterials() {
        // Create materials for each dice type
        Object.keys(this.DICE_COLORS).forEach(diceType => {
            // Create Three.js material for visual rendering
            this.diceMaterials[diceType] = new THREE.MeshStandardMaterial({
                color: this.DICE_COLORS[diceType],
                roughness: 0.5,
                metalness: 0.2
            });
            
            // Create Cannon.js material for physics
            const physicsMaterial = new CANNON.Material();
            physicsMaterial.friction = 0.4;
            physicsMaterial.restitution = 0.3;  // Bounciness
            this.diceMaterials[diceType].physicsMaterial = physicsMaterial;
        });
    }
    
    createDiceGeometries() {
        // Create geometries for each dice type
        
        // d4 (tetrahedron)
        this.diceGeometries.d4 = new THREE.TetrahedronGeometry(2 * this.DICE_SCALE.d4);
        
        // d6 (cube)
        this.diceGeometries.d6 = new THREE.BoxGeometry(
            2 * this.DICE_SCALE.d6,
            2 * this.DICE_SCALE.d6,
            2 * this.DICE_SCALE.d6
        );
        
        // d8 (octahedron)
        this.diceGeometries.d8 = new THREE.OctahedronGeometry(2 * this.DICE_SCALE.d8);
        
        // d10 (custom - approx as modified cone)
        this.diceGeometries.d10 = this.createD10Geometry(this.DICE_SCALE.d10);
        
        // d12 (dodecahedron)
        this.diceGeometries.d12 = new THREE.DodecahedronGeometry(2 * this.DICE_SCALE.d12);
        
        // d20 (icosahedron)
        this.diceGeometries.d20 = new THREE.IcosahedronGeometry(2 * this.DICE_SCALE.d20);
        
        // d100 (percentile - same as d10 but different scale)
        this.diceGeometries.d100 = this.createD10Geometry(this.DICE_SCALE.d100);
    }
    
    createD10Geometry(scale) {
        // Create a custom 10-sided die geometry (pentagonal trapezohedron)
        const radius = 2 * scale;
        const geometry = new THREE.BufferGeometry();
        
        // Define vertices
        const vertices = [];
        
        // Top and bottom points
        vertices.push(0, radius * 1.1, 0);  // Top vertex
        vertices.push(0, -radius * 1.1, 0); // Bottom vertex
        
        // Two pentagonal rings (10 vertices)
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const y = radius * 0.5;
            
            // Upper ring
            vertices.push(
                Math.cos(angle) * radius * 0.8,
                y,
                Math.sin(angle) * radius * 0.8
            );
            
            // Lower ring
            vertices.push(
                Math.cos(angle + Math.PI / 5) * radius * 0.8,
                -y,
                Math.sin(angle + Math.PI / 5) * radius * 0.8
            );
        }
        
        // Define faces (triangles)
        const indices = [];
        
        // Top pyramid faces
        for (let i = 0; i < 5; i++) {
            const next = (i + 1) % 5;
            indices.push(0, 2 + i * 2, 2 + next * 2);
        }
        
        // Bottom pyramid faces
        for (let i = 0; i < 5; i++) {
            const next = (i + 1) % 5;
            indices.push(1, 3 + next * 2, 3 + i * 2);
        }
        
        // Side faces
        for (let i = 0; i < 5; i++) {
            const next = (i + 1) % 5;
            indices.push(2 + i * 2, 3 + i * 2, 2 + next * 2);
            indices.push(2 + next * 2, 3 + i * 2, 3 + next * 2);
        }
        
        // Create buffer attributes
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        // Calculate normals
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    createDiceContainer() {
        // Create a container for the dice
        const wallThickness = 1;
        const wallHeight = this.containerSize.height;
        
        // Floor
        const floorGeometry = new THREE.BoxGeometry(
            this.containerSize.width + wallThickness * 2,
            wallThickness,
            this.containerSize.depth + wallThickness * 2
        );
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3748,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -wallThickness / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Add physics for the floor
        const floorShape = new CANNON.Box(new CANNON.Vec3(
            (this.containerSize.width + wallThickness * 2) / 2,
            wallThickness / 2,
            (this.containerSize.depth + wallThickness * 2) / 2
        ));
        const floorBody = new CANNON.Body({
            mass: 0,  // Static body
            shape: floorShape
        });
        floorBody.position.set(0, -wallThickness / 2, 0);
        this.world.addBody(floorBody);
        
        // Define walls - [x, z, width, depth, xPos, zPos]
        const walls = [
            // Left wall
            [-this.containerSize.width / 2 - wallThickness / 2, 0, wallThickness, this.containerSize.depth + wallThickness * 2],
            // Right wall
            [this.containerSize.width / 2 + wallThickness / 2, 0, wallThickness, this.containerSize.depth + wallThickness * 2],
            // Front wall
            [0, -this.containerSize.depth / 2 - wallThickness / 2, this.containerSize.width + wallThickness * 2, wallThickness],
            // Back wall
            [0, this.containerSize.depth / 2 + wallThickness / 2, this.containerSize.width + wallThickness * 2, wallThickness]
        ];
        
        // Create walls
        walls.forEach(wallDef => {
            const [x, z, width, depth] = wallDef;
            
            // Visual wall
            const wallGeometry = new THREE.BoxGeometry(width, wallHeight, depth);
            const wallMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a5568,
                roughness: 0.8,
                metalness: 0.2,
                transparent: true,
                opacity: 0.7  // Semi-transparent walls
            });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(x, wallHeight / 2, z);
            wall.receiveShadow = true;
            wall.castShadow = true;
            this.scene.add(wall);
            
            // Physics wall
            const wallShape = new CANNON.Box(new CANNON.Vec3(
                width / 2,
                wallHeight / 2,
                depth / 2
            ));
            const wallBody = new CANNON.Body({
                mass: 0,  // Static body
                shape: wallShape
            });
            wallBody.position.set(x, wallHeight / 2, z);
            this.world.addBody(wallBody);
        });
        
        // Add a grid pattern on the floor
        const gridHelper = new THREE.GridHelper(
            Math.max(this.containerSize.width, this.containerSize.depth), 
            10, 
            0x555555, 
            0x333333
        );
        gridHelper.position.y = 0.01;  // Slightly above floor
        this.scene.add(gridHelper);
        
        // Add circular pattern on floor
        const circleGeometry = new THREE.CircleGeometry(
            Math.min(this.containerSize.width, this.containerSize.depth) / 3, 
            32
        );
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0x3c4a61,
            transparent: true,
            opacity: 0.3,
            wireframe: false,
            side: THREE.DoubleSide
        });
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.rotation.x = -Math.PI / 2;  // Lay flat
        circle.position.y = 0.02;  // Slightly above floor
        this.scene.add(circle);
    }
    
    createDie(diceType) {
        // Create Three.js mesh
        const geometry = this.diceGeometries[diceType];
        const material = this.diceMaterials[diceType];
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Apply numbers to faces
        this.applyNumbersToFaces(mesh, diceType);
        
        // Create physics body
        const body = this.createDiceBody(diceType);
        
        // Store dice type on both mesh and body
        mesh.userData.diceType = diceType;
        body.userData = { diceType };
        
        return { mesh, body };
    }
    
    createDiceBody(diceType) {
        let shape;
        const scale = this.DICE_SCALE[diceType];
        
        // Create appropriate physics shape based on the dice type
        switch (diceType) {
            case 'd4':
                // Simplified tetrahedron
                shape = new CANNON.Box(new CANNON.Vec3(1.4 * scale, 1.4 * scale, 1.4 * scale));
                break;
            case 'd6':
                shape = new CANNON.Box(new CANNON.Vec3(scale, scale, scale));
                break;
            case 'd8':
                // Simplified octahedron
                shape = new CANNON.Box(new CANNON.Vec3(1.2 * scale, 1.2 * scale, 1.2 * scale));
                break;
            case 'd10':
            case 'd100':
                // Simplified d10 shape
                shape = new CANNON.Box(new CANNON.Vec3(1.2 * scale, 0.9 * scale, 1.2 * scale));
                break;
            case 'd12':
                // Simplified dodecahedron
                shape = new CANNON.Box(new CANNON.Vec3(1.2 * scale, 1.2 * scale, 1.2 * scale));
                break;
            case 'd20':
                // Simplified icosahedron
                shape = new CANNON.Box(new CANNON.Vec3(1.2 * scale, 1.2 * scale, 1.2 * scale));
                break;
            default:
                shape = new CANNON.Box(new CANNON.Vec3(scale, scale, scale));
        }
        
        // Create body with mass
        const body = new CANNON.Body({
            mass: this.DICE_MASS,
            shape: shape,
            material: this.diceMaterials[diceType].physicsMaterial,
            sleepSpeedLimit: 0.2,  // Body will sleep when speed < 0.2
            angularDamping: 0.1,
            linearDamping: 0.1
        });
        
        // Allow body to sleep when it comes to rest
        body.allowSleep = true;
        
        return body;
    }
    
    applyNumbersToFaces(mesh, diceType) {
        // Create a material array if not already using one
        if (!Array.isArray(mesh.material)) {
            const baseMaterial = mesh.material;
            mesh.material = [];
            
            // Create separate materials for each face
            const numFaces = this.getNumberOfFaces(diceType);
            for (let i = 0; i < numFaces; i++) {
                mesh.material.push(baseMaterial.clone());
            }
        }
        
        // This is a simplified approach - in a full implementation
        // you would use a canvas to draw numbers on each face
        // and create textures from those canvases
        
        // For now, we'll just use different shades to distinguish faces
        for (let i = 0; i < mesh.material.length; i++) {
            const intensity = 0.8 + (i / mesh.material.length) * 0.4;
            mesh.material[i].color.multiplyScalar(intensity);
            
            // We would add the face number texture here in a full implementation
        }
    }
    
    getNumberOfFaces(diceType) {
        switch (diceType) {
            case 'd4': return 4;
            case 'd6': return 6;
            case 'd8': return 8;
            case 'd10': case 'd100': return 10;
            case 'd12': return 12;
            case 'd20': return 20;
            default: return 6;
        }
    }
    
    rollDice(diceType, numDice = 1) {
        // Clear previous dice
        this.clearDice();
        
        // Track if roll is complete
        this.rollInProgress = true;
        
        // Create the requested number of dice
        const results = [];
        let firstDieBody = null;
        
        for (let i = 0; i < numDice; i++) {
            // Create a die
            const die = this.createDie(diceType);
            
            // Add to scene
            this.scene.add(die.mesh);
            
            // Position above the container with slight randomness
            const xPos = (Math.random() - 0.5) * (this.containerSize.width * 0.8);
            const zPos = (Math.random() - 0.5) * (this.containerSize.depth * 0.8);
            const yPos = this.containerSize.height - i * 2;  // Stack dice for better visual
            
            die.body.position.set(xPos, yPos, zPos);
            this.world.addBody(die.body);
            
            // Apply random rotation
            die.body.quaternion.setFromEuler(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            // Apply initial force and torque
            const forceMultiplier = 4 + Math.random() * 4;
            die.body.applyLocalForce(
                new CANNON.Vec3(
                    (Math.random() - 0.5) * forceMultiplier * 800,
                    -500,
                    (Math.random() - 0.5) * forceMultiplier * 800
                ),
                new CANNON.Vec3(0, 0, 0)
            );
            
            // Apply random spin (angular velocity)
            die.body.angularVelocity.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            
            // Keep track of the first die for camera focus
            if (i === 0) {
                firstDieBody = die.body;
            }
            
            // Store die in the array with a placeholder result
            this.diceObjects.push({
                mesh: die.mesh,
                body: die.body,
                diceType: diceType,
                result: null,
                isResting: false
            });
            
            results.push(null);  // Placeholder for result
        }
        
        // Store roll information
        this.diceResults = {
            diceType: diceType,
            count: numDice,
            results: results,
            isComplete: false,
            timestamp: new Date()
        };
        
        // Start checking for results - wait a bit for initial physics
        setTimeout(() => this.checkDiceResults(), 1000);
        
        return results;
    }
    
    clearDice() {
        // Remove dice from scene and physics world
        for (const die of this.diceObjects) {
            this.scene.remove(die.mesh);
            this.world.removeBody(die.body);
        }
        
        // Clear arrays
        this.diceObjects = [];
        this.diceResults = {};
        this.rollInProgress = false;
    }
    
    checkDiceResults() {
        if (!this.rollInProgress || this.diceObjects.length === 0) return;
        
        // Count how many dice are still moving
        let movingDice = 0;
        const results = [];
        
        this.diceObjects.forEach((die, index) => {
            // Check velocity and angular velocity
            const velocity = die.body.velocity.norm();
            const angularVelocity = die.body.angularVelocity.norm();
            
            // Die is still moving significantly
            if (velocity > 0.1 || angularVelocity > 0.1) {
                movingDice++;
                die.isResting = false;
            } 
            // Die just came to rest
            else if (!die.isResting) {
                die.isResting = true;
                
                // Calculate which face is up
                die.result = this.calculateDieResult(die);
                this.diceResults.results[index] = die.result;
                results.push(die.result);
            } 
            // Die was already at rest
            else if (die.result !== null) {
                results.push(die.result);
            }
        });
        
        // If all dice have stopped
        if (movingDice === 0) {
            // Make sure we have all results
            if (results.length === this.diceObjects.length) {
                this.diceResults.isComplete = true;
                this.rollInProgress = false;
                
                // Notify about complete roll
                this.dispatchRollComplete(results);
            }
        } else {
            // Check again after a short delay
            setTimeout(() => this.checkDiceResults(), 500);
        }
    }
    
    calculateDieResult(die) {
        // This is a simplified method for result calculation
        // In a real implementation, we'd use vector math to determine
        // which face is pointing up
        
        // For this demo, we'll use a "weighted" random approach
        // that favors reasonable distributions
        
        const faces = this.DICE_FACE_CONFIG[die.diceType];
        return faces[Math.floor(Math.random() * faces.length)];
    }
    
    dispatchRollComplete(results) {
        // Calculate total
        let total = 0;
        
        // Special handling for d100
        if (this.diceResults.diceType === 'd100') {
            // Each result is a tens place (0-90)
            total = results.reduce((sum, value) => sum + value, 0);
        } else {
            // Normal dice addition
            total = results.reduce((sum, value) => sum + value, 0);
        }
        
        // Create custom event
        const event = new CustomEvent('diceRollComplete', {
            detail: {
                diceType: this.diceResults.diceType,
                results: results,
                total: total
            }
        });
        
        // Dispatch event
        document.dispatchEvent(event);
    }
    
    onWindowResize() {
        // Update camera aspect ratio
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    animate() {
        // Request next frame
        requestAnimationFrame(() => this.animate());
        
        // Step physics simulation
        this.world.step(1/60);
        
        // Update mesh positions from physics bodies
        for (const die of this.diceObjects) {
            die.mesh.position.copy(die.body.position);
            die.mesh.quaternion.copy(die.body.quaternion);
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// DiceManager - Manages both 2D and 3D dice
class DiceManager {
    constructor() {
        this.mode = '2d';  // Start in 2D mode
        
        // Don't initialize the isometric roller right away to save resources
        this.isometricRoller = null;
        
        // Track selected dice
        this.selectedDiceType = 'd20';  // Default to d20
        
        // Initialize UI
        this.initUI();
        
        // Listen for dice roll complete
        document.addEventListener('diceRollComplete', (e) => this.handleRollComplete(e));
    }
    
    // Initialize the 3D roller when needed
    initIsometricRoller() {
        if (!this.isometricRoller) {
            console.log('Initializing 3D dice roller');
            this.isometricRoller = new IsometricDiceRoller();
        }
    }
    
    initUI() {
        // Get view toggle buttons
        const toggle2dBtn = document.getElementById('toggle-2d');
        const toggle3dBtn = document.getElementById('toggle-3d');
        
        // Set initial active state
        toggle2dBtn.classList.add('active');
        toggle3dBtn.classList.remove('active');
        
        // Add event listeners
        toggle2dBtn.addEventListener('click', () => this.setMode('2d'));
        toggle3dBtn.addEventListener('click', () => this.setMode('3d'));
        
        // Get dice items
        const diceItems = document.querySelectorAll('.dice-item');
        diceItems.forEach(item => {
            item.addEventListener('click', () => {
                const diceType = item.getAttribute('data-dice');
                this.selectDiceType(diceType);
            });
        });
        
        // Roll and clear buttons
        const rollButton = document.getElementById('roll-dice');
        const clearButton = document.getElementById('clear-dice');
        
        rollButton.addEventListener('click', () => this.rollDice());
        clearButton.addEventListener('click', () => this.clearDice());
        
        // Select d20 by default
        this.selectDiceType('d20');
    }
    
    setMode(mode) {
        this.mode = mode;
        
        // Update UI
        document.getElementById('toggle-2d').classList.toggle('active', mode === '2d');
        document.getElementById('toggle-3d').classList.toggle('active', mode === '3d');
        
        // Initialize 3D roller if switching to 3D mode
        if (mode === '3d') {
            document.getElementById('loading-overlay').style.display = 'flex';
            document.getElementById('loading-overlay').innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading 3D Dice...</p>
            `;
            
            // Initialize 3D roller after a short delay
            setTimeout(() => {
                this.initIsometricRoller();
                document.getElementById('loading-overlay').style.display = 'none';
            }, 100);
        }
        
        // Clear dice in both modes
        this.clearDice();
    }
    
    selectDiceType(diceType) {
        // Store selected dice type
        this.selectedDiceType = diceType;
        
        // Update UI
        document.querySelectorAll('.dice-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`.dice-item[data-dice="${diceType}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
    }
    
    rollDice() {
        // Get dice count and modifier
        const diceCount = parseInt(document.getElementById('dice-count').value);
        const modifier = parseInt(document.getElementById('dice-modifier').value);
        
        // Validate inputs
        if (diceCount <= 0 || diceCount > 10) return;
        
        if (this.mode === '2d') {
            // Use the 2D roller
            window.rollDice();  // This function is defined in simple_dice.js
        } else {
            // Ensure 3D roller is initialized
            this.initIsometricRoller();
            
            // Use 3D roller
            this.isometricRoller.rollDice(this.selectedDiceType, diceCount);
        }
    }
    
    clearDice() {
        if (this.mode === '2d') {
            // Clear 2D
            window.clearDice();  // From simple_dice.js
        } else if (this.isometricRoller) {
            // Clear 3D if initialized
            this.isometricRoller.clearDice();
        }
    }
    
    handleRollComplete(event) {
        const { diceType, results, total } = event.detail;
        
        // Get modifier
        const modifier = parseInt(document.getElementById('dice-modifier').value);
        
        // Calculate final total
        const finalTotal = total + modifier;
        
        // Format results
        let resultText = `${results.length}${diceType}: [${results.join(', ')}]`;
        if (modifier !== 0) {
            resultText += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
        }
        
        // Update UI
        document.getElementById('dice-result').innerHTML = `<span>${resultText}</span>`;
        document.getElementById('dice-total').innerHTML = `<span>Total: ${finalTotal}</span>`;
        
        // Add to roll history
        const rollLog = document.getElementById('roll-log');
        const entry = document.createElement('div');
        entry.className = 'roll-log-entry';
        
        entry.innerHTML = `
            <div class="roll-log-dice">${results.length}${diceType}</div>
            <div class="roll-log-result">[${results.join(', ')}]</div>
            <div class="roll-log-total">Total: ${finalTotal}</div>
        `;
        
        // Add to top of log
        rollLog.insertBefore(entry, rollLog.firstChild);
        
        // Limit history length
        while (rollLog.children.length > 10) {
            rollLog.removeChild(rollLog.lastChild);
        }
        
        // Save roll to database
        this.saveRollToDatabase(results.length, diceType, results, modifier, finalTotal);
    }
    
    saveRollToDatabase(diceCount, diceType, results, modifier, total) {
        // Prepare data
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
    }
}

// The initialization is now handled directly in dice_roller.html