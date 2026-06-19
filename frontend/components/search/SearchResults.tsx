import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  List,
  Map,
  SlidersHorizontal,
  Search,
  RefreshCw,
  Compass,
  Trophy,
} from "lucide-react";
import { useSearchStore } from "@/store/searchStore";
import { ParkingCard } from "./ParkingCard";
import { ParkingMap } from "./ParkingMap";
import { SearchFilters } from "./SearchFilters";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { getRecommendedSpot } from "@/lib/utils";

export function SearchResults() {
  const { results, loading, error, fetchResults, filters } = useSearchStore();
  const [hoveredLotId, setHoveredLotId] = useState<string | null>(null);

  // UI States
  const [mobileMode, setMobileMode] = useState<"map" | "list">("map");
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);

  // Get recommended and sorted results
  const recommendedResults = useMemo(() => {
    if (results.length === 0) return [];
    return getRecommendedSpot(results, filters);
  }, [results, filters]);

  useEffect(() => {
    // Initial fetch on mount
    fetchResults();
  }, []);

  return (
    <div className="flex-1 w-full h-[calc(100vh-180px)] flex flex-col relative overflow-hidden">
      {/* Search Header Info (Counts & Mobile Filters toggle) */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0 bg-slate-950/40">
        <span className="text-xs font-semibold text-slate-400">
          {loading
            ? "Searching parking spaces..."
            : `${results.length} spot${results.length !== 1 ? "s" : ""} available near Kozhikode, Kerala`}
        </span>

        {/* Desktop Filters Toggle */}
        <button
          onClick={() => setShowDesktopFilters(!showDesktopFilters)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 font-semibold hover:border-cyan-500/30 transition-all duration-300"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showDesktopFilters ? "Hide Filters" : "Show Filters"}</span>
        </button>

        {/* Mobile View Toggle and Mobile Filters button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>

          <button
            onClick={() => setMobileMode(mobileMode === "map" ? "list" : "map")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20"
          >
            {mobileMode === "map" ? (
              <>
                <List className="w-3.5 h-3.5" /> List View
              </>
            ) : (
              <>
                <Map className="w-3.5 h-3.5" /> Map View
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* Desktop Left / Mobile List View (35%) */}
        <div
          className={`h-full md:w-[35%] border-r border-white/10 flex flex-col bg-slate-950/40 relative z-10 shrink-0 ${
            mobileMode === "list" ? "w-full flex" : "hidden md:flex"
          }`}
        >
          {/* Scrollable Filters + List Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* Inline Desktop Filters */}
            <AnimatePresence>
              {showDesktopFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="hidden md:block overflow-hidden"
                >
                  <SearchFilters />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm flex flex-col gap-2">
                <span>Error: {error}</span>
                <button
                  onClick={fetchResults}
                  className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Try Again
                </button>
              </div>
            )}

            {!error && loading && <LoadingState />}

            {!error && !loading && results.length === 0 && <EmptyState />}

            {!error && !loading && recommendedResults.length > 0 && (
              <div className="space-y-3">
                {/* Best Match Banner */}
                {recommendedResults[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-400">
                        Best Match
                      </div>
                      <div className="text-[11px] text-amber-300/80">
                        Based on your preferences
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Recommended spot highlighted */}
                <ParkingCard
                  key={recommendedResults[0].id}
                  spot={recommendedResults[0]}
                  isHovered={hoveredLotId === recommendedResults[0].id}
                  onHover={setHoveredLotId}
                  isRecommended={recommendedResults[0].isRecommended}
                />

                {/* Rest of the spots */}
                {recommendedResults.slice(1).map((spot) => (
                  <ParkingCard
                    key={spot.id}
                    spot={spot}
                    isHovered={hoveredLotId === spot.id}
                    onHover={setHoveredLotId}
                    isRecommended={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Right / Mobile Map View (65%) */}
        <div
          className={`h-full flex-1 relative bg-slate-900 overflow-hidden ${
            mobileMode === "map" ? "block" : "hidden md:block"
          }`}
        >
          <ParkingMap />

          {/* Draggable/Togglable Mobile Bottom Sheet (Mobile Map mode only) */}
          <div className="md:hidden block">
            <AnimatePresence>
              {mobileMode === "map" && recommendedResults.length > 0 && (
                <motion.div
                  initial={{ y: "85%" }}
                  animate={{ y: isBottomSheetExpanded ? "20%" : "75%" }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed inset-x-0 bottom-0 z-30 bg-slate-950/95 border-t border-white/10 rounded-t-3xl shadow-[0_-12px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col h-[80vh] overflow-hidden"
                >
                  {/* Drag Handle Bar */}
                  <div
                    onClick={() =>
                      setIsBottomSheetExpanded(!isBottomSheetExpanded)
                    }
                    className="w-full flex justify-center py-4 cursor-pointer"
                  >
                    <div className="w-12 h-1.5 rounded-full bg-slate-800 hover:bg-slate-700" />
                  </div>

                  {/* Summary count */}
                  <div className="px-5 pb-2 text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {isBottomSheetExpanded
                      ? "All Spots List"
                      : "Swipe Up to View Spot Details"}
                  </div>

                  {/* Scrollable list content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar pb-24">
                    {recommendedResults.map((spot) => (
                      <ParkingCard
                        key={spot.id}
                        spot={spot}
                        isHovered={hoveredLotId === spot.id}
                        onHover={setHoveredLotId}
                        isRecommended={spot.isRecommended}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-6 flex flex-col justify-center"
          >
            <div className="w-full max-w-md mx-auto relative">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase"
              >
                Close
              </button>
              <div className="mt-8">
                <SearchFilters />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
