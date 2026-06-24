"use client";

import React, { useState } from "react";
import Loader from "../components/sections/Loader";
import CustomCursor from "../components/ui/CustomCursor";
import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Skills from "../components/sections/Skills";
import Projects from "../components/sections/Projects";
import Experience from "../components/sections/Experience";
import DeviceShowcase from "../components/sections/DeviceShowcase";
import Contact from "../components/sections/Contact";
import Footer from "../components/sections/Footer";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const scrollIntoSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* 1. Immersive Loader */}
      <Loader onComplete={() => setLoading(false)} />

      {!loading && (
        <main className="relative min-h-screen w-full bg-[#050816] text-white">
          {/* 2. Magnetic Custom Cursor */}
          <CustomCursor />

          {/* Navigation Bar */}
          <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-slate-950/20 backdrop-blur-md border-b border-white/5 select-none pointer-events-none">
            <div
              onClick={() => scrollIntoSection("hero")}
              className="font-heading text-lg font-bold tracking-widest text-[#00E5FF] cursor-pointer pointer-events-auto hover:text-white transition-colors duration-300"
            >
              NIKHITHA
            </div>
            
            <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-slate-400">
              <button
                onClick={() => scrollIntoSection("about")}
                className="hover:text-[#00E5FF] tracking-wider transition-colors duration-300 pointer-events-auto"
              >
                01. ABOUT
              </button>
              <button
                onClick={() => scrollIntoSection("skills")}
                className="hover:text-[#00E5FF] tracking-wider transition-colors duration-300 pointer-events-auto"
              >
                02. SKILLS
              </button>
              <button
                onClick={() => scrollIntoSection("projects")}
                className="hover:text-[#00E5FF] tracking-wider transition-colors duration-300 pointer-events-auto"
              >
                03. WORK
              </button>
              <button
                onClick={() => scrollIntoSection("experience")}
                className="hover:text-[#00E5FF] tracking-wider transition-colors duration-300 pointer-events-auto"
              >
                04. TIMELINE
              </button>
              <button
                onClick={() => scrollIntoSection("showcase")}
                className="hover:text-[#00E5FF] tracking-wider transition-colors duration-300 pointer-events-auto"
              >
                05. PREVIEWS
              </button>
              <button
                onClick={() => scrollIntoSection("contact")}
                className="hover:text-[#00E5FF] tracking-wider transition-colors duration-300 pointer-events-auto border border-[#6C63FF]/30 px-3 py-1 rounded bg-[#6C63FF]/10"
              >
                06. CONNECT
              </button>
            </nav>

            <a
              href="/presentation"
              className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 hover:text-white hover:border-[#00E5FF] transition-all duration-300 pointer-events-auto"
            >
              PRESENTATION DECK →
            </a>
          </header>

          {/* Sections Stack */}
          <div id="hero">
            <Hero
              onExploreClick={() => scrollIntoSection("about")}
              onProjectsClick={() => scrollIntoSection("projects")}
            />
          </div>
          
          <About />
          <Skills />
          <Projects />
          <Experience />
          <DeviceShowcase />
          <Contact />
          <Footer />
        </main>
      )}
    </>
  );
}
