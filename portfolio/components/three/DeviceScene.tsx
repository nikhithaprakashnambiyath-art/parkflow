"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface LaptopProps {
  activeProject: "parkflow" | "parking_sys" | "portfolio";
}

function LaptopModel({ activeProject }: LaptopProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    // Rotate the laptop slightly back and forth
    groupRef.current.rotation.y = time * 0.15;
  });

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      {/* 1. Laptop Base / Keyboard Deck */}
      <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[3.4, 0.1, 2.4]} />
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
      </mesh>
      
      {/* Keyboard details - dark touch-strip */}
      <mesh position={[0, 0.01, -0.2]}>
        <boxGeometry args={[3.0, 0.02, 1.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Trackpad detail */}
      <mesh position={[0, 0.01, 0.6]}>
        <boxGeometry args={[0.8, 0.01, 0.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} />
      </mesh>

      {/* Hinge */}
      <mesh position={[0, 0.02, -1.18]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 3.2, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} />
      </mesh>

      {/* 2. Laptop Lid (Rotated Open) */}
      <group position={[0, 0.02, -1.2]} rotation={[Math.PI / 1.7, 0, 0]}>
        {/* Back Cover */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[3.4, 2.2, 0.06]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </mesh>
        
        {/* Inner Screen Bezel */}
        <mesh position={[0, 1.1, 0.035]}>
          <boxGeometry args={[3.3, 2.1, 0.02]} />
          <meshStandardMaterial color="#020617" roughness={0.6} />
        </mesh>

        {/* Web Camera */}
        <mesh position={[0, 2.05, 0.05]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* 3. Embed HTML content using Drei Transform - Maps directly onto screen */}
        <Html
          transform
          occlude
          distanceFactor={1.62}
          position={[0, 1.1, 0.05]}
          rotation={[0, 0, 0]}
          className="w-[960px] h-[610px] select-none rounded bg-[#090b11] border border-slate-800 overflow-hidden"
        >
          <div className="w-full h-full p-6 text-white font-sans flex flex-col justify-between">
            {/* Screen Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="text-[11px] bg-slate-800/80 px-4 py-1 rounded-full border border-slate-700/50 text-[#00E5FF] font-mono select-none tracking-wider">
                {activeProject === "parkflow" && "https://parkflow.nikhitha.dev/dashboard"}
                {activeProject === "parking_sys" && "https://smartparking.nikhitha.dev"}
                {activeProject === "portfolio" && "https://universe.nikhitha.dev"}
              </div>
              <span className="w-6 h-6 rounded-md bg-slate-800/50 flex items-center justify-center text-xs">ℹ</span>
            </div>

            {/* Dynamic content depending on active projects */}
            <div className="flex-1 mt-4 flex flex-col justify-start">
              {activeProject === "parkflow" && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h4 className="text-xl font-heading font-semibold text-[#00E5FF] mb-1">ParkFlow AI Dashboard</h4>
                    <p className="text-xs text-slate-400">Intelligent Reservation & Space Allocation Engine</p>
                    
                    {/* Parking Grid Preview */}
                    <div className="grid grid-cols-6 gap-2 mt-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-9 rounded flex items-center justify-center text-[10px] font-mono border ${
                            i === 2 || i === 5 || i === 9 || i === 11
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-[#6C63FF]/10 border-[#6C63FF]/30 text-[#6C63FF]"
                          }`}
                        >
                          Slot {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-3 border-t border-slate-800/50 pt-4">
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wide">Available slots</div>
                      <div className="text-lg font-bold text-emerald-400">78%</div>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wide">Total Earnings</div>
                      <div className="text-lg font-bold text-[#6C63FF]">$4,820</div>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wide">Active Bookings</div>
                      <div className="text-lg font-bold text-[#00E5FF]">142</div>
                    </div>
                  </div>
                </div>
              )}

              {activeProject === "parking_sys" && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h4 className="text-xl font-heading font-semibold text-[#8B5CF6] mb-1">Smart Parking System IoT</h4>
                    <p className="text-xs text-slate-400">Sensor-Driven Hardware & Edge System Node</p>

                    <div className="bg-slate-900/80 p-4 rounded border border-slate-800 mt-6 font-mono text-[10px] space-y-1">
                      <p className="text-emerald-400">[System] Initializing Raspberry Pi & Ultrasonic Sensors...</p>
                      <p className="text-slate-400">[Sensor-A1] DISTANCE = 12.4cm -- STATUS: OCCUPIED</p>
                      <p className="text-slate-400">[Sensor-A2] DISTANCE = 188.1cm -- STATUS: VACANT</p>
                      <p className="text-emerald-400">[MQTT] Publishing space state update to AWS Broker...</p>
                      <p className="text-cyan-400">[API] Response 200 OK | Synchronization successful.</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-800/50 pt-2">
                    Features: Raspberry Pi Node • AWS IoT Core • MQTT protocol
                  </div>
                </div>
              )}

              {activeProject === "portfolio" && (
                <div className="flex flex-col h-full justify-between text-center items-center py-6">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full border border-dashed border-[#00E5FF] flex items-center justify-center mx-auto text-lg text-[#00E5FF] animate-spin-slow">⭐</div>
                    <h4 className="text-xl font-heading font-light tracking-wide mt-2">Nikhitha — Digital Universe</h4>
                    <p className="text-xs text-slate-400 max-w-sm">Premium 3D web experience designed to showcase high-fidelity interfaces and interactive animations.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-[9px] bg-slate-800 rounded font-mono">Next.js 15</span>
                    <span className="px-2 py-1 text-[9px] bg-slate-800 rounded font-mono">React Three Fiber</span>
                    <span className="px-2 py-1 text-[9px] bg-slate-800 rounded font-mono">GSAP</span>
                    <span className="px-2 py-1 text-[9px] bg-slate-800 rounded font-mono">Tailwind</span>
                  </div>
                </div>
              )}
            </div>

            {/* Screen Footer */}
            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span>System: ONLINE</span>
              <span>Click sections to interact</span>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function DeviceScene({ activeProject }: LaptopProps) {
  return (
    <div className="w-full h-full min-h-[300px] md:min-h-[400px] pointer-events-auto">
      <Canvas
        camera={{ position: [0, 1.2, 3.8], fov: 45 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00E5FF" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#6C63FF" />
        <directionalLight position={[0, 8, 2]} intensity={0.5} />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <LaptopModel activeProject={activeProject} />
        </Float>

        <ContactShadows
          position={[0, -0.9, 0]}
          opacity={0.4}
          scale={10}
          blur={2.4}
          far={1}
        />
      </Canvas>
    </div>
  );
}
