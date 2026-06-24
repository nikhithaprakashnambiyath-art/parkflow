"use client";

import { Home, MapPinOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 selection:bg-cyan-500/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white shadow-sm dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-white/10 p-8 rounded-3xl text-center relative z-10 shadow-2xl"
      >
        <div className="w-16 h-16 bg-slate-800 border border-slate-300 dark:border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPinOff className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-950 dark:text-white font-medium mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-3">Destination Not Found</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
          The parking slot or page you are looking for has been moved, deleted, or does not exist. Let's get you back on route.
        </p>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all"
        >
          <Home className="w-4 h-4" /> Return to Hub
        </Link>
      </motion.div>
    </div>
  );
}
