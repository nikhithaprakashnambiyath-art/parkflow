import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/store/searchStore';

export function EmptyState() {
  const resetFilters = useSearchStore((state) => state.resetFilters);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-slate-300 dark:border-white/10 bg-white shadow-sm dark:bg-slate-900/40 backdrop-blur-md max-w-md mx-auto my-12 shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 mb-6 animate-pulse">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">No spots available</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
        We could not find any parking lots that match your exact search criteria. Try expanding your search radius or clearing some active filters.
      </p>
      <Button 
        onClick={resetFilters}
        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 border-0"
      >
        <RefreshCw className="w-4 h-4" /> Reset All Filters
      </Button>
    </div>
  );
}
