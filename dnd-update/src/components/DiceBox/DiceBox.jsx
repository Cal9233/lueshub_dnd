import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import './DiceBox.css';

// Dice face configurations
const DICE_FACES = {
  d4: [
    { position: [0, 0.5, 0.577], rotation: [0, 0, 0], value: 1 },
    { position: [-0.5, -0.289, 0.289], rotation: [0, Math.PI * 2/3, 0], value: 2 },
    { position: [0.5, -0.289, 0.289], rotation: [0, -Math.PI * 2/3, 0], value: 3 },
    { position: [0, -0.289, -0.577], rotation: [Math.PI, 0, 0], value: 4 }
  ],
  d6: [
    { position: [0, 0, 0.5], rotation: [0, 0, 0], value: 1 },
    { position: [0, 0, -0.5], rotation: [0, Math.PI, 0], value: 6 },
    { position: [0.5, 0, 0], rotation: [0, Math.PI/2, 0], value: 2 },
    { position: [-0.5, 0, 0], rotation: [0, -Math.PI/2, 0], value: 5 },
    { position: [0, 0.5, 0], rotation: [-Math.PI/2, 0, 0], value: 3 },
    { position: [0, -0.5, 0], rotation: [Math.PI/2, 0, 0], value: 4 }
  ],
  d8: [
    { position: [0, 0.577, 0.408], rotation: [0, 0, 0], value: 1 },
    { position: [0, 0.577, -0.408], rotation: [0, Math.PI, 0], value: 2 },
    { position: [0.408, -0.577, 0], rotation: [0, Math.PI/2, 0], value: 3 },
    { position: [-0.408, -0.577, 0], rotation: [0, -Math.PI/2, 0], value: 4 },
    { position: [0.408, 0.577, 0], rotation: [-Math.PI/2, 0, 0], value: 5 },
    { position: [-0.408, 0.577, 0], rotation: [Math.PI/2, 0, 0], value: 6 },
    { position: [0, -0.577, 0.408], rotation: [Math.PI, 0, 0], value: 7 },
    { position: [0, -0.577, -0.408], rotation: [Math.PI, Math.PI, 0], value: 8 }
  ],
  d10: [
    { position: [0, 0.618, 0.381], rotation: [0, 0, 0], value: 1 },
    { position: [0.381, 0.618, 0], rotation: [0, Math.PI * 0.2, 0], value: 2 },
    { position: [0.236, 0.618, -0.309], rotation: [0, Math.PI * 0.4, 0], value: 3 },
    { position: [-0.236, 0.618, -0.309], rotation: [0, Math.PI * 0.6, 0], value: 4 },
    { position: [-0.381, 0.618, 0], rotation: [0, Math.PI * 0.8, 0], value: 5 },
    { position: [0, -0.618, -0.381], rotation: [Math.PI, 0, 0], value: 6 },
    { position: [-0.381, -0.618, 0], rotation: [Math.PI, Math.PI * 0.2, 0], value: 7 },
    { position: [-0.236, -0.618, 0.309], rotation: [Math.PI, Math.PI * 0.4, 0], value: 8 },
    { position: [0.236, -0.618, 0.309], rotation: [Math.PI, Math.PI * 0.6, 0], value: 9 },
    { position: [0.381, -0.618, 0], rotation: [Math.PI, Math.PI * 0.8, 0], value: 0 }
  ],
  d12: [
    { position: [0, 0.934, 0.357], rotation: [0, 0, 0], value: 1 },
    { position: [0.577, 0.577, 0.577], rotation: [0, Math.PI/3, 0], value: 2 },
    { position: [0.935, 0.357, 0], rotation: [0, 2*Math.PI/3, 0], value: 3 },
    { position: [0.577, 0.577, -0.577], rotation: [0, Math.PI, 0], value: 4 },
    { position: [0, 0.934, -0.357], rotation: [0, 4*Math.PI/3, 0], value: 5 },
    { position: [-0.577, 0.577, -0.577], rotation: [0, 5*Math.PI/3, 0], value: 6 },
    { position: [-0.935, 0.357, 0], rotation: [Math.PI, 0, 0], value: 7 },
    { position: [-0.577, 0.577, 0.577], rotation: [Math.PI, Math.PI/3, 0], value: 8 },
    { position: [0, -0.934, 0.357], rotation: [Math.PI, 2*Math.PI/3, 0], value: 9 },
    { position: [0.577, -0.577, 0.577], rotation: [Math.PI, Math.PI, 0], value: 10 },
    { position: [0.935, -0.357, 0], rotation: [Math.PI, 4*Math.PI/3, 0], value: 11 },
    { position: [0.577, -0.577, -0.577], rotation: [Math.PI, 5*Math.PI/3, 0], value: 12 }
  ],
  d20: [
    { position: [0, 1, 0], rotation: [0, 0, 0], value: 1 },
    { position: [0.894, 0.447, 0], rotation: [0, Math.PI/5, 0], value: 2 },
    { position: [0.276, 0.447, 0.851], rotation: [0, 2*Math.PI/5, 0], value: 3 },
    { position: [-0.724, 0.447, 0.526], rotation: [0, 3*Math.PI/5, 0], value: 4 },
    { position: [-0.724, 0.447, -0.526], rotation: [0, 4*Math.PI/5, 0], value: 5 },
    { position: [0.276, 0.447, -0.851], rotation: [0, Math.PI, 0], value: 6 },
    { position: [0.724, -0.447, 0.526], rotation: [0, 6*Math.PI/5, 0], value: 7 },
    { position: [-0.276, -0.447, 0.851], rotation: [0, 7*Math.PI/5, 0], value: 8 },
    { position: [-0.894, -0.447, 0], rotation: [0, 8*Math.PI/5, 0], value: 9 },
    { position: [-0.276, -0.447, -0.851], rotation: [0, 9*Math.PI/5, 0], value: 10 },
    { position: [0.724, -0.447, -0.526], rotation: [Math.PI, 0, 0], value: 11 },
    { position: [0, -1, 0], rotation: [Math.PI, Math.PI/5, 0], value: 12 },
    { position: [-0.894, 0.447, 0], rotation: [Math.PI, 2*Math.PI/5, 0], value: 13 },
    { position: [-0.276, 0.447, -0.851], rotation: [Math.PI, 3*Math.PI/5, 0], value: 14 },
    { position: [0.724, 0.447, -0.526], rotation: [Math.PI, 4*Math.PI/5, 0], value: 15 },
    { position: [0.724, 0.447, 0.526], rotation: [Math.PI, Math.PI, 0], value: 16 },
    { position: [-0.276, 0.447, 0.851], rotation: [Math.PI, 6*Math.PI/5, 0], value: 17 },
    { position: [-0.724, -0.447, 0.526], rotation: [Math.PI, 7*Math.PI/5, 0], value: 18 },
    { position: [-0.724, -0.447, -0.526], rotation: [Math.PI, 8*Math.PI/5, 0], value: 19 },
    { position: [0.276, -0.447, -0.851], rotation: [Math.PI, 9*Math.PI/5, 0], value: 20 }
  ]
};

