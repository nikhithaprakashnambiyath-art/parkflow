"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Fast loading simulation with satisfying speed curve
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 4) + 1;
      if (count >= 100) {
        count = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(onComplete, 800); // Wait for exit animation
        }, 500);
      }
      setProgress(count);
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          className="fixed inset-0 bg-[#050816] z-[99999] flex flex-col items-center justify-center overflow-hidden"
          exit={{
            opacity: 0,
            y: "-100%",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
          }}
        >
          {/* Drifting Background Glow Spheres */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6C63FF]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Particle Field Overlay */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100 - Math.random() * 100],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Logo / Text reveal */}
          <div className="relative text-center select-none z-10">
            {/* Animated SVG Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex justify-center mb-6"
            >
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Rotating double neon rings */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-dashed border-[#6C63FF]/40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-xl border-2 border-solid border-[#00E5FF]/55 shadow-neon-secondary"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <span className="font-heading text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#6C63FF] to-[#00E5FF]">
                  N
                </span>
              </div>
            </motion.div>

            {/* Glowing Text */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-heading text-3xl md:text-4xl font-light tracking-[0.25em] text-white uppercase mb-2"
            >
              NIKHITHA
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xs md:text-sm font-sans tracking-[0.4em] text-slate-400 uppercase mb-8"
            >
              Digital Universe
            </motion.p>

            {/* Progress indicator */}
            <div className="w-64 h-[2px] bg-slate-800 rounded-full overflow-hidden mx-auto relative mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#00E5FF]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <motion.div className="font-heading text-lg text-slate-300 font-light tabular-nums">
              {progress}%
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
