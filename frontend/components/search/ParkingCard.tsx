import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Star,
  Zap,
  Shield,
  HelpCircle,
  ArrowRight,
  Trophy,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearchStore, ParkingLot } from "@/store/searchStore";
import { formatCurrency, formatDistance } from "@/lib/utils";

interface ParkingCardProps {
  spot: ParkingLot;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  isRecommended?: boolean;
}

export function ParkingCard({
  spot,
  isHovered,
  onHover,
  isRecommended = false,
}: ParkingCardProps) {
  const router = useRouter();
  const { selectedSpot, setSelectedSpot, favorites, toggleFavorite } = useSearchStore();
  const isSelected = selectedSpot?.id === spot.id;
  const isFav = favorites.includes(spot.id);

  const handleSelect = () => {
    setSelectedSpot(spot);
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/booking/${spot.id}`);
  };

  const isLowAvailability = spot.availability < 5;
  const isSoldOut = spot.availability === 0;

  return (
    <motion.div
      layoutId={`card-${spot.id}`}
      onMouseEnter={() => onHover(spot.id)}
      onMouseLeave={() => onHover(null)}
      onClick={handleSelect}
      className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col gap-3 group ${
        isRecommended
          ? "bg-white dark:bg-slate-900 border-amber-500 shadow-[0_0_20px_rgba(251,146,60,0.2)]"
          : isSelected
            ? "bg-white dark:bg-slate-900 border-cyan-500 shadow-[0_0_20px_rgba(0,217,255,0.15)]"
            : isHovered
              ? "bg-white shadow-sm dark:bg-slate-900/80 border-white/20 shadow-lg"
              : "bg-white shadow-sm dark:bg-slate-950/40 border-slate-300 dark:border-white/5 hover:border-slate-300 dark:border-white/10"
      }`}
    >
      {/* Recommended badge glow line */}
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500" />
      )}

      {/* Premium Glow line on selected card */}
      {isSelected && !isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
      )}

      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 backdrop-blur-sm">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Best Match
          </span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Spot Image */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10">
          <Image
            src={
              spot.image ||
              "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=600&auto=format&fit=crop"
            }
            alt={spot.name}
            fill
            sizes="(max-width: 768px) 100vw, 96px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Favorite Button Overlay */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite(spot.id); }}
            className={`absolute top-1 left-1 p-1 rounded-full backdrop-blur-md transition-all ${isFav ? 'bg-rose-500/20 text-rose-500' : 'bg-white shadow-sm dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-400 hover:bg-white dark:bg-slate-900'}`}
          >
            <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
          </button>
          {/* Price Tag Overlay for mobile/fast view */}
          <div className="absolute bottom-1 right-1 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
            {formatCurrency(spot.pricing)}/hr
          </div>
        </div>

        {/* Spot details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1">
              <h4 className="font-bold text-sm text-slate-100 truncate group-hover:text-cyan-600 dark:text-cyan-400 transition-colors">
                {spot.name}
              </h4>
              <div className="flex items-center gap-1 shrink-0 text-amber-400 text-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold text-slate-200">
                  {spot.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
              {spot.location}
            </p>
          </div>

          {/* Quick Info & Tags */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
              <MapPin className="w-3 h-3 text-slate-900 dark:text-slate-500" />
              {spot.distance !== undefined
                ? formatDistance(spot.distance)
                : "India"}
            </span>

            {/* Live slot counter */}
            <span
              className={`flex items-center gap-1.5 text-[11px] font-medium ${
                isSoldOut
                  ? "text-rose-500"
                  : isLowAvailability
                    ? "text-amber-400"
                    : "text-emerald-400"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {!isSoldOut && (
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isLowAvailability ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                  />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isSoldOut
                      ? "bg-rose-500"
                      : isLowAvailability
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                />
              </span>
              {isSoldOut ? "Sold Out" : `${spot.availability} slots left`}
            </span>
          </div>

          {/* Amenities icons */}
          <div className="flex gap-2 pt-1">
            {spot.hasEVCharging && (
              <span title="EV Charging Station">
                <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </span>
            )}
            {spot.hasSecurity && (
              <span title="Security Active">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            )}
            {spot.isCovered && (
              <div className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider px-1 bg-purple-500/10 border border-purple-500/20 rounded">
                Covered
              </div>
            )}
            {spot.isAccessible && (
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider px-1 bg-blue-500/10 border border-blue-500/20 rounded">
                ADA
              </span>
            )}
          </div>

          {/* Slot Type Breakdown */}
          {(isHovered || isSelected) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2 border-t border-slate-300 dark:border-white/5 space-y-1.5"
            >
              <div className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold">
                Slot Types Available
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/50 border border-slate-300 dark:border-white/5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-[10px] text-slate-700 dark:text-slate-300">Compact</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/50 border border-slate-300 dark:border-white/5">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-[10px] text-slate-700 dark:text-slate-300">Standard</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/50 border border-slate-300 dark:border-white/5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] text-slate-700 dark:text-slate-300">Premium</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Booking Drawer Expansion */}
      <AnimatePresence>
        {(isHovered || isSelected) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-2 border-t border-slate-300 dark:border-white/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-900 dark:text-slate-500 block uppercase tracking-wider">
                  Hourly Price
                </span>
                <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">
                  {formatCurrency(spot.pricing)}
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-normal">
                    /hr
                  </span>
                </span>
              </div>
              <Button
                disabled={isSoldOut}
                onClick={handleBook}
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-4 flex items-center gap-1 shadow-lg shadow-cyan-500/10 border-0 disabled:bg-slate-800 disabled:text-slate-900 dark:text-slate-500"
              >
                {isSoldOut ? "Sold Out" : "Reserve Spot"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