// Single Die Component
const Die = ({ type, position, onResult }) => {
  const meshRef = useRef();
  const bodyRef = useRef();
  const [settled, setSettled] = useState(false);
  
  const { scene } = useThree();
  const world = scene.userData.world;

  // Create physics body
  useEffect(() => {
    if (!world) return;

    const shape = type === 'd6' 
      ? new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
      : new CANNON.Sphere(0.5);

    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(...position),
      shape,
      sleepSpeedLimit: 0.1,
      sleepTimeLimit: 1
    });

    // Add initial random rotation and velocity
    body.velocity.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 10 + 5,
      (Math.random() - 0.5) * 20
    );
    
    body.angularVelocity.set(
      Math.random() * 20,
      Math.random() * 20,
      Math.random() * 20
    );

    world.addBody(body);
    bodyRef.current = body;

    // Listen for sleep event (die has stopped moving)
    body.addEventListener('sleep', () => {
      setSettled(true);
      calculateResult();
    });

    return () => {
      world.removeBody(body);
    };
  }, [world, position, type]);

  // Sync physics with rendering
  useFrame(() => {
    if (meshRef.current && bodyRef.current) {
      meshRef.current.position.copy(bodyRef.current.position);
      meshRef.current.quaternion.copy(bodyRef.current.quaternion);
    }
  });

  // Calculate which face is up
  const calculateResult = () => {
    if (!meshRef.current) return;

    const upVector = new THREE.Vector3(0, 1, 0);
    let maxDot = -Infinity;
    let result = 1;

    DICE_FACES[type].forEach(face => {
      const faceNormal = new THREE.Vector3(...face.position);
      faceNormal.applyQuaternion(meshRef.current.quaternion);
      const dot = faceNormal.dot(upVector);
      
      if (dot > maxDot) {
        maxDot = dot;
        result = face.value;
      }
    });

    if (onResult) {
      onResult(result);
    }
  };

  // Dice geometry based on type
  const geometry = useMemo(() => {
    switch(type) {
      case 'd4':
        return new THREE.TetrahedronGeometry(1);
      case 'd6':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'd8':
        return new THREE.OctahedronGeometry(1);
      case 'd10':
      case 'd100':
        return new THREE.ConeGeometry(0.7, 1.4, 10);
      case 'd12':
        return new THREE.DodecahedronGeometry(1);
      case 'd20':
        return new THREE.IcosahedronGeometry(1);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, [type]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color={settled ? '#4CAF50' : '#8b0000'}
        metalness={0.3}
        roughness={0.4}
      />
      {/* Add numbers to faces - simplified for demo */}
      {type === 'd6' && DICE_FACES.d6.map((face, i) => (
        <Text
          key={i}
          position={face.position}
          rotation={face.rotation}
          fontSize={0.4}
          color="white"
        >
          {face.value}
        </Text>
      ))}
    </mesh>
  );
};

// Physics Ground
const Ground = () => {
  const { scene } = useThree();
  const world = scene.userData.world;

  useEffect(() => {
    if (!world) return;

    const groundShape = new CANNON.Box(new CANNON.Vec3(10, 0.1, 10));
    const groundBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, -2, 0),
      shape: groundShape
    });

    world.addBody(groundBody);

    return () => {
      world.removeBody(groundBody);
    };
  }, [world]);

  return (
    <mesh position={[0, -2, 0]} receiveShadow>
      <boxGeometry args={[20, 0.2, 20]} />
      <meshStandardMaterial color="#2c1810" />
    </mesh>
  );
};

