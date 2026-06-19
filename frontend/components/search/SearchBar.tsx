import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchStore } from '@/store/searchStore';

export function SearchBar() {
  const { searchQuery, setSearchQuery, suggestions, fetchResults } = useSearchStore();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Run search on query submit
  const triggerSearch = () => {
    fetchResults();
    setShowSuggestions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
    setActiveSuggestionIndex(-1);
  };

  const handleSuggestionClick = (val: string) => {
    setSearchQuery(val);
    setShowSuggestions(false);
    // Submit query immediately
    setTimeout(() => {
      fetchResults();
    }, 50);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setTimeout(() => {
      fetchResults();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        setSearchQuery(suggestions[activeSuggestionIndex]);
      }
      triggerSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleUseLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchQuery('Current Location');
          // Fetch results centered around current location
          setTimeout(() => {
            fetchResults();
          }, 50);
        },
        (error) => {
          console.error('Error fetching location:', error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="relative w-full max-w-2xl z-20" ref={dropdownRef}>
      {/* Search Input Container */}
      <div className="relative flex items-center bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl focus-within:border-cyan-500/50 transition-colors group">
        <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0 group-focus-within:text-cyan-400 transition-colors" />
        
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Where do you want to park? (e.g. Kozhikode Beach, Lulu Mall)"
          className="w-full bg-transparent border-0 py-3.5 pl-3 pr-10 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-0 text-base"
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pr-2 shrink-0">
          {searchQuery && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleUseLocation}
            title="Use current location"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-white/5 hover:border-cyan-500/30 flex items-center justify-center transition-all duration-300 active:scale-95"
          >
            <Compass className="w-4.5 h-4.5 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Autocomplete suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl text-sm transition-colors ${
                    activeSuggestionIndex === index
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-900/60'
                  }`}
                >
                  <MapPin className={`w-4 h-4 shrink-0 ${
                    activeSuggestionIndex === index ? 'text-cyan-400' : 'text-slate-500'
                  }`} />
                  <span className="truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
