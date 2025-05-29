import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon-es';
import './IsometricDice.css';

class IsometricDiceRoller {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.world = null;
    this.diceObjects = [];
    this.diceResults = {};
    
    this.diceMaterials = {};
    this.diceGeometries = {};
    
    this.containerSize = {
      width: 30,
      height: 20,
      depth: 30
    };
    
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
    
    this.DICE_COLORS = {
      d4: 0x8b5cf6,  // Purple
      d6: 0x3b82f6,  // Blue
      d8: 0x10b981,  // Green
      d10: 0xef4444, // Red
      d12: 0xf59e0b, // Amber
      d20: 0x6366f1, // Indigo
      d100: 0xec4899 // Pink
    };
    
    this.init();
  }
  
  init() {
    console.log('IsometricDiceRoller initializing...');
    this.initPhysics();
    this.initScene();
    this.createDiceMaterials();
    this.createDiceGeometries();
    this.createDiceContainer();
    
    this.animate();
    console.log('IsometricDiceRoller initialized');
  }
  
  initPhysics() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82 * 3, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 20;
    this.world.allowSleep = true;
  }
  
  initScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x283141);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      40,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    
    this.camera.position.set(
      this.containerSize.width * 0.8,
      this.containerSize.height * 1.5,
      this.containerSize.depth * 0.8
    );
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    console.log('Canvas appended to container, size:', this.container.clientWidth, 'x', this.container.clientHeight);
    
    // Force a render to make sure something shows up
    this.renderer.render(this.scene, this.camera);
    
    // Lighting
    this.addLights();
    
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 50;
    
    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(
      this.containerSize.width/2,
      this.containerSize.height*2,
      this.containerSize.depth/2
    );
    mainLight.castShadow = true;
    
    mainLight.shadow.camera.left = -this.containerSize.width;
    mainLight.shadow.camera.right = this.containerSize.width;
    mainLight.shadow.camera.top = this.containerSize.depth;
    mainLight.shadow.camera.bottom = -this.containerSize.depth;
    mainLight.shadow.camera.near = 1;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);
    
    const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight1.position.set(-this.containerSize.width, this.containerSize.height, 0);
    this.scene.add(fillLight1);
    
    const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight2.position.set(0, this.containerSize.height, -this.containerSize.depth);
    this.scene.add(fillLight2);
  }
  
  createDiceMaterials() {
    Object.keys(this.DICE_COLORS).forEach(diceType => {
      this.diceMaterials[diceType] = new THREE.MeshBasicMaterial({
        color: this.DICE_COLORS[diceType],
        wireframe: false
      });
      
      console.log(`Created material for ${diceType}:`, this.DICE_COLORS[diceType].toString(16));
      
      const physicsMaterial = new CANNON.Material();
      physicsMaterial.friction = 0.4;
      physicsMaterial.restitution = 0.3;
      this.diceMaterials[diceType].physicsMaterial = physicsMaterial;
    });
  }
  
  createDiceGeometries() {
    // Increase size for better visibility
    this.diceGeometries.d4 = new THREE.TetrahedronGeometry(3 * this.DICE_SCALE.d4);
    this.diceGeometries.d6 = new THREE.BoxGeometry(
      3 * this.DICE_SCALE.d6,
      3 * this.DICE_SCALE.d6,
      3 * this.DICE_SCALE.d6
    );
    this.diceGeometries.d8 = new THREE.OctahedronGeometry(3 * this.DICE_SCALE.d8);
    this.diceGeometries.d10 = this.createD10Geometry(this.DICE_SCALE.d10 * 1.5);
    this.diceGeometries.d12 = new THREE.DodecahedronGeometry(3 * this.DICE_SCALE.d12);
    this.diceGeometries.d20 = new THREE.IcosahedronGeometry(3 * this.DICE_SCALE.d20);
    this.diceGeometries.d100 = this.createD10Geometry(this.DICE_SCALE.d100 * 1.5);
    
    console.log('Created dice geometries:', Object.keys(this.diceGeometries));
  }
  
  createD10Geometry(scale) {
    const radius = 3 * scale;
    const geometry = new THREE.BufferGeometry();
    
    const vertices = [];
    // Top and bottom vertices
    vertices.push(0, radius * 1.2, 0);
    vertices.push(0, -radius * 1.2, 0);
    
    // Middle vertices
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const y = radius * 0.6;
      
      // Upper ring
      vertices.push(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      
      // Lower ring (offset by PI/5)
      vertices.push(
        Math.cos(angle + Math.PI / 5) * radius,
        -y,
        Math.sin(angle + Math.PI / 5) * radius
      );
    }
    
    const indices = [];
    
    // Connect top to upper ring
    for (let i = 0; i < 5; i++) {
      const next = (i + 1) % 5;
      indices.push(0, 2 + i * 2, 2 + next * 2);
    }
    
    for (let i = 0; i < 5; i++) {
      const next = (i + 1) % 5;
      indices.push(1, 3 + next * 2, 3 + i * 2);
    }
    
    for (let i = 0; i < 5; i++) {
      const next = (i + 1) % 5;
      indices.push(2 + i * 2, 3 + i * 2, 2 + next * 2);
      indices.push(2 + next * 2, 3 + i * 2, 3 + next * 2);
    }
    
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    
    return geometry;
  }
  
  createDiceContainer() {
    const wallThickness = 1;
    const wallHeight = this.containerSize.height;
    
    // Floor
    const floorGeometry = new THREE.BoxGeometry(
      this.containerSize.width + wallThickness * 2,
      wallThickness,
      this.containerSize.depth + wallThickness * 2
    );
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0x2d3748
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -wallThickness / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    
    // Floor physics - use a simple plane
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: floorShape
    });
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    floorBody.position.set(0, 0, 0);
    this.world.addBody(floorBody);
    
    // Walls
    const walls = [
      [-this.containerSize.width / 2 - wallThickness / 2, 0, wallThickness, this.containerSize.depth + wallThickness * 2],
      [this.containerSize.width / 2 + wallThickness / 2, 0, wallThickness, this.containerSize.depth + wallThickness * 2],
      [0, -this.containerSize.depth / 2 - wallThickness / 2, this.containerSize.width + wallThickness * 2, wallThickness],
      [0, this.containerSize.depth / 2 + wallThickness / 2, this.containerSize.width + wallThickness * 2, wallThickness]
    ];
    
    walls.forEach(wallDef => {
      const [x, z, width, depth] = wallDef;
      
      const wallGeometry = new THREE.BoxGeometry(width, wallHeight, depth);
      const wallMaterial = new THREE.MeshBasicMaterial({
        color: 0x4a5568,
        transparent: true,
        opacity: 0.3
      });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(x, wallHeight / 2, z);
      wall.receiveShadow = true;
      wall.castShadow = true;
      this.scene.add(wall);
      
      // Skip physics for walls - the floor plane will keep dice contained
    });
    
    // Grid
    const gridHelper = new THREE.GridHelper(
      Math.max(this.containerSize.width, this.containerSize.depth), 
      10, 
      0x555555, 
      0x333333
    );
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }
  
  createDie(diceType) {
    const geometry = this.diceGeometries[diceType];
    const material = this.diceMaterials[diceType];
    
    if (!geometry || !material) {
      console.error('Missing geometry or material for dice type:', diceType);
      return null;
    }
    
    // Create group to hold both solid mesh and edges
    const group = new THREE.Group();
    
    // Main dice mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    
    // Add edges for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const edgeMesh = new THREE.LineSegments(edges, edgeMaterial);
    group.add(edgeMesh);
    
    console.log('Created dice mesh:', { diceType, color: material.color });
    
    const body = this.createDiceBody(diceType);
    
    group.userData.diceType = diceType;
    body.userData = { diceType };
    
    return { mesh: group, body };
  }
  
  createDiceBody(diceType) {
    const scale = this.DICE_SCALE[diceType];
    
    // Use spheres for physics simulation - more stable than boxes
    const radius = scale * 1.2;
    const shape = new CANNON.Sphere(radius);
    
    const body = new CANNON.Body({
      mass: this.DICE_MASS,
      shape: shape,
      material: this.diceMaterials[diceType].physicsMaterial,
      sleepSpeedLimit: 0.2,
      angularDamping: 0.1,
      linearDamping: 0.1
    });
    
    body.allowSleep = true;
    
    return body;
  }
  
  rollDice(diceType, numDice = 1, onComplete) {
    console.log('IsometricDiceRoller.rollDice called:', { diceType, numDice });
    this.clearDice();
    this.rollInProgress = true;
    
    const results = [];
    
    for (let i = 0; i < numDice; i++) {
      const die = this.createDie(diceType);
      
      if (!die) {
        console.error('Failed to create die');
        continue;
      }
      
      this.scene.add(die.mesh);
      
      const xPos = (Math.random() - 0.5) * (this.containerSize.width * 0.6);
      const zPos = (Math.random() - 0.5) * (this.containerSize.depth * 0.6);
      const yPos = 10 + i * 3; // Start lower
      
      console.log('Dice position:', { xPos, yPos, zPos });
      die.body.position.set(xPos, yPos, zPos);
      die.mesh.position.copy(die.body.position); // Sync initial position
      
      // Log mesh details
      console.log('Dice mesh:', {
        geometry: die.mesh.geometry,
        material: die.mesh.material,
        color: die.mesh.material.color,
        position: die.mesh.position
      });
      
      this.world.addBody(die.body);
      
      die.body.quaternion.setFromAxisAngle(
        new CANNON.Vec3(Math.random(), Math.random(), Math.random()).normalize(),
        Math.random() * Math.PI * 2
      );
      
      // Apply random velocity for rolling
      die.body.velocity.set(
        (Math.random() - 0.5) * 30,
        -10,
        (Math.random() - 0.5) * 30
      );
      
      // Apply random angular velocity for spinning
      die.body.angularVelocity.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
      
      console.log('Applied velocity:', die.body.velocity, 'angular:', die.body.angularVelocity);
      
      this.diceObjects.push({
        mesh: die.mesh,
        body: die.body,
        diceType: diceType,
        result: null,
        isResting: false
      });
      
      results.push(null);
    }
    
    this.diceResults = {
      diceType: diceType,
      count: numDice,
      results: results,
      isComplete: false,
      timestamp: new Date(),
      onComplete: onComplete
    };
    
    setTimeout(() => this.checkDiceResults(), 1000);
    
    return results;
  }
  
  clearDice() {
    for (const die of this.diceObjects) {
      this.scene.remove(die.mesh);
      this.world.removeBody(die.body);
    }
    
    this.diceObjects = [];
    this.diceResults = {};
    this.rollInProgress = false;
  }
  
  checkDiceResults() {
    if (!this.rollInProgress || this.diceObjects.length === 0) return;
    
    let movingDice = 0;
    const results = [];
    
    this.diceObjects.forEach((die, index) => {
      // Calculate velocity magnitude manually
      const vel = die.body.velocity;
      const velocity = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
      
      const angVel = die.body.angularVelocity;
      const angularVelocity = Math.sqrt(angVel.x * angVel.x + angVel.y * angVel.y + angVel.z * angVel.z);
      
      if (velocity > 0.1 || angularVelocity > 0.1) {
        movingDice++;
        die.isResting = false;
      } else if (!die.isResting) {
        die.isResting = true;
        die.result = this.calculateDieResult(die);
        this.diceResults.results[index] = die.result;
        results.push(die.result);
      } else if (die.result !== null) {
        results.push(die.result);
      }
    });
    
    if (movingDice === 0 && results.length === this.diceObjects.length) {
      this.diceResults.isComplete = true;
      this.rollInProgress = false;
      
      if (this.diceResults.onComplete) {
        this.diceResults.onComplete(results);
      }
    } else {
      setTimeout(() => this.checkDiceResults(), 500);
    }
  }
  
  calculateDieResult(die) {
    const sides = {
      d4: 4,
      d6: 6,
      d8: 8,
      d10: 10,
      d12: 12,
      d20: 20,
      d100: 10
    };
    
    const dieMax = sides[die.diceType] || 6;
    return Math.floor(Math.random() * dieMax) + 1;
  }
  
  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  animate() {
    if (!this.renderer) return;
    
    requestAnimationFrame(() => this.animate());
    
    // Update physics
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
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
  
  dispose() {
    this.clearDice();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement && this.renderer.domElement.parentNode === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
    if (this.controls) {
      this.controls.dispose();
    }
    window.removeEventListener('resize', () => this.onWindowResize());
  }
}

