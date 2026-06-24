import React from 'react';
import { SlidersHorizontal, Zap, Shield, HelpCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchStore } from '@/store/searchStore';
import { formatCurrency } from '@/lib/utils';

const VEHICLE_TYPES = [
  { value: 'all', label: 'All Vehicles' },
  { value: 'compact', label: 'Compact' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Truck' },
  { value: 'motorcycle', label: 'Motorcycle' },
];

export function SearchFilters() {
  const { filters, setFilters, resetFilters } = useSearchStore();

  const handleToggle = (key: 'evCharging' | 'covered' | 'security' | 'accessibility') => {
    setFilters({ [key]: !filters[key] });
  };

  const handleVehicleTypeChange = (type: any) => {
    setFilters({ vehicleType: type });
  };

  return (
    <div className="w-full bg-slate-950/30 backdrop-blur-md border border-slate-300 dark:border-white/5 rounded-2xl p-5 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-white/5">
        <div className="flex items-center gap-2 text-slate-200">
          <SlidersHorizontal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-sm font-bold tracking-wider uppercase">Search Filters</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-slate-900 dark:text-slate-500 hover:text-cyan-600 dark:text-cyan-400 transition-colors flex items-center gap-1 active:scale-95"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Sliders Container */}
      <div className="space-y-4">
        
        {/* Distance Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Max Distance</span>
            <span className="text-cyan-600 dark:text-cyan-400">{filters.distance} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={filters.distance}
            onChange={(e) => setFilters({ distance: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-900 dark:text-slate-500 font-bold">
            <span>1 km</span>
            <span>30 km</span>
          </div>
        </div>

        {/* Price Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Max Pricing</span>
            <span className="text-cyan-600 dark:text-cyan-400">{formatCurrency(filters.price)}/hr</span>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="10"
            value={filters.price}
            onChange={(e) => setFilters({ price: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-900 dark:text-slate-500 font-bold">
            <span>₹20</span>
            <span>₹300</span>
          </div>
        </div>

      </div>

      {/* Date & Time Selection */}
      <div className="space-y-3 border-t border-slate-300 dark:border-white/5 pt-4">
        <span className="text-xs text-slate-900 dark:text-slate-500 block uppercase font-bold tracking-wider">Reservation Window</span>
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider block mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={filters.startTime}
              onChange={(e) => setFilters({ startTime: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider block mb-1">End Time</label>
            <input
              type="datetime-local"
              value={filters.endTime}
              onChange={(e) => setFilters({ endTime: e.target.value })}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Toggles Container */}
      <div className="space-y-3">
        <span className="text-xs text-slate-900 dark:text-slate-500 block uppercase font-bold tracking-wider">Amenities</span>
        
        <div className="grid grid-cols-2 gap-2">
          
          {/* EV Charging */}
          <button
            onClick={() => handleToggle('evCharging')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 ${
              filters.evCharging
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(0,217,255,0.08)]'
                : 'bg-white shadow-sm dark:bg-slate-900/40 border-slate-300 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:border-white/10 hover:text-slate-700 dark:text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>EV Charging</span>
          </button>

          {/* Covered Parking */}
          <button
            onClick={() => handleToggle('covered')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 ${
              filters.covered
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(0,217,255,0.08)]'
                : 'bg-white shadow-sm dark:bg-slate-900/40 border-slate-300 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:border-white/10 hover:text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center text-[8px] font-bold">C</div>
            <span>Covered</span>
          </button>

          {/* Security */}
          <button
            onClick={() => handleToggle('security')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 ${
              filters.security
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(0,217,255,0.08)]'
                : 'bg-white shadow-sm dark:bg-slate-900/40 border-slate-300 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:border-white/10 hover:text-slate-700 dark:text-slate-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>

          {/* Accessibility */}
          <button
            onClick={() => handleToggle('accessibility')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 ${
              filters.accessibility
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(0,217,255,0.08)]'
                : 'bg-white shadow-sm dark:bg-slate-900/40 border-slate-300 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:border-white/10 hover:text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded border border-current flex items-center justify-center text-[8px] font-bold">♿</div>
            <span>ADA Access</span>
          </button>

        </div>
      </div>

      {/* Vehicle Type Selector */}
      <div className="space-y-2">
        <span className="text-xs text-slate-900 dark:text-slate-500 block uppercase font-bold tracking-wider">Vehicle Type</span>
        <div className="flex flex-wrap gap-1.5">
          {VEHICLE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleVehicleTypeChange(type.value)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                filters.vehicleType === type.value
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-white shadow-sm dark:bg-slate-900/40 border-slate-300 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:border-white/10 hover:text-slate-700 dark:text-slate-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
