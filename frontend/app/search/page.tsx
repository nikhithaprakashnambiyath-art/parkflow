'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearchStore } from '@/store/searchStore';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, fetchResults } = useSearchStore();
  const [isSearching, setIsSearching] = useState(false);

  // If a query is set, we immediately enter the active search results layout
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
    }
  }, [searchQuery]);

  const handlePopularAreaClick = (area: string) => {
    setSearchQuery(area);
    setIsSearching(true);
    // Let the state register before fetching
    setTimeout(() => {
      fetchResults();
    }, 50);
  };

  const handleBack = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 flex flex-col font-sans overflow-hidden">
      
      <AnimatePresence mode="wait">
        {!isSearching ? (
          
          /* Hero Search Screen State */
          <motion.div
            key="hero-search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 relative"
          >
            {/* Cyber Ring Background Grid */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[800px] h-[800px] rounded-full border border-cyan-500/10 animate-[spin_120s_infinite_linear] flex items-center justify-center">
                <div className="w-[600px] h-[600px] rounded-full border border-cyan-500/5 flex items-center justify-center">
                  <div className="w-[400px] h-[400px] rounded-full border border-cyan-500/20" />
                </div>
              </div>
            </div>

            {/* Glowing spot background */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-2xl flex flex-col items-center z-10 space-y-8 text-center">
              
              {/* Logo / Badge */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2 cursor-pointer px-4 py-1.5 rounded-full bg-slate-900/60 border border-white/5 backdrop-blur-md"
                onClick={() => router.push('/')}
              >
                <div className="w-5 h-5 rounded bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-black text-white text-[10px]">
                  PF
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">ParkFlow AI Discovery</span>
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </motion.div>

              {/* Centered Heading */}
              <div className="space-y-3">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-6xl font-black tracking-tight leading-none bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent"
                >
                  Where do you want <br /> to park?
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm sm:text-base text-slate-400 max-w-md mx-auto"
                >
                  Discover and reserve premium, secure parking spots near your destination instantly.
                </motion.p>
              </div>

              {/* Centered Search Bar */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-full flex justify-center"
              >
                <SearchBar />
              </motion.div>

              {/* Popular Area Links */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-3 pt-4"
              >
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest block">Popular Kerala Landmarks</span>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                  {['Kozhikode Beach', 'HiLite Mall, Calicut', 'Lulu Mall, Kochi', 'Thampanoor Hub', 'Thrissur Round'].map((area) => (
                    <button
                      key={area}
                      onClick={() => handlePopularAreaClick(area)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-cyan-500/30 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-all duration-300 active:scale-95"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </motion.div>

            </div>
          </motion.div>
        ) : (
          
          /* Active Search View State */
          <motion.div
            key="active-search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Header Navigation Bar */}
            <header className="w-full py-4 px-6 border-b border-white/5 flex items-center justify-between gap-4 bg-slate-950/60 backdrop-blur-xl z-20 shrink-0">
              
              {/* Back Button & Brand Logo */}
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={handleBack}
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div 
                  className="flex items-center gap-2 cursor-pointer hidden sm:flex" 
                  onClick={() => router.push('/')}
                >
                  <div className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    PF
                  </div>
                  <span className="text-lg font-black tracking-tight">ParkFlow <span className="text-cyan-400">AI</span></span>
                </div>
              </div>

              {/* Centered Navigation Search Bar */}
              <div className="flex-1 max-w-xl flex justify-center">
                <SearchBar />
              </div>

              {/* User Profile / Dashboard Link */}
              <div className="shrink-0">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold transition-all duration-200"
                >
                  Dashboard
                </button>
              </div>

            </header>

            {/* Results Split Screen Grid Container */}
            <SearchResults />

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
