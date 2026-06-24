"use client";

import { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (t: Theme) => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSelect = (t: Theme) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    applyTheme(t);
    setIsOpen(false);
  };

  useEffect(() => {
    if (theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const CurrentIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-white shadow-sm dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:text-white font-medium hover:bg-white dark:bg-slate-900 transition-all flex items-center justify-center shrink-0"
        aria-label="Toggle Theme"
      >
        <CurrentIcon className={`w-4 h-4 ${theme === 'dark' ? 'text-cyan-600 dark:text-cyan-400' : theme === 'light' ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="flex flex-col p-1">
            <button onClick={() => handleSelect('light')} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-900 text-amber-500 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-900 hover:text-slate-950 dark:text-white font-medium'}`}>
              <Sun className="w-4 h-4" /> Light
            </button>
            <button onClick={() => handleSelect('dark')} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-900 hover:text-slate-950 dark:text-white font-medium'}`}>
              <Moon className="w-4 h-4" /> Dark
            </button>
            <button onClick={() => handleSelect('system')} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${theme === 'system' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-medium font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:bg-slate-900 hover:text-slate-950 dark:text-white font-medium'}`}>
              <Monitor className="w-4 h-4" /> System
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