const IsometricDice = ({ dice = [], onRollComplete }) => {
  const containerRef = useRef(null);
  const rollerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('IsometricDice mount effect, container:', !!containerRef.current);
    if (containerRef.current && !rollerRef.current) {
      try {
        rollerRef.current = new IsometricDiceRoller(containerRef.current);
        setIsInitialized(true);
        console.log('IsometricDiceRoller created successfully');
      } catch (error) {
        console.error('Error creating IsometricDiceRoller:', error);
      }
    }

    return () => {
      if (rollerRef.current) {
        rollerRef.current.dispose();
        rollerRef.current = null;
      }
    };
  }, []);

  const [lastRollId, setLastRollId] = useState(null);

  useEffect(() => {
    console.log('IsometricDice useEffect triggered:', { dice, isInitialized, hasRoller: !!rollerRef.current });
    
    // Only roll if we have new dice to roll
    if (isInitialized && dice.length > 0 && rollerRef.current) {
      const currentRollId = dice[0].id;
      
      // Check if this is a new roll
      if (currentRollId !== lastRollId) {
        setLastRollId(currentRollId);
        
        const diceType = dice[0].type;
        const numDice = dice.length;
        
        console.log('Rolling dice:', diceType, 'count:', numDice);
        rollerRef.current.rollDice(diceType, numDice, (results) => {
          console.log('Roll complete, results:', results);
          if (onRollComplete) {
            const totals = {};
            totals[diceType] = results.reduce((a, b) => a + b, 0);
            
            onRollComplete({
              individual: results.reduce((acc, val, idx) => ({ ...acc, [idx]: val }), {}),
              totals: totals,
              grandTotal: totals[diceType]
            });
          }
        });
      }
    }
  }, [dice, isInitialized, onRollComplete, lastRollId]);

  return (
    <div className="isometric-dice-container">
      <div ref={containerRef} className="dice-3d-canvas" style={{ backgroundColor: isInitialized ? 'transparent' : '#444' }} />
      {!isInitialized && (
        <div className="dice-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading 3D Dice...</p>
        </div>
      )}
      {isInitialized && dice.length === 0 && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '1.5rem'
        }}>
          Click "Roll Dice" to start
        </div>
      )}
    </div>
  );
}

export default IsometricDice;