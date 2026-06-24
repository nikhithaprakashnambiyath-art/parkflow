"use client";

import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import useIsMobile from "../../hooks/useIsMobile";

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const isMobile = useIsMobile();

  // Mouse coords for 3D tilt card
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;

    // Calculate degree angles (max 10 degrees tilt)
    const factorX = -(y / (box.height / 2)) * 10;
    const factorY = (x / (box.width / 2)) * 10;

    setRotateX(factorX);
    setRotateY(factorY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const cardData = [
    {
      title: "Education",
      desc: "B.Tech in Computer Science & Engineering",
      sub: "Focus on Web Technologies, UI Engineering & Distributed Systems",
    },
    {
      title: "Experience",
      desc: "Internship Candidate & Full Stack Builder",
      sub: "Developing high-fidelity platforms like ParkFlow (Smart Parking Solutions)",
    },
    {
      title: "Mission",
      desc: "Building immersive digital experiences",
      sub: "Fusing state-of-the-art WebGL with production-grade enterprise codebases",
    },
    {
      title: "Achievements",
      desc: "UI/UX Hackathons & Engineering Innovations",
      sub: "Awarded top design titles for fluid UX animations and application speed",
    },
  ];

  return (
    <section
      ref={containerRef}
      id="about"
      className="relative w-full py-24 md:py-32 px-6 overflow-hidden bg-[#050816] flex items-center"
    >
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#6C63FF]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#8B5CF6]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-left"
        >
          <span className="font-mono text-xs text-[#00E5FF] tracking-[0.3em] uppercase">01. BIOGRAPHY</span>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mt-2 uppercase tracking-tight">
            ABOUT THE BUILDER
          </h2>
          <div className="w-12 h-1 bg-[#6C63FF] mt-4 rounded" />
        </motion.div>

        {/* Contents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Big Interactive Tilt Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col justify-between"
          >
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transformStyle: "preserve-3d",
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              }}
              className="glass-card p-8 md:p-10 rounded-2xl h-full flex flex-col justify-between border border-white/10 relative overflow-hidden group pointer-events-auto"
            >
              {/* Card Glow Spotlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#6C63FF]/5 to-[#00E5FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div style={{ transform: "translateZ(50px)" }} className="space-y-6">
                <span className="font-mono text-xs text-[#00E5FF]/85 tracking-[0.2em] uppercase">Internship Candidate</span>
                <h3 className="font-heading text-3xl font-bold text-white leading-tight">
                  NIKHITHA PRAKASH
                </h3>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                  A passionate creative developer specializing in engineering high-fidelity digital universes. I bridge the gap between creative visual designs and optimized backend databases, coding animations that spark joy.
                </p>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  Driven by pixel-perfection, design-systems, and custom WebGL environments, I strive to make web interfaces feel alive.
                </p>
              </div>

              <div style={{ transform: "translateZ(30px)" }} className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-[#6C63FF]">CREATIVITY</span>
                <span className="text-slate-500">&lt; / &gt;</span>
                <span className="text-[#00E5FF]">PRODUCTION</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Key Tiles */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {cardData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                className="glass-card p-6 rounded-xl flex flex-col justify-between border border-white/5 pointer-events-auto"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    <h4 className="font-heading text-lg font-semibold text-white tracking-wide">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mb-2">
                    {item.desc}
                  </p>
                </div>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {item.sub}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
