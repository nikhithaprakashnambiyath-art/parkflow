import React from 'react';

export function LoadingState() {
  return (
    <div className="space-y-4 w-full">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className="p-4 rounded-2xl border border-white/5 bg-slate-900/30 backdrop-blur-sm animate-pulse flex flex-col gap-4 relative overflow-hidden"
        >
          {/* Shimmer overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          
          <div className="flex gap-4">
            {/* Image Placeholder */}
            <div className="w-24 h-24 rounded-xl bg-slate-800 shrink-0" />
            
            {/* Text details placeholders */}
            <div className="flex-1 space-y-2.5">
              <div className="h-5 w-3/4 bg-slate-800 rounded" />
              <div className="h-3 w-1/2 bg-slate-800 rounded" />
              <div className="flex gap-2 pt-2">
                <div className="h-3 w-16 bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-800 rounded" />
              </div>
            </div>
          </div>
          
          {/* Bottom details placeholders */}
          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <div className="space-y-1">
              <div className="h-3 w-12 bg-slate-800 rounded" />
              <div className="h-4 w-20 bg-slate-800 rounded" />
            </div>
            <div className="h-9 w-24 bg-slate-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
