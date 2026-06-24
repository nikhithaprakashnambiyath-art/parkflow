"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface TimelineItem {
  year: string;
  title: string;
  company: string;
  desc: string;
  tag: string;
  points: string[];
}

export default function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const timelineData: TimelineItem[] = [
    {
      year: "2026",
      title: "Digital Universe & 3D Interactive Portfolio",
      company: "Personal Branding & Internship Presentation",
      desc: "Developed an immersive 3D personal site designed to showcase engineering systems.",
      tag: "UI / WebGL",
      points: [
        "Constructed custom WebGL geometries using React Three Fiber and Drei",
        "Achieved a 90+ Lighthouse performance score through asset-less procedural shader models",
        "Developed custom HTML transform screen preview frameworks and responsive mobile fallbacks",
      ],
    },
    {
      year: "2025 - 2026",
      title: "Full Stack Developer Intern",
      company: "ParkFlow AI Smart Parking Solution",
      desc: "Worked closely on front-to-back engineering tasks for an intelligent parking reservation hub.",
      tag: "Internship",
      points: [
        "Implemented real-time slot grids displaying visual sensor status updates via NestJS event servers",
        "Engineered secure checkout modules integrating Stripe payment gateways and automatic invoices",
        "Developed dynamic QR Code pass generation logic for rapid scanning clearances at parking barriers",
        "Refactored components to conform to a strict custom design system for optimized responsive states",
      ],
    },
    {
      year: "2024",
      title: "IoT Node Systems Developer",
      company: "Smart Parking Edge Prototype",
      desc: "Prototyped a physical slot detector tracking occupancy through telemetry brokers.",
      tag: "IoT / Systems",
      points: [
        "Configured a Raspberry Pi edge node running Python scripts connected to ultrasonic detectors",
        "Published slot state changes using MQTT protocol pipelines connected to AWS IoT Core endpoints",
        "Designed database sync scripts fetching telemetry logs to PostgreSQL instances",
      ],
    },
    {
      year: "2022 - 2026",
      title: "B.Tech in Computer Science & Engineering",
      company: "Engineering University",
      desc: "Acquired core academic foundations in software architectures, data structures, and databases.",
      tag: "Academic",
      points: [
        "Specialized in advanced database systems, relational structures, and web technologies",
        "Maintained high academic standing, collaborating on various engineering team prototypes",
        "Active member of coding clubs and UI/UX design communities",
      ],
    },
  ];

  return (
    <section
      ref={containerRef}
      id="experience"
      className="relative w-full py-24 md:py-32 px-6 overflow-hidden bg-[#050816] border-t border-slate-900"
    >
      {/* Glow Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-left"
        >
          <span className="font-mono text-xs text-[#00E5FF] tracking-[0.3em] uppercase">04. MILESTONES</span>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mt-2 uppercase tracking-tight">
            TIMELINE OF EXPERIENCE
          </h2>
          <div className="w-12 h-1 bg-[#8B5CF6] mt-4 rounded" />
        </motion.div>

        {/* Timeline Stack */}
        <div className="relative border-l border-slate-800/80 pl-6 md:pl-10 ml-2 md:ml-6 space-y-12">
          {/* Animated Scroll glow tracer */}
          <div className="absolute left-[-1.5px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#6C63FF] via-[#8B5CF6] to-[#00E5FF] opacity-30" />

          {timelineData.map((item, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                {/* Glowing Node Dot */}
                <span className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-[#050816] border-[3px] border-[#00E5FF] shadow-neon-secondary z-10 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-[#6C63FF]" />
                </span>

                {/* Content Box */}
                <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/5 relative group pointer-events-auto">
                  {/* Subtle year overlay */}
                  <span className="absolute top-6 right-6 font-mono text-xs font-bold text-[#00E5FF] bg-slate-900 border border-[#00E5FF]/20 px-3 py-1 rounded-full">
                    {item.year}
                  </span>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#8B5CF6] uppercase tracking-widest bg-[#8B5CF6]/10 px-2 py-0.5 rounded border border-[#8B5CF6]/20">
                        {item.tag}
                      </span>
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-white tracking-wide mt-2">
                        {item.title}
                      </h3>
                      <p className="text-sm font-semibold text-slate-400 mt-1">
                        {item.company}
                      </p>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                      {item.desc}
                    </p>

                    {/* Bullet Achievements */}
                    <ul className="space-y-2 mt-4 pl-4 list-disc text-xs text-slate-400 font-light">
                      {item.points.map((p, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
