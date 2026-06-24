"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  const currentYear = new Date().getFullYear();

  // SVG Cursive path for Nikhitha's signature
  const signaturePath = "M15 45 C35 15, 40 10, 48 38 C55 60, 60 25, 68 45 C75 62, 85 8, 92 48 C98 62, 105 30, 112 45 C120 58, 125 22, 138 42 C145 52, 155 30, 165 46";

  const socialLinks = [
    { label: "LinkedIn", href: "https://linkedin.com/in/nikhitha-prakash" },
    { label: "GitHub", href: "https://github.com/nikhithaprakashnambiyath-art" },
    { label: "Email", href: "mailto:nikhitha.prakash.dev@gmail.com" },
  ];

  return (
    <footer
      ref={containerRef}
      className="relative w-full py-12 px-6 overflow-hidden bg-[#050816] border-t border-slate-900/60"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Left Side: Copyright */}
        <div className="text-center md:text-left space-y-1">
          <p className="text-xs text-slate-500 font-mono tracking-wider">
            &copy; {currentYear} NIKHITHA PRAKASH. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            DESIGNED & CODED FROM THE DIGITAL UNIVERSE.
          </p>
        </div>

        {/* Center: Interactive animated signature */}
        <div className="flex flex-col items-center justify-center space-y-1 select-none">
          <svg
            width="180"
            height="70"
            viewBox="0 0 180 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-80"
          >
            <motion.path
              d={signaturePath}
              stroke="#00E5FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
          <span className="text-[9px] font-mono text-slate-500 tracking-[0.4em] uppercase">Signature</span>
        </div>

        {/* Right Side: Social links */}
        <div className="flex items-center gap-6 font-mono text-xs text-slate-400">
          {socialLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00E5FF] tracking-wider transition-colors duration-300 pointer-events-auto"
            >
              {link.label.toUpperCase()}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
