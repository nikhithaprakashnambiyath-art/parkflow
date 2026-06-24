"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

interface SkillNodeProps {
  id: string;
  name: string;
  color: string;
  radius: number;
  speed: number;
  initialAngle: number;
  onClick: (id: string) => void;
  activeId: string | null;
}

function SkillNode({
  id,
  name,
  color,
  radius,
  speed,
  initialAngle,
  onClick,
  activeId,
}: SkillNodeProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const isActive = activeId === id;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const angle = initialAngle + time * speed;
    
    // Orbit math
    meshRef.current.position.x = Math.cos(angle) * radius;
    meshRef.current.position.z = Math.sin(angle) * radius;
    // Add vertical bobbing
    meshRef.current.position.y = Math.sin(time * 2 + initialAngle) * 0.15;
  });

  return (
    <group ref={meshRef}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onClick(id)}
      >
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color={isActive || hovered ? color : "#475569"}
          emissive={isActive || hovered ? color : "#000000"}
          emissiveIntensity={isActive ? 1.5 : hovered ? 1 : 0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      
      {/* Interactive label floating above planet */}
      <Html distanceFactor={6} position={[0, 0.45, 0]} center>
        <button
          onClick={() => onClick(id)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold select-none border transition-all duration-300 pointer-events-auto ${
            isActive
              ? "bg-slate-900 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]"
              : hovered
              ? "bg-slate-900/90 border-[#6C63FF] text-[#6C63FF] scale-105"
              : "bg-slate-900/60 border-slate-700/50 text-slate-300"
          } backdrop-blur-md`}
          style={{ whiteSpace: "nowrap" }}
        >
          {name}
        </button>
      </Html>

      {/* Subtle orbiting ring guide */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Center Core of the Galaxy
function SkillGalaxyCore() {
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!coreRef.current) return;
    const time = state.clock.getElapsedTime();
    coreRef.current.rotation.y = time * 0.4;
    
    // Dynamic core pulsing
    const pulse = 0.55 + Math.sin(time * 3) * 0.05;
    coreRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={coreRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="#8B5CF6"
        emissive="#8B5CF6"
        emissiveIntensity={1.2}
        wireframe
      />
    </mesh>
  );
}

interface SkillsSceneProps {
  onNodeClick: (id: string) => void;
  activeNodeId: string | null;
}

export default function SkillsScene({ onNodeClick, activeNodeId }: SkillsSceneProps) {
  const skillNodes = [
    { id: "frontend", name: "Frontend Development", color: "#6C63FF", radius: 1.8, speed: 0.15, initialAngle: 0 },
    { id: "backend", name: "Backend Architecture", color: "#00E5FF", radius: 2.5, speed: -0.1, initialAngle: Math.PI / 2 },
    { id: "database", name: "Databases & Cache", color: "#8B5CF6", radius: 3.2, speed: 0.08, initialAngle: Math.PI },
    { id: "uiux", name: "UI/UX Design", color: "#EC4899", radius: 3.9, speed: -0.06, initialAngle: (3 * Math.PI) / 2 },
    { id: "tools", name: "DevOps & Tools", color: "#10B981", radius: 4.6, speed: 0.05, initialAngle: Math.PI / 4 },
  ];

  return (
    <div className="w-full h-full min-h-[350px] md:min-h-[500px]">
      <Canvas camera={{ position: [0, 4, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#8B5CF6" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00E5FF" />
        <directionalLight position={[0, 10, 0]} intensity={0.5} />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <SkillGalaxyCore />
          
          {skillNodes.map((node) => (
            <SkillNode
              key={node.id}
              id={node.id}
              name={node.name}
              color={node.color}
              radius={node.radius}
              speed={node.speed}
              initialAngle={node.initialAngle}
              onClick={onNodeClick}
              activeId={activeNodeId}
            />
          ))}
        </Float>
      </Canvas>
    </div>
  );
}
