"use client";

import React from "react";
import { motion } from "framer-motion";
import HeroScene from "../three/HeroScene";

interface HeroProps {
  onExploreClick: () => void;
  onProjectsClick: () => void;
}

export default function Hero({ onExploreClick, onProjectsClick }: HeroProps) {
  // Framer Motion reveal configs
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050816]">
      {/* 3D Background */}
      <HeroScene />

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center mt-12 md:mt-0 select-none">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Subtle upper tag */}
          <motion.div
            variants={itemVariants}
            className="px-4 py-1.5 rounded-full border border-[#00E5FF]/20 bg-slate-950/60 text-[#00E5FF] text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] mb-6 backdrop-blur-md"
          >
            Entering the Creative Realm
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="font-heading text-5xl md:text-8xl font-black tracking-tight text-white mb-2 leading-none uppercase"
          >
            NIKHITHA PRAKASH
          </motion.h1>

          {/* Animated Subtitle Tags */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-lg tracking-[0.15em] text-slate-300 font-light mt-4 mb-10"
          >
            <span className="font-medium text-[#6C63FF] text-neon-primary uppercase">Creative Developer</span>
            <span className="text-slate-600">•</span>
            <span className="font-medium text-[#00E5FF] text-neon-secondary uppercase">Full Stack Builder</span>
            <span className="text-slate-600">•</span>
            <span className="font-medium text-[#8B5CF6] uppercase">UI Designer</span>
          </motion.div>

          {/* Interactive CTAs */}
          <motion.div variants={itemVariants} className="flex gap-4 items-center">
            <button
              onClick={onExploreClick}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-sm font-semibold tracking-wider hover:scale-105 shadow-neon-primary hover:shadow-[0_0_30px_rgba(108,99,255,0.6)] transition-all duration-300 pointer-events-auto"
            >
              Explore Universe
            </button>
            <button
              onClick={onProjectsClick}
              className="px-8 py-3 rounded-full border border-slate-700 bg-slate-950/40 text-slate-300 text-sm font-medium tracking-wider hover:text-white hover:border-[#00E5FF] hover:bg-slate-900/60 transition-all duration-300 pointer-events-auto"
            >
              View Projects
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Down Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase">Scroll to enter</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-slate-700 flex justify-center p-1"
        >
          <div className="w-1 h-2 bg-[#00E5FF] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