// Dice Box Walls
const Walls = () => {
  const { scene } = useThree();
  const world = scene.userData.world;

  useEffect(() => {
    if (!world) return;

    const walls = [
      { position: [0, 0, -5], rotation: [0, 0, 0], size: [10, 10, 0.1] },
      { position: [0, 0, 5], rotation: [0, Math.PI, 0], size: [10, 10, 0.1] },
      { position: [-5, 0, 0], rotation: [0, Math.PI/2, 0], size: [10, 10, 0.1] },
      { position: [5, 0, 0], rotation: [0, -Math.PI/2, 0], size: [10, 10, 0.1] }
    ];

    const wallBodies = walls.map(wall => {
      const body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(...wall.position),
        shape: new CANNON.Box(new CANNON.Vec3(...wall.size.map(s => s/2)))
      });
      body.quaternion.setFromEuler(...wall.rotation);
      world.addBody(body);
      return body;
    });

    return () => {
      wallBodies.forEach(body => world.removeBody(body));
    };
  }, [world]);

  return null; // Walls are invisible
};

// Main Dice Box Component
const DiceBox = ({ dice = [], onRollComplete }) => {
  const [results, setResults] = useState({});
  const [rolling, setRolling] = useState(false);

  // Initialize physics world
  const world = useMemo(() => {
    const world = new CANNON.World();
    world.gravity.set(0, -20, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.defaultContactMaterial.friction = 0.01;
    world.defaultContactMaterial.restitution = 0.5;
    return world;
  }, []);

  // Physics step
  const PhysicsStep = () => {
    useFrame((state, delta) => {
      world.step(Math.min(delta, 0.1));
    });
    return null;
  };

  // Handle die result
  const handleDieResult = (index, result) => {
    setResults(prev => {
      const newResults = { ...prev, [index]: result };
      
      // Check if all dice have settled
      if (Object.keys(newResults).length === dice.length && onRollComplete) {
        const totals = dice.reduce((acc, die, i) => {
          acc[die.type] = (acc[die.type] || 0) + newResults[i];
          return acc;
        }, {});
        
        onRollComplete({
          individual: newResults,
          totals,
          grandTotal: Object.values(newResults).reduce((a, b) => a + b, 0)
        });
        setRolling(false);
      }
      
      return newResults;
    });
  };

  // Start new roll
  const rollDice = () => {
    setResults({});
    setRolling(true);
  };

  return (
    <div className="dice-box-container">
      <Canvas
        shadows
        camera={{ position: [0, 10, 10], fov: 45 }}
        onCreated={({ scene }) => {
          scene.userData.world = world;
        }}
      >
        <PhysicsStep />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        <OrbitControls 
          enablePan={false}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
        
        <Ground />
        <Walls />
        
        {rolling && dice.map((die, index) => (
          <Die
            key={`${die.type}-${index}`}
            type={die.type}
            position={[
              (Math.random() - 0.5) * 2,
              5 + index * 0.5,
              (Math.random() - 0.5) * 2
            ]}
            onResult={(result) => handleDieResult(index, result)}
          />
        ))}
      </Canvas>
      
      {!rolling && (
        <button className="roll-button" onClick={rollDice}>
          <i className="fas fa-dice"></i> Roll Dice
        </button>
      )}
    </div>
  );
};

export default DiceBox;