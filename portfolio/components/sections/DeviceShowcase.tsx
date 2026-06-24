"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import useIsMobile from "../../hooks/useIsMobile";
import DeviceScene from "../three/DeviceScene";

type ProjectType = "parkflow" | "parking_sys" | "portfolio";

export default function DeviceShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<ProjectType>("parkflow");

  const tabDetails: Record<ProjectType, { name: string; tag: string; labelColor: string; desc: string }> = {
    parkflow: {
      name: "ParkFlow Dashboard",
      tag: "Web Reservation App",
      labelColor: "text-[#00E5FF]",
      desc: "Simulating a live reservation dashboard showcasing slot state telemetry, active earnings tracking, and ticket QR code validation passes.",
    },
    parking_sys: {
      name: "Smart Parking Node Terminal",
      tag: "IoT Telemetry Logger",
      labelColor: "text-[#8B5CF6]",
      desc: "Simulating edge hardware sensor reporting status logs (occupied vs vacant states) publishing updates to databases using MQTT handlers.",
    },
    portfolio: {
      name: "Universe Portfolio",
      tag: "3D Graphics Showcase",
      labelColor: "text-[#6C63FF]",
      desc: "Inside this portfolio, utilizing custom shader structures, Three.js lights, and responsive glassmorphism modules to showcase talent.",
    },
  };

  return (
    <section
      ref={containerRef}
      id="showcase"
      className="relative w-full py-24 md:py-32 px-6 overflow-hidden bg-[#050816] border-t border-slate-900 flex items-center"
    >
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#6C63FF]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#00E5FF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-left"
        >
          <span className="font-mono text-xs text-[#00E5FF] tracking-[0.3em] uppercase">05. INTERACTION</span>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mt-2 uppercase tracking-tight">
            DEVICE SHOWCASE
          </h2>
          <div className="w-12 h-1 bg-[#00E5FF] mt-4 rounded" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Tab list & summaries */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col justify-center space-y-4"
          >
            <p className="text-slate-400 text-sm font-light leading-relaxed mb-4">
              Toggle the links below to inspect real-time application simulations projected on the screen of our digital workspace laptop.
            </p>

            <div className="flex flex-col gap-3 pointer-events-auto">
              {(Object.keys(tabDetails) as ProjectType[]).map((tabId) => {
                const isActive = activeTab === tabId;
                return (
                  <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId)}
                    className={`text-left p-4 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? "bg-slate-950/80 border-[#6C63FF] shadow-neon-primary text-white"
                        : "bg-slate-950/20 border-white/5 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-heading text-base font-semibold tracking-wide">
                        {tabDetails[tabId].name}
                      </span>
                      <span className={`text-[10px] font-mono uppercase ${tabDetails[tabId].labelColor}`}>
                        {tabDetails[tabId].tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-light leading-relaxed mt-1">
                      {isActive && tabDetails[tabId].desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Device Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-7 flex items-center justify-center min-h-[350px] md:min-h-[450px]"
          >
            {isMobile ? (
              /* Mobile Fallback: Elegant browser mock */
              <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-4 shadow-2xl relative">
                {/* Header Dots */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Mobile Preview</span>
                </div>

                <div className="h-64 rounded bg-[#090b11] p-4 flex flex-col justify-between text-xs text-white border border-slate-900">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="text-[10px] font-mono text-[#00E5FF] tracking-widest uppercase">
                        {activeTab === "parkflow" && "PARKFLOW RESERVATION ENG"}
                        {activeTab === "parking_sys" && "AWS MQTT TELEMETRY"}
                        {activeTab === "portfolio" && "3D PORTFOLIO GALAXY"}
                      </div>
                      
                      {activeTab === "parkflow" && (
                        <div className="space-y-2 text-slate-300">
                          <p>● Occupancy optimized at 78%</p>
                          <p>● Core stack: Next.js + NestJS + PostgreSQL</p>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00E5FF] w-[78%]" />
                          </div>
                        </div>
                      )}

                      {activeTab === "parking_sys" && (
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-900 font-mono text-[9px] text-emerald-400 space-y-1">
                          <p>[MQTT] Broker initialized.</p>
                          <p>[Node-A] Space state altered.</p>
                          <p>[AWS IoT] Database synced successfully.</p>
                        </div>
                      )}

                      {activeTab === "portfolio" && (
                        <div className="space-y-2 text-slate-400 leading-relaxed font-light">
                          <p>Entering the immersive realm of personal branding. View interactive coordinates and custom materials.</p>
                          <div className="flex gap-1.5 pt-2">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px]">WebGL</span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px]">Tailwind</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="border-t border-slate-900 pt-2 text-[9px] text-slate-500 font-mono text-right uppercase">
                    Status: Online
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop: Real 3D Canvas Laptop */
              <div className="w-full h-full relative">
                <DeviceScene activeProject={activeTab} />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
