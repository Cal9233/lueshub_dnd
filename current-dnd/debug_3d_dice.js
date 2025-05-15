// Simplified 3D dice roller for debugging
document.addEventListener('DOMContentLoaded', function() {
    // Get toggle buttons
    const toggle2dBtn = document.getElementById('toggle-2d');
    const toggle3dBtn = document.getElementById('toggle-3d');
    
    // Set up toggle behavior
    toggle2dBtn.addEventListener('click', function() {
        toggle2dBtn.classList.add('active');
        toggle3dBtn.classList.remove('active');
        document.getElementById('dice-canvas-container').classList.remove('mode-3d');
    });
    
    toggle3dBtn.addEventListener('click', function() {
        toggle2dBtn.classList.remove('active');
        toggle3dBtn.classList.add('active');
        document.getElementById('dice-canvas-container').classList.add('mode-3d');
        
        // Initialize 3D on first click
        initSimple3D();
    });
    
    // Store initialized state
    let initialized = false;
    let scene, camera, renderer, cube;
    
    // Simple 3D setup function
    function initSimple3D() {
        if (initialized) return;
        
        console.log("Initializing simple 3D debug scene");
        
        // Show loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.display = 'flex';
        
        try {
            // Get container and canvas
            const container = document.getElementById('dice-canvas-container');
            const canvas = document.getElementById('dice-canvas');
            
            // Check if Three.js is available
            if (typeof THREE === 'undefined') {
                console.error("THREE is not defined! Make sure Three.js is loaded.");
                loadingOverlay.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error: Three.js library not loaded properly</p>
                `;
                return;
            }
            
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x283141);  // Dark blue background
            
            // Create camera
            camera = new THREE.PerspectiveCamera(
                75,
                container.clientWidth / container.clientHeight,
                0.1,
                1000
            );
            camera.position.z = 5;
            
            // Create renderer
            renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true 
            });
            renderer.setSize(container.clientWidth, container.clientHeight);
            
            // Create a simple cube
            const geometry = new THREE.BoxGeometry(2, 2, 2);
            const material = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
            cube = new THREE.Mesh(geometry, material);
            scene.add(cube);
            
            // Add lights
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(1, 1, 1);
            scene.add(light);
            
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);
            
            // Start animation
            animate();
            
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
            
            // Mark as initialized
            initialized = true;
            
            // Set up roll button
            const rollButton = document.getElementById('roll-dice');
            rollButton.addEventListener('click', function() {
                if (toggle3dBtn.classList.contains('active')) {
                    rollDebugDice();
                }
            });
            
            console.log("3D debug scene initialized successfully");
        } catch (error) {
            console.error("Error initializing 3D:", error);
            loadingOverlay.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error initializing 3D: ${error.message}</p>
            `;
        }
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (cube) {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
        }
        
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }
    
    // Debug dice roll function
    function rollDebugDice() {
        if (!cube) return;
        
        // Apply random rotation and position animation
        const targetRotationX = Math.random() * Math.PI * 4;
        const targetRotationY = Math.random() * Math.PI * 4;
        const targetRotationZ = Math.random() * Math.PI * 4;
        
        // Animate the cube
        const initialRotation = {
            x: cube.rotation.x,
            y: cube.rotation.y,
            z: cube.rotation.z
        };
        
        // Animation duration in milliseconds
        const duration = 1000;
        const startTime = Date.now();
        
        function animateCube() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutBack = function(t) {
                const c1 = 1.70158;
                const c3 = c1 + 1;
                return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
            };
            
            const easedProgress = easeOutBack(progress);
            
            // Update rotation
            cube.rotation.x = initialRotation.x + targetRotationX * easedProgress;
            cube.rotation.y = initialRotation.y + targetRotationY * easedProgress;
            cube.rotation.z = initialRotation.z + targetRotationZ * easedProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animateCube);
            } else {
                // Display a random number as the result
                const randomNumber = Math.floor(Math.random() * 20) + 1;
                document.getElementById('dice-result').innerHTML = `<span>Roll result: ${randomNumber}</span>`;
                document.getElementById('dice-total').innerHTML = `<span>Total: ${randomNumber}</span>`;
            }
        }
        
        animateCube();
    }
});