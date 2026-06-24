"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import useIsMobile from "../../hooks/useIsMobile";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  longDesc: string;
  stack: string[];
  metrics?: { label: string; value: string }[];
  featured?: boolean;
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const isMobile = useIsMobile();

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  
  // Custom 3D tilt coordinates for cards
  const [tiltStyles, setTiltStyles] = useState<Record<string, string>>({});

  const projects: Project[] = [
    {
      id: "parkflow",
      title: "ParkFlow",
      subtitle: "Smart Parking Platform",
      desc: "Intelligent reservation and space allocation engine utilizing real-time dashboard analytics, interactive occupancy maps, and QR entry validations.",
      longDesc: "ParkFlow AI is a high-performance web solution designed to optimize metropolitan parking. It incorporates a live slot tracker grid showing sensor occupancy, instant Stripe integration for friction-free reservation payments, and a mobile-responsive dashboard containing live metrics, QR clearance pass downloads, and admin controls.",
      stack: ["Next.js 15", "TypeScript", "Tailwind CSS", "NestJS", "PostgreSQL", "Prisma", "Recharts"],
      featured: true,
      metrics: [
        { label: "Clearance Speed", value: "1.2s" },
        { label: "Occupancy Rate", value: "78%" },
        { label: "Active Nodes", value: "142" },
      ],
    },
    {
      id: "parking_sys",
      title: "Smart Parking IoT Node",
      subtitle: "Hardware Edge System",
      desc: "Raspberry Pi-driven vehicle detector network syncing slot status to AWS IoT databases via MQTT protocol pipelines.",
      longDesc: "An IoT physical computing system that tracks garage slots. Using HC-SR04 ultrasonic sensors, a Raspberry Pi Edge Node publishes distance data to an AWS IoT Core broker. A serverless lambda node catches the state transitions to update databases instantly.",
      stack: ["Raspberry Pi", "AWS IoT Core", "MQTT Protocol", "Python", "C++", "Ultrasonic Sensors"],
      metrics: [
        { label: "Sync Latency", value: "<150ms" },
        { label: "Power Efficiency", value: "98.4%" },
      ],
    },
    {
      id: "portfolio",
      title: "Portfolio Website",
      subtitle: "3D Digital Universe",
      desc: "Immersive 3D portfolio running programmatically generated crystal spheres, custom glassmorphism panels, and fluid page transitions.",
      longDesc: "The website you are currently exploring. Designed to challenge traditional portfolio layouts, it implements high-end Three.js lighting models, React Three Fiber physics, GSAP, and a customized presentation deck for internship demos.",
      stack: ["React Three Fiber", "Next.js 15", "Drei", "Three.js", "GSAP", "Framer Motion", "Tailwind"],
      metrics: [
        { label: "Performance Score", value: "99" },
        { label: "Refraction Index", value: "1.52" },
      ],
    },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (isMobile) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;

    // Tilt degree calculations
    const rotateX = -(y / (box.height / 2)) * 12;
    const rotateY = (x / (box.width / 2)) * 12;

    setTiltStyles((prev) => ({
      ...prev,
      [id]: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
    }));
  };

  const handleMouseLeave = (id: string) => {
    setTiltStyles((prev) => ({
      ...prev,
      [id]: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
    }));
  };

  return (
    <section
      ref={containerRef}
      id="projects"
      className="relative w-full py-24 md:py-32 px-6 overflow-hidden bg-[#050816] border-t border-slate-900"
    >
      {/* Decorative Gradients */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-[#6C63FF]/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-[#00E5FF]/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-left"
        >
          <span className="font-mono text-xs text-[#00E5FF] tracking-[0.3em] uppercase">03. WORK</span>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mt-2 uppercase tracking-tight">
            PROJECT SHOWCASE
          </h2>
          <div className="w-12 h-1 bg-[#6C63FF] mt-4 rounded" />
        </motion.div>

        {/* 1. Featured Project: ParkFlow Dashboard Presentation */}
        {projects.filter((p) => p.featured).map((proj) => (
          <motion.div
            key={proj.id}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12 pointer-events-auto"
          >
            <div
              onMouseMove={(e) => handleMouseMove(e, proj.id)}
              onMouseLeave={() => handleMouseLeave(proj.id)}
              style={{
                transform: tiltStyles[proj.id] || "perspective(1000px) rotateX(0) rotateY(0)",
                transformStyle: "preserve-3d",
                transition: "transform 0.1s ease-out",
              }}
              onClick={() => setActiveProject(proj)}
              className="glass-card p-6 md:p-10 rounded-2xl border border-[#6C63FF]/30 relative overflow-hidden group cursor-pointer"
            >
              {/* Glowing ring borders */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/10 to-[#00E5FF]/5 opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Text Side */}
                <div style={{ transform: "translateZ(30px)" }} className="lg:col-span-5 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[10px] font-mono rounded-full bg-[#6C63FF]/20 text-[#00E5FF] border border-[#6C63FF]/40">
                      FEATURED PROJECT
                    </span>
                  </div>
                  <h3 className="font-heading text-4xl font-bold text-white tracking-wide">
                    {proj.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">
                    {proj.desc}
                  </p>
                  
                  {/* Stack */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {proj.stack.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-400"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    {proj.metrics?.map((m, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-3 rounded border border-white/5">
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider">{m.label}</div>
                        <div className="text-lg font-bold text-[#00E5FF] text-neon-secondary mt-1">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Grid Side (Immersive Mock Preview) */}
                <div style={{ transform: "translateZ(40px)" }} className="lg:col-span-7 relative h-[320px] rounded-xl border border-slate-800 bg-[#090b11]/90 overflow-hidden p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">LIVE PREVIEW</span>
                  </div>

                  <div className="flex-1 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* Parking Map simulation */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 font-mono">Parking Map Node Grid:</div>
                      <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-3 rounded border border-slate-800">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-6 rounded border text-[9px] font-mono flex items-center justify-center ${
                              i === 1 || i === 4 || i === 7
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-[#6C63FF]/10 border-[#6C63FF]/30 text-[#6C63FF]"
                            }`}
                          >
                            P{i + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* QR Code Pass simulation */}
                    <div className="flex flex-col items-center justify-center p-3 border border-dashed border-slate-800 rounded bg-slate-950/60">
                      <div className="w-20 h-20 bg-white p-1 rounded flex items-center justify-center relative">
                        {/* Fake QR blocks */}
                        <div className="w-full h-full bg-[radial-gradient(circle_at_center,#050816_60%,transparent_100%)] opacity-30 absolute inset-0" />
                        <div className="grid grid-cols-5 gap-1 w-full h-full bg-slate-950">
                          {Array.from({ length: 25 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-full rounded-sm ${
                                (idx * 7) % 3 === 0 ? "bg-[#050816]" : "bg-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-[#00E5FF] mt-2 tracking-widest">TAP FOR QR PASS</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>SYSTEM STATE: SYNCED</span>
                    <span className="text-emerald-400">● STABLE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* 2. Grid of other projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.filter((p) => !p.featured).map((proj) => (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="pointer-events-auto"
            >
              <div
                onMouseMove={(e) => handleMouseMove(e, proj.id)}
                onMouseLeave={() => handleMouseLeave(proj.id)}
                style={{
                  transform: tiltStyles[proj.id] || "perspective(1000px) rotateX(0) rotateY(0)",
                  transformStyle: "preserve-3d",
                  transition: "transform 0.1s ease-out",
                }}
                onClick={() => setActiveProject(proj)}
                className="glass-card p-8 rounded-2xl border border-white/5 relative h-full flex flex-col justify-between cursor-pointer group"
              >
                <div style={{ transform: "translateZ(25px)" }} className="space-y-4">
                  <span className="font-mono text-xs text-[#8B5CF6] tracking-[0.25em] uppercase">
                    {proj.subtitle}
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-white tracking-wide group-hover:text-[#00E5FF] transition-colors duration-300">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {proj.desc}
                  </p>
                </div>

                <div style={{ transform: "translateZ(15px)" }} className="mt-8 pt-6 border-t border-slate-800/50">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.stack.slice(0, 4).map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#00E5FF]">
                    <span>EXPLORE PROJECT</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Fullscreen Expandable Project Modal overlay */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050816]/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="glass-card w-full max-w-4xl p-6 md:p-10 rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto relative pointer-events-auto shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveProject(null)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full border border-slate-850 bg-slate-950 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#00E5FF] transition-all duration-300 pointer-events-auto"
              >
                ✕
              </button>

              <div className="space-y-6">
                <div>
                  <span className="font-mono text-xs text-[#00E5FF] tracking-[0.2em] uppercase">
                    {activeProject.subtitle}
                  </span>
                  <h3 className="font-heading text-4xl font-extrabold text-white mt-1 uppercase">
                    {activeProject.title}
                  </h3>
                </div>

                <p className="text-slate-300 leading-relaxed font-light text-sm md:text-base">
                  {activeProject.longDesc}
                </p>

                {/* Tech Badge Grid */}
                <div>
                  <h4 className="font-heading text-sm font-semibold text-white mb-2 font-mono">TECHNICAL STACK:</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.stack.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metric Detail panels */}
                {activeProject.metrics && (
                  <div>
                    <h4 className="font-heading text-sm font-semibold text-white mb-2 font-mono">PERFORMANCE METRICS:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {activeProject.metrics.map((m, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-white/5 text-center">
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest">{m.label}</div>
                          <div className="text-2xl font-bold text-[#00E5FF] text-neon-secondary mt-2">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulated interactive display specifically for ParkFlow */}
                {activeProject.id === "parkflow" && (
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="font-heading text-xs font-semibold text-white font-mono tracking-wider">RESERVATION SIMULATOR:</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded border border-slate-850 bg-slate-900/40 text-xs text-slate-300 space-y-2">
                        <div className="font-bold text-[#6C63FF]">Simulate Reservation:</div>
                        <p className="font-light text-[11px] text-slate-400">Select parameters to dynamically compute occupancy values:</p>
                        <div className="flex gap-2 pt-2">
                          <span className="px-2 py-1 rounded bg-[#6C63FF]/20 border border-[#6C63FF]/30 text-white font-mono text-[10px] cursor-pointer">Zone A</span>
                          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] cursor-pointer">Zone B</span>
                          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] cursor-pointer">Zone C</span>
                        </div>
                      </div>

                      <div className="p-4 rounded border border-slate-850 bg-slate-900/40 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-slate-400 uppercase">Estimated Occupancy Cost</div>
                          <div className="text-xl font-bold text-white mt-1">$12.50 / hr</div>
                        </div>
                        <button className="px-4 py-2 rounded bg-[#00E5FF] text-slate-950 text-xs font-semibold hover:bg-white transition-colors duration-300">
                          Reserve Now
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* External links placeholder */}
                <div className="pt-6 border-t border-slate-850 flex gap-4">
                  <a
                    href="#contact"
                    onClick={() => setActiveProject(null)}
                    className="px-6 py-2.5 rounded-full bg-[#6C63FF] text-white text-xs font-semibold tracking-wider hover:bg-white hover:text-slate-950 hover:shadow-neon-primary transition-all duration-300"
                  >
                    Request Live Demo
                  </a>
                  <button
                    onClick={() => setActiveProject(null)}
                    className="px-6 py-2.5 rounded-full border border-slate-700 text-slate-400 hover:text-white text-xs hover:border-slate-500 transition-colors duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
