"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export default function Presentation() {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const presentationRef = useRef<HTMLDivElement>(null);

  const slides: Slide[] = [
    {
      id: "intro",
      title: "INTERNSHIP PRESENTATION",
      subtitle: "Nikhitha Prakash — Digital Portfolio",
      content: (
        <div className="space-y-6 max-w-2xl text-left">
          <div className="inline-block px-3 py-1 text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 rounded border border-[#00E5FF]/20">
            ENGINEERING OVERVIEW
          </div>
          <h3 className="font-heading text-4xl md:text-5xl font-black text-white leading-tight uppercase">
            BRIDGING CREATIVE DESIGN & SECURE FULL-STACK
          </h3>
          <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed">
            I am Nikhitha Prakash, a Computer Science B.Tech student specializing in engineering production-grade, micro-animated web interfaces coupled with highly optimized backends.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">PRIMARY SCOPE</div>
              <div className="text-sm font-semibold text-white mt-1">Creative Frontend & Systems</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono">TARGET OUTCOME</div>
              <div className="text-sm font-semibold text-white mt-1">Internship presentation & Branding</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "problem",
      title: "THE PROBLEM",
      subtitle: "Metropolitan Parking Inefficiencies",
      content: (
        <div className="space-y-6 max-w-2xl text-left">
          <div className="inline-block px-3 py-1 text-xs font-mono text-[#FF5F56] bg-[#FF5F56]/10 rounded border border-[#FF5F56]/20">
            URBAN FRICTION
          </div>
          <h3 className="font-heading text-4xl md:text-5xl font-black text-white leading-tight uppercase">
            CONGESTION & VISIBILITY GAP
          </h3>
          <ul className="space-y-4 text-slate-300 font-light text-sm md:text-base">
            <li className="flex items-start gap-2.5">
              <span className="text-[#FF5F56] font-mono">01.</span>
              <span><strong>Search Overhead:</strong> Urban drivers waste hours seeking vacant spaces, generating traffic gridlocks.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#FF5F56] font-mono">02.</span>
              <span><strong>Data Isolation:</strong> Real-time garage sensor updates are rarely aggregated into accessible client apps.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#FF5F56] font-mono">03.</span>
              <span><strong>Friction-Heavy Checkouts:</strong> Manual payments cause logjams at entry and exit barriers.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "solution",
      title: "THE SOLUTION",
      subtitle: "ParkFlow AI Smart Parking Hub",
      content: (
        <div className="space-y-6 max-w-2xl text-left">
          <div className="inline-block px-3 py-1 text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 rounded border border-[#00E5FF]/20">
            INNOVATION TARGET
          </div>
          <h3 className="font-heading text-4xl md:text-5xl font-black text-white leading-tight uppercase">
            INTELLIGENT SLOT ALLOCATION
          </h3>
          <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed">
            ParkFlow aggregates live telemetry data directly to users, offering quick checkouts, space grids, and contactless entries.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
              <div className="text-[#00E5FF] text-lg mb-1 font-mono">✓</div>
              <div className="text-xs font-bold text-white uppercase">Live Booking Map</div>
              <p className="text-[10px] text-slate-500 mt-1">Instant slot availability visual mapping.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
              <div className="text-[#6C63FF] text-lg mb-1 font-mono">✓</div>
              <div className="text-xs font-bold text-white uppercase">Stripe Checkout</div>
              <p className="text-[10px] text-slate-500 mt-1">Automated transaction processing flow.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
              <div className="text-[#8B5CF6] text-lg mb-1 font-mono">✓</div>
              <div className="text-xs font-bold text-white uppercase">QR Gate Pass</div>
              <p className="text-[10px] text-slate-500 mt-1">Digital QR scan pass for automated clearances.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "architecture",
      title: "TECHNICAL ARCHITECTURE",
      subtitle: "Integrated Core Data Flow",
      content: (
        <div className="space-y-6 max-w-3xl text-left">
          <div className="inline-block px-3 py-1 text-xs font-mono text-[#8B5CF6] bg-[#8B5CF6]/10 rounded border border-[#8B5CF6]/20">
            SYSTEM BLUEPRINT
          </div>
          
          {/* Coded Schema Flow */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3 overflow-x-auto">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2 text-slate-500">
              <span>DATA ROUTING DIAGRAM</span>
              <span>MQTT + HTTP</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 text-center justify-between py-2">
              <div className="p-2.5 rounded bg-[#FF5F56]/10 border border-[#FF5F56]/40 text-[#FF5F56] w-full md:w-36">
                Hardware Node
                <div className="text-[9px] text-slate-500">Pi / Sensors</div>
              </div>
              <div className="text-slate-600">MQTT ➔</div>
              
              <div className="p-2.5 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/40 text-[#8B5CF6] w-full md:w-36">
                AWS IoT Core
                <div className="text-[9px] text-slate-500">Topic Pub/Sub</div>
              </div>
              <div className="text-slate-600">Sync ➔</div>
              
              <div className="p-2.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] w-full md:w-36">
                NestJS / Postgres
                <div className="text-[9px] text-slate-500">Core REST APIs</div>
              </div>
              <div className="text-slate-600">HTTP ➔</div>

              <div className="p-2.5 rounded bg-[#6C63FF]/10 border border-[#6C63FF]/40 text-[#6C63FF] w-full md:w-36 font-semibold">
                Next.js Clients
                <div className="text-[9px] text-slate-500">User Dashboard</div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 font-light leading-relaxed text-center">
            Edge nodes detect state changes, syncing to AWS logs. NextJS clients poll or subscribe to display parking analytics instantly.
          </p>
        </div>
      ),
    },
    {
      id: "demo",
      title: "INTERACTIVE DEMO",
      subtitle: "Telemetry Simulation Node",
      content: (
        <div className="space-y-6 max-w-2xl text-left">
          <div className="inline-block px-3 py-1 text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 rounded border border-[#00E5FF]/20">
            SIMULATOR ENVIRONMENT
          </div>
          <h3 className="font-heading text-3xl font-bold text-white uppercase mb-1">
            MOCK PLATFORM
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slot grid */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
              <div className="text-xs text-slate-400 font-mono mb-2">Simulate Sensor Slots:</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((slot) => (
                  <div
                    key={slot}
                    className={`p-2 text-center rounded border text-xs font-mono ${
                      slot === 2 || slot === 5
                        ? "bg-[#6C63FF]/10 border-[#6C63FF]/40 text-[#6C63FF]"
                        : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    }`}
                  >
                    Slot {slot}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick checkout */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-mono">INVOICING:</div>
                <div className="text-sm font-semibold text-white mt-1">Stripe Checkout Simulator</div>
              </div>
              <button
                onClick={() => alert("Simulation: Redirecting to secure test Stripe gateway...")}
                className="w-full mt-3 py-2 rounded-full bg-[#00E5FF] text-slate-950 text-xs font-bold hover:bg-white transition-colors duration-300"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "results",
      title: "KEY METRIC RESULTS",
      subtitle: "Measurable System Gains",
      content: (
        <div className="space-y-6 max-w-2xl text-left">
          <div className="inline-block px-3 py-1 text-xs font-mono text-[#8B5CF6] bg-[#8B5CF6]/10 rounded border border-[#8B5CF6]/20">
            ENGINEERING RESULTS
          </div>
          <h3 className="font-heading text-4xl md:text-5xl font-black text-white leading-tight uppercase">
            OPTIMIZED OUTCOMES
          </h3>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">GATE CLEARANCE</div>
              <div className="text-3xl font-black text-[#00E5FF] text-neon-secondary mt-2">1.2s</div>
              <p className="text-[9px] text-slate-500 mt-1">Average validation time</p>
            </div>
            
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">OCCUPANCY GAIN</div>
              <div className="text-3xl font-black text-[#6C63FF] text-neon-primary mt-2">+34%</div>
              <p className="text-[9px] text-slate-500 mt-1">Capacity optimization</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">LATENCY REDUCTION</div>
              <div className="text-3xl font-black text-[#8B5CF6] mt-2">90%</div>
              <p className="text-[9px] text-slate-500 mt-1">Under edge MQTT broker</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Auto-scroll loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  // Fullscreen controller
  const toggleFullscreen = () => {
    if (!presentationRef.current) return;
    const elem = presentationRef.current;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div
      ref={presentationRef}
      className="w-full min-h-screen bg-[#050816] text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden"
    >
      {/* Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6C63FF]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-900 pb-4 relative z-10 select-none">
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="w-8 h-8 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center text-xs hover:border-[#00E5FF] transition-colors duration-300 pointer-events-auto"
          >
            ←
          </a>
          <div>
            <h1 className="font-heading text-lg font-bold text-white tracking-widest">NIKHITHA</h1>
            <p className="text-[10px] font-mono text-slate-500 tracking-wider">CREATIVE INTERNSHIP DEMO</p>
          </div>
        </div>

        {/* Slide Counter HUD */}
        <div className="text-xs font-mono bg-slate-950/80 border border-slate-800 px-4 py-1.5 rounded-full text-slate-400">
          SLIDE <span className="text-[#00E5FF] font-bold tabular-nums">{currentSlideIdx + 1}</span> OF {slides.length}
        </div>
      </header>

      {/* Main Slide Content Area */}
      <main className="flex-1 my-10 flex items-center justify-center relative z-10 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIdx}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full flex flex-col md:flex-row gap-10 items-center justify-between max-w-5xl"
          >
            {/* Slide Info Side */}
            <div className="flex-1 space-y-4">
              <span className="font-mono text-xs text-[#00E5FF] tracking-[0.3em] uppercase">
                {slides[currentSlideIdx].subtitle}
              </span>
              <h2 className="font-heading text-4xl md:text-6xl font-black text-white leading-none uppercase">
                {slides[currentSlideIdx].title}
              </h2>
              <div className="w-16 h-1.5 bg-[#6C63FF] rounded mt-2" />
            </div>

            {/* Custom Interactive Elements Side */}
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="glass-card p-6 md:p-10 rounded-2xl border border-white/5 w-full max-w-lg shadow-2xl">
                {slides[currentSlideIdx].content}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer / Interactive HUD Panel */}
      <footer className="border-t border-slate-900 pt-6 flex flex-col md:flex-row gap-4 items-center justify-between relative z-10 select-none">
        {/* Navigation Indicator list */}
        <div className="flex gap-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIdx(idx)}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 pointer-events-auto flex items-center justify-center ${
                idx === currentSlideIdx
                  ? "bg-[#00E5FF] border-[#00E5FF] shadow-neon-secondary"
                  : "bg-slate-950 border-slate-800 text-[8px] hover:border-slate-600"
              }`}
              title={slide.title}
            />
          ))}
        </div>

        {/* Controls Block */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Autoplay toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-full border text-xs font-mono font-semibold tracking-wider transition-all duration-300 ${
              isPlaying
                ? "bg-[#6C63FF] border-[#6C63FF] text-white shadow-neon-primary"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {isPlaying ? "PAUSE DECK" : "START PRESENTATION"}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-[#00E5FF] text-xs font-mono tracking-wider transition-all duration-300"
          >
            {isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setCurrentSlideIdx((prev) => (prev - 1 + slides.length) % slides.length)
              }
              className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors duration-300"
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentSlideIdx((prev) => (prev + 1) % slides.length)}
              className="w-9 h-9 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors duration-300"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-500 text-center md:text-right">
          Use ← / → Arrow Keys to Navigate
        </div>
      </footer>
    </div>
  );
}
