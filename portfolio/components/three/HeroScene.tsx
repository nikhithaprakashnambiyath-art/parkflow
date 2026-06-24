"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Center } from "@react-three/drei";
import * as THREE from "three";

// Mouse Parallax Camera Controller
function CameraRig() {
  const { camera, mouse } = useThree();
  const target = new THREE.Vector3(0, 0, 5);

  useFrame((state) => {
    // Smoothly interpolate camera position based on mouse coordinates
    target.x = THREE.MathUtils.lerp(target.x, mouse.x * 1.5, 0.05);
    target.y = THREE.MathUtils.lerp(target.y, mouse.y * 1.5, 0.05);
    target.z = 5;
    state.camera.position.copy(target);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

// Glowing crystal sphere with refractive transmission material
function CrystalSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!sphereRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Rotate sphere slowly
    sphereRef.current.rotation.x = time * 0.15;
    sphereRef.current.rotation.y = time * 0.2;
    
    // Pulsate scale slightly
    const scale = 1.6 + Math.sin(time * 1.5) * 0.05 + (hovered ? 0.1 : 0);
    sphereRef.current.scale.setScalar(scale);
  });

  return (
    <mesh
      ref={sphereRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 64, 64]} />
      <MeshTransmissionMaterial
        resolution={512}
        samples={8}
        thickness={1}
        roughness={0.15}
        chromaticAberration={0.06}
        anisotropy={0.1}
        distortion={0.3}
        distortionScale={0.5}
        temporalDistortion={0.1}
        clearcoat={1}
        attenuationDistance={0.5}
        attenuationColor="#6C63FF"
        color="#00E5FF"
      />
    </mesh>
  );
}

// Background field of drifting particles
function SpaceParticles({ count = 200 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useRef<Float32Array | null>(null);

  // Generate particle positions
  useEffect(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particles.current = arr;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    // Rotate particle cloud slowly
    pointsRef.current.rotation.y = time * 0.02;
    pointsRef.current.rotation.x = time * 0.01;
  });

  if (!particles.current) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#FFFFFF"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
      <Canvas
        className="pointer-events-auto"
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#050816"]} />
        <ambientLight intensity={0.2} />
        
        {/* Cinematic colorful lights */}
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#6C63FF" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00E5FF" />
        <directionalLight position={[0, 5, 2]} intensity={0.8} color="#8B5CF6" />
        <spotLight position={[5, 10, 5]} angle={0.3} penumbra={1} intensity={1} castShadow />

        <Center>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <CrystalSphere />
          </Float>
        </Center>

        <SpaceParticles count={150} />
        <CameraRig />
      </Canvas>
    </div>
  );
}
