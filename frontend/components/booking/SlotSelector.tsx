"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Zap, Lock, Gauge } from "lucide-react";

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  type: "compact" | "standard" | "premium";
  status: "available" | "occupied" | "reserved";
  hasEVCharging: boolean;
  isCovered: boolean;
  floor: number;
  zone: string;
}

interface SlotSelectorProps {
  slots: ParkingSlot[];
  selectedSlot: ParkingSlot | null;
  onSelectSlot: (slot: ParkingSlot) => void;
  isLoading?: boolean;
}

export function SlotSelector({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}: SlotSelectorProps) {
  // Group slots by type and count availability
  const slotStats = useMemo(() => {
    const stats = {
      compact: { total: 0, available: 0 },
      standard: { total: 0, available: 0 },
      premium: { total: 0, available: 0 },
    };

    slots.forEach((slot) => {
      const t = slot.type as string;
      if (!stats[t as keyof typeof stats]) return; // skip unknown types
      stats[t as keyof typeof stats].total++;
      if (slot.status === "available") {
        stats[t as keyof typeof stats].available++;
      }
    });

    return stats;
  }, [slots]);

  // Group slots by floor for organized display
  const slotsByFloor = useMemo(() => {
    const grouped: Record<number, ParkingSlot[]> = {};
    slots.forEach((slot) => {
      const floor = slot.floor ?? 1; // fallback to floor 1 if undefined
      if (!grouped[floor]) {
        grouped[floor] = [];
      }
      grouped[floor].push(slot);
    });
    return grouped;
  }, [slots]);

  const getSlotColor = (slot: ParkingSlot) => {
    if (slot.status === "occupied") return "bg-slate-600 cursor-not-allowed";
    if (slot.status === "reserved") return "bg-amber-600 cursor-not-allowed";
    if (selectedSlot?.id === slot.id)
      return "bg-cyan-500 border-cyan-400 ring-2 ring-cyan-400";
    return "bg-emerald-600 hover:bg-emerald-500 cursor-pointer";
  };

  const getSlotTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      compact: "Compact",
      standard: "Standard",
      premium: "Premium",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading available slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Availability Summary */}
      <div className="grid grid-cols-3 gap-4">
        {(["compact", "standard", "premium"] as const).map((type) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold text-sm capitalize text-slate-200">
                {getSlotTypeLabel(type)}
              </div>
              {type === "premium" && <Zap className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {slotStats[type].available}
            </div>
            <div className="text-xs text-slate-900 dark:text-slate-500">
              of {slotStats[type].total} available
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floor-based Slot Grid */}
      <div className="space-y-6">
        {Object.entries(slotsByFloor)
          .sort(([floorA], [floorB]) => parseInt(floorA) - parseInt(floorB))
          .map(([floor, floorSlots]) => (
            <div key={floor} className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <MapPin className="w-4 h-4 text-slate-900 dark:text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Floor {floor} ({floorSlots.length} slots)
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {floorSlots.map((slot) => (
                  <motion.button
                    key={slot.id}
                    whileHover={
                      slot.status === "available" ? { scale: 1.05 } : {}
                    }
                    whileTap={
                      slot.status === "available" ? { scale: 0.95 } : {}
                    }
                    onClick={() => {
                      if (slot.status === "available") {
                        onSelectSlot(slot);
                      }
                    }}
                    disabled={slot.status !== "available"}
                    className={`relative h-12 rounded-lg font-bold text-sm transition-all border border-slate-300 dark:border-white/10 ${getSlotColor(
                      slot,
                    )}`}
                  >
                    {slot.slotNumber}

                    {/* Status Badge */}
                    {slot.status !== "available" && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <Lock className="w-3 h-3 text-slate-950 dark:text-white font-medium" />
                      </div>
                    )}

                    {/* Features Indicator */}
                    {slot.status === "available" && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {slot.hasEVCharging && (
                          <Zap className="w-3 h-3 text-amber-400" />
                        )}
                        {slot.isCovered && (
                          <Gauge className="w-3 h-3 text-blue-400" />
                        )}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Slot Details Panel */}
      {selectedSlot && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Selected Slot</div>
              <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                {selectedSlot.slotNumber}
              </div>
              <div className="text-xs text-slate-900 dark:text-slate-500 mt-2">
                Floor {selectedSlot.floor} • Zone {selectedSlot.zone} •{" "}
                <span className="capitalize">{selectedSlot.type}</span>
              </div>
              {(selectedSlot.hasEVCharging || selectedSlot.isCovered) && (
                <div className="flex gap-2 mt-2">
                  {selectedSlot.hasEVCharging && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-semibold">
                      <Zap className="w-3 h-3" /> EV Charging
                    </span>
                  )}
                  {selectedSlot.isCovered && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-semibold">
                      <Gauge className="w-3 h-3" /> Covered
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="pt-4 border-t border-slate-300 dark:border-white/5 space-y-2">
        <div className="text-xs font-semibold text-slate-900 dark:text-slate-500 uppercase tracking-wider">
          Legend
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-600" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-600" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}
