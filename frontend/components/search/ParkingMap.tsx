import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, Navigation, Zap } from 'lucide-react';
import { useSearchStore, ParkingLot } from '@/store/searchStore';
import { formatCurrency } from '@/lib/utils';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

export function ParkingMap() {
  const { results, selectedSpot, setSelectedSpot } = useSearchStore();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mapRef = useRef<SVGSVGElement>(null);

  // Parse spot coordinate JSON
  const getSpotCoords = (spot: ParkingLot) => {
    try {
      const parsed = JSON.parse(spot.coordinates);
      return { lat: parsed.lat, lng: parsed.lng };
    } catch {
      return { lat: 11.2588, lng: 75.7804 }; // default Kozhikode fallback
    }
  };

  // Dynamically calculate coordinate bounds for mapping based on loaded results
  let minLat = 11.200;
  let maxLat = 11.350;
  let minLng = 75.700;
  let maxLng = 75.880;

  if (results.length > 0) {
    const lats = results.map(r => getSpotCoords(r).lat);
    const lngs = results.map(r => getSpotCoords(r).lng);
    const padding = 0.025; // Add padding around outer pins
    minLat = Math.min(...lats) - padding;
    maxLat = Math.max(...lats) + padding;
    minLng = Math.min(...lngs) - padding;
    maxLng = Math.max(...lngs) + padding;
  }

  const getX = (lng: number) => {
    return ((lng - minLng) / (maxLng - minLng)) * MAP_WIDTH;
  };

  const getY = (lat: number) => {
    return MAP_HEIGHT - ((lat - minLat) / (maxLat - minLat)) * MAP_HEIGHT;
  };

  // User location: dynamically aligned near the loaded city results, fallback to Kozhikode
  const getUserCoords = () => {
    if (results.length > 0) {
      const firstCoords = getSpotCoords(results[0]);
      return { lat: firstCoords.lat - 0.006, lng: firstCoords.lng - 0.006 };
    }
    return { lat: 11.2588, lng: 75.7804 };
  };

  const userCoords = getUserCoords();
  const userX = getX(userCoords.lng);
  const userY = getY(userCoords.lat);

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 4));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(z - 0.3, 0.7);
      if (next === 0.7) setPan({ x: 0, y: 0 }); // Reset pan if zoomed out fully
      return next;
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click drag
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Prevent scroll propagation on map zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.max(0.7, Math.min(z * zoomFactor, 4)));
  };

  // Mock street networks
  const mockStreets = [
    // Vertical streets
    { x1: 150, y1: 0, x2: 150, y2: 600 },
    { x1: 250, y1: 0, x2: 250, y2: 600 },
    { x1: 350, y1: 0, x2: 350, y2: 600 },
    { x1: 450, y1: 0, x2: 450, y2: 600 },
    { x1: 550, y1: 0, x2: 550, y2: 600 },
    { x1: 650, y1: 0, x2: 650, y2: 600 },
    // Horizontal streets
    { x1: 0, y1: 100, x2: 800, y2: 100 },
    { x1: 0, y1: 200, x2: 800, y2: 200 },
    { x1: 0, y1: 300, x2: 800, y2: 300 },
    { x1: 0, y1: 400, x2: 800, y2: 400 },
    { x1: 0, y1: 500, x2: 800, y2: 500 },
    // Diagonal highways
    { x1: 0, y1: 600, x2: 800, y2: 150, isHighway: true },
    { x1: 200, y1: 0, x2: 600, y2: 600, isHighway: true },
  ];

  // Selected spot coordinates
  const activeSpotCoords = selectedSpot ? getSpotCoords(selectedSpot) : null;
  const activeX = activeSpotCoords ? getX(activeSpotCoords.lng) : null;
  const activeY = activeSpotCoords ? getY(activeSpotCoords.lat) : null;

  return (
    <div 
      className="w-full h-full relative bg-[#070b13] overflow-hidden select-none cursor-grab active:cursor-grabbing rounded-2xl border border-slate-300 dark:border-white/5"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onWheel={handleWheel}
    >
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #00D9FF 1px, transparent 0),
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 0),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 0)
          `,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
        }}
      />

      {/* SVG Canvas Map */}
      <svg
        ref={mapRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-full"
      >
        {/* Transforming Group representing zoom and pan */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="transition-transform duration-100 ease-out origin-center">
          
          {/* Waterway (SF Bay representation on the right/top) */}
          <path
            d="M 600 0 Q 650 200 700 350 T 800 600 L 800 0 Z"
            fill="#0f1f38"
            opacity="0.6"
          />

          {/* Central Park Reserve Representation */}
          <rect
            x="50"
            y="250"
            width="160"
            height="80"
            rx="12"
            fill="#122a1d"
            opacity="0.5"
            stroke="#1d3d2c"
            strokeWidth="1"
          />
          <text x="130" y="295" fill="#4ade80" fontSize="10" fontWeight="bold" opacity="0.4" textAnchor="middle">
            Central Park Reserve
          </text>

          {/* Render Street Grids */}
          {mockStreets.map((street, index) => (
            <line
              key={index}
              x1={street.x1}
              y1={street.y1}
              x2={street.x2}
              y2={street.y2}
              stroke={street.isHighway ? '#1e293b' : '#0f172a'}
              strokeWidth={street.isHighway ? 6 : 3}
              strokeLinecap="round"
            />
          ))}

          {/* Render Inner Street Highlights */}
          {mockStreets.map((street, index) => (
            <line
              key={`h-${index}`}
              x1={street.x1}
              y1={street.y1}
              x2={street.x2}
              y2={street.y2}
              stroke={street.isHighway ? '#334155' : '#1e293b'}
              strokeWidth={street.isHighway ? 2 : 1}
              strokeLinecap="round"
            />
          ))}

          {/* Animated Route Line from User to Selected Parking Spot */}
          {activeX !== null && activeY !== null && (
            <>
              {/* Pulsing glow background route */}
              <motion.path
                d={`M ${userX} ${userY} Q ${(userX + activeX) / 2} ${(userY + activeY) / 2 - 50} ${activeX} ${activeY}`}
                fill="none"
                stroke="#00D9FF"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6 }}
              />
              {/* Primary dashed route */}
              <motion.path
                d={`M ${userX} ${userY} Q ${(userX + activeX) / 2} ${(userY + activeY) / 2 - 50} ${activeX} ${activeY}`}
                fill="none"
                stroke="#00D9FF"
                strokeWidth="2"
                strokeDasharray="6,4"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -20 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
            </>
          )}

          {/* User Location Pin */}
          <g transform={`translate(${userX}, ${userY})`}>
            {/* Outer pulse */}
            <circle r="22" fill="#3b82f6" opacity="0.12" />
            <motion.circle
              r="22"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
              animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
            />
            {/* Inner dot */}
            <circle r="7" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Parking Spots Pins */}
          {results.map((spot) => {
            const coords = getSpotCoords(spot);
            const x = getX(coords.lng);
            const y = getY(coords.lat);
            const isSelected = selectedSpot?.id === spot.id;

            return (
              <g 
                key={spot.id} 
                transform={`translate(${x}, ${y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSpot(spot);
                }}
                className="cursor-pointer"
              >
                {/* Hotspot circle for better click targeting */}
                <circle r="24" fill="transparent" />

                {/* Pin hover/selection highlight ring */}
                {isSelected && (
                  <motion.circle
                    r="22"
                    fill="none"
                    stroke="#00D9FF"
                    strokeWidth="2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.1, opacity: 1 }}
                    className="shadow-glow"
                  />
                )}

                {/* Neon Pin Body */}
                <foreignObject
                  x="-26"
                  y="-34"
                  width="52"
                  height="34"
                  requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                >
                  <div 
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-center border shadow-lg transition-all flex items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 scale-110 shadow-cyan-500/20'
                        : spot.availability === 0
                        ? 'bg-slate-900/95 border-rose-500/50 text-rose-400'
                        : 'bg-slate-900/90 border-slate-300 dark:border-white/10 hover:border-cyan-500/50 text-slate-950 dark:text-white font-medium'
                    }`}
                  >
                    {spot.hasEVCharging && <Zap className="w-2.5 h-2.5 text-current shrink-0" />}
                    <span>{formatCurrency(spot.pricing)}</span>
                  </div>
                  {/* Pin tail */}
                  <div className="w-full flex justify-center">
                    <div className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] ${
                      isSelected ? 'border-t-cyan-500' : spot.availability === 0 ? 'border-t-rose-500/50' : 'border-t-slate-900/90'
                    }`} />
                  </div>
                </foreignObject>
              </g>
            );
          })}

        </g>
      </svg>

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-slate-300 dark:border-white/5 hover:border-cyan-500/30 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors backdrop-blur-md"
        >
          <ZoomIn className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-slate-300 dark:border-white/5 hover:border-cyan-500/30 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors backdrop-blur-md"
        >
          <ZoomOut className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-slate-300 dark:border-white/5 hover:border-cyan-500/30 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-center"
        >
          Reset
        </button>
      </div>

      {/* Floating GPS Indicator Overlay */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-300 dark:border-white/5 text-[10px] text-slate-600 dark:text-slate-400 font-bold backdrop-blur-md flex items-center gap-1.5 pointer-events-none">
        <Navigation className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
        <span>India GPS Engine Active</span>
      </div>
    </div>
  );
}
