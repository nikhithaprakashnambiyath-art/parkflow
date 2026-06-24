"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import SkillsScene from "../three/SkillsScene";

type SkillId = "frontend" | "backend" | "database" | "uiux" | "tools";

interface SkillItem {
  name: string;
  level: number; // percentage
}

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeNode, setActiveNode] = useState<SkillId>("frontend");

  const skillCategories: Record<SkillId, { title: string; desc: string; color: string; items: SkillItem[] }> = {
    frontend: {
      title: "Frontend Development",
      desc: "Creating high-fidelity, fluid layouts and pixel-perfect interactive design systems.",
      color: "from-[#6C63FF] to-[#8B5CF6]",
      items: [
        { name: "Next.js (App Router)", level: 90 },
        { name: "React / React DOM", level: 95 },
        { name: "TypeScript", level: 85 },
        { name: "Tailwind CSS", level: 95 },
        { name: "Three.js / React Three Fiber / Drei", level: 80 },
        { name: "GSAP / Framer Motion", level: 85 },
      ],
    },
    backend: {
      title: "Backend Architecture",
      desc: "Building highly-performant, secure RESTful APIs and distributed systems logic.",
      color: "from-[#00E5FF] to-[#6C63FF]",
      items: [
        { name: "Node.js / Express.js", level: 88 },
        { name: "NestJS Framework", level: 80 },
        { name: "RESTful API Design", level: 92 },
        { name: "WebSockets & MQTT", level: 82 },
        { name: "Authentication (JWT, OAuth)", level: 88 },
        { name: "Microservices", level: 75 },
      ],
    },
    database: {
      title: "Databases & Cache",
      desc: "Designing scalable relational schemas, key-value stores, and database integrations.",
      color: "from-[#8B5CF6] to-[#00E5FF]",
      items: [
        { name: "PostgreSQL", level: 85 },
        { name: "MongoDB", level: 80 },
        { name: "Redis Caching", level: 78 },
        { name: "SQL & Query Optimization", level: 82 },
        { name: "Prisma ORM", level: 88 },
        { name: "Zustand (State Cache)", level: 90 },
      ],
    },
    uiux: {
      title: "UI/UX Design",
      desc: "Crafting minimalist luxury layouts, structural wireframes, and intuitive user flows.",
      color: "from-pink-500 to-[#8B5CF6]",
      items: [
        { name: "Figma Prototyping", level: 92 },
        { name: "Adobe Creative Cloud", level: 75 },
        { name: "Design System Engineering", level: 90 },
        { name: "Wireframing & User Flows", level: 88 },
        { name: "Typography & Layouts", level: 92 },
        { name: "Responsive Adaptation", level: 95 },
      ],
    },
    tools: {
      title: "DevOps & Core Tools",
      desc: "Deploying production-ready micro-apps, managing environment configurations, and continuous delivery.",
      color: "from-emerald-500 to-[#00E5FF]",
      items: [
        { name: "Docker Containerization", level: 78 },
        { name: "Git / GitHub Versioning", level: 90 },
        { name: "CI/CD & Github Actions", level: 75 },
        { name: "Postman Testing Suite", level: 88 },
        { name: "Vercel / Railway Deployment", level: 92 },
        { name: "Terminal / Bash Scripting", level: 80 },
      ],
    },
  };

  const handleNodeSelect = (id: string) => {
    if (Object.keys(skillCategories).includes(id)) {
      setActiveNode(id as SkillId);
    }
  };

  return (
    <section
      ref={containerRef}
      id="skills"
      className="relative w-full py-24 md:py-32 px-6 overflow-hidden bg-[#050816] border-t border-slate-900"
    >
      {/* Glow Spots */}
      <div className="absolute top-1/4 right-0 w-[350px] h-[350px] bg-[#00E5FF]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[350px] h-[350px] bg-[#6C63FF]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-left"
        >
          <span className="font-mono text-xs text-[#00E5FF] tracking-[0.3em] uppercase">02. TECHNOLOGIES</span>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mt-2 uppercase tracking-tight">
            SKILL GALAXY
          </h2>
          <div className="w-12 h-1 bg-[#8B5CF6] mt-4 rounded" />
        </motion.div>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3D Galaxy Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 relative rounded-2xl border border-white/5 bg-slate-950/20 overflow-hidden flex items-center justify-center p-2"
          >
            {/* Ambient inner glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,99,255,0.05)_0%,transparent_70%)] pointer-events-none" />
            
            <SkillsScene onNodeClick={handleNodeSelect} activeNodeId={activeNode} />
            
            <div className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
              Orbit Active. Click planets to toggle.
            </div>
          </motion.div>

          {/* Right Column: Tab Selector and Stats Overlay */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-6 flex flex-col justify-start space-y-6"
          >
            {/* Small Tab bar for quick access */}
            <div className="flex flex-wrap gap-2 pointer-events-auto">
              {(Object.keys(skillCategories) as SkillId[]).map((catId) => (
                <button
                  key={catId}
                  onClick={() => setActiveNode(catId)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-300 border ${
                    activeNode === catId
                      ? "bg-[#6C63FF] border-[#6C63FF] text-white shadow-neon-primary"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {catId.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Content box */}
            <div className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden min-h-[360px] flex flex-col justify-between pointer-events-auto">
              {/* Card Corner Highlight */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${skillCategories[activeNode].color} opacity-10 blur-xl pointer-events-none`} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNode}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 flex-1"
                >
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-white tracking-wide mb-2 uppercase">
                      {skillCategories[activeNode].title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-light">
                      {skillCategories[activeNode].desc}
                    </p>
                  </div>

                  {/* Skills Progress Grid */}
                  <div className="space-y-4 pt-2">
                    {skillCategories[activeNode].items.map((skill, index) => (
                      <div key={index} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-slate-300">
                          <span>{skill.name}</span>
                          <span className="text-[#00E5FF]">{skill.level}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden relative border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full bg-gradient-to-r ${skillCategories[activeNode].color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                <span>SYSTEM: COMPILING ENGINE</span>
                <span className="text-[#00E5FF]">READY</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
