"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Car,
  MapPin,
  Loader2,
  Sparkles,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store/searchStore";
import { getSlots, createBooking, createPayment } from "@/services/booking";
import { getCurrentUser } from "@/services/auth";
import { formatCurrency } from "@/lib/utils";
import { SlotSelector, ParkingSlot } from "@/components/booking/SlotSelector";
import { StripeModal } from "@/components/checkout/StripeModal";
import { RazorpayModal } from "@/components/checkout/RazorpayModal";

export default function BookingFlow({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { results, filters } = useSearchStore();

  const [step, setStep] = useState(1);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);

  // Start/End datetime state, defaulted from global search filters after mount
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(2);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setStartTime(filters.startTime);
    setEndTime(filters.endTime);
  }, [filters]);

  // Checkout states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "razorpay">(
    "stripe",
  );
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [bookingResult, setBookingResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Retrieve lot details dynamically or fallback to Kochi MG Road details
  const spot = results.find((r) => r.id === id) || {
    id,
    name: "MG Road Secure Parking",
    location: "MG Road, Kochi, Kerala 682016",
    pricing: 50.0,
  };

  // Load slots for this lot on mount
  useEffect(() => {
    async function loadSlots() {
      try {
        setLoadingSlots(true);
        const data = await getSlots(id);
        const mappedSlots = (data || []).map((slot: any) => {
          // Backend now sends enriched slot data; apply fallbacks for safety
          const zone = slot.zone || (slot.name ? slot.name.charAt(0).toUpperCase() : 'A');
          const num = parseInt(slot.name?.slice(1), 10) || 1;
          const zoneIndex = zone.charCodeAt(0) - 64;

          let type: 'compact' | 'standard' | 'premium' = slot.type;
          if (!type || !['compact', 'standard', 'premium'].includes(type)) {
            if (zoneIndex <= 2) type = 'compact';
            else if (zoneIndex <= 4) type = 'standard';
            else type = 'premium';
          }

          const rawStatus = (slot.status || '').toLowerCase();
          const status = ['available', 'occupied', 'reserved'].includes(rawStatus)
            ? rawStatus as 'available' | 'occupied' | 'reserved'
            : rawStatus === 'booked' ? 'occupied'
            : rawStatus === 'maintenance' ? 'reserved'
            : 'available';

          return {
            id: slot.id,
            slotNumber: slot.slotNumber || slot.name || 'A1',
            name: slot.name || slot.slotNumber || 'A1',
            type,
            status,
            hasEVCharging: slot.hasEVCharging ?? (num % 5 === 0),
            isCovered: slot.isCovered ?? (zone !== 'A'),
            floor: slot.floor ?? Math.max(1, Math.ceil(zoneIndex / 3)),
            zone,
          };
        });
        setSlots(mappedSlots);
      } catch (err) {
        console.error("Failed to load slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [id]);

  // Recalculate duration and price total whenever start/end times change
  useEffect(() => {
    if (!startTime || !endTime) return;
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start < end) {
      const diffMs = end.getTime() - start.getTime();
      const diffHrs = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
      setDuration(diffHrs);
    }
  }, [startTime, endTime]);

  const pricePerHour = spot.pricing;
  const total = duration * pricePerHour;

  const handleCreateBooking = async () => {
    if (!selectedSlot) {
      setErrorMsg("Please select a parking slot first.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      // Check login
      const user = getCurrentUser();
      if (!user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('redirect_after_login', window.location.pathname);
        }
        router.push("/login");
        return;
      }

      // 1. Create booking reservation on backend
      const booking = await createBooking(
        selectedSlot.id,
        startTime,
        endTime,
        total,
      );
      setBookingResult(booking);

      // Advance to payment step
      setStep(3);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Failed to reserve slot. It may have been booked in the meantime.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiatePayment = () => {
    if (paymentMethod === "stripe") {
      setShowStripeModal(true);
    } else {
      setShowRazorpayModal(true);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!bookingResult) return;
    setIsProcessing(true);
    setErrorMsg("");

    try {
      // 2. Process checkout payment
      await createPayment(
        bookingResult.id,
        total,
        `tx-${Date.now()}`,
        paymentMethod === "stripe" ? "STRIPE" : "RAZORPAY",
      );

      // Advance to success page
      setShowStripeModal(false);
      setShowRazorpayModal(false);
      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || "Payment capture failed. Please try again.");
      setShowStripeModal(false);
      setShowRazorpayModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!selectedSlot) {
        setErrorMsg("Please select a slot before proceeding.");
        return;
      }
      setErrorMsg("");
      setStep(2);
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const steps = [
    { num: 1, title: "Choose Slot" },
    { num: 2, title: "Time Slot" },
    { num: 3, title: "Checkout" },
    { num: 4, title: "Confirmed" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col items-center py-12 px-4 selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Nav */}
      <div className="w-full max-w-xl flex items-center justify-between mb-8 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (step > 1 && step < 4 ? prevStep() : router.back())}
          className="hover:bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-bold tracking-tight text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          ParkFlow AI Booking Wizard
        </span>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Progress Stepper Bar */}
      <div className="w-full max-w-xl mb-10 relative z-10 px-4">
        <div className="flex justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-[2px] bg-slate-800 -z-10" />
          <motion.div
            className="absolute top-4 left-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 -z-10 shadow-[0_0_10px_rgba(0,217,255,0.4)]"
            initial={{ width: "0%" }}
            animate={{ width: `${((step - 1) / 3) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <button
                disabled={s.num > step && step !== 4}
                onClick={() => setStep(s.num)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step >= s.num
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,217,255,0.4)] font-black"
                    : "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-500 border border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {step > s.num ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  s.num
                )}
              </button>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider ${
                  step >= s.num ? "text-cyan-600 dark:text-cyan-400" : "text-slate-900 dark:text-slate-500"
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form Card */}
      <div className="w-full max-w-xl relative bg-white shadow-sm dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl min-h-[460px] flex flex-col z-10">
        <AnimatePresence mode="wait" initial={false}>
          {/* STEP 1: INTERACTIVE PARKING GRID */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 flex-1 flex flex-col"
            >
              <div className="mb-4">
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                  Step 1 of 4
                </span>
                <h2 className="text-2xl font-black flex items-center gap-2 text-slate-950 dark:text-white font-medium">
                  Select Parking Slot
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {spot.name} • {spot.location}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Slot Selection Component */}
              <div className="flex-1 overflow-y-auto">
                <SlotSelector
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={(slot) => {
                    setSelectedSlot(slot);
                    setErrorMsg("");
                  }}
                  isLoading={loadingSlots}
                />
              </div>

              <div className="mt-auto">
                <Button
                  disabled={!selectedSlot}
                  onClick={nextStep}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-900 dark:text-slate-500 text-slate-950 py-6 text-base font-bold rounded-xl"
                >
                  Continue to Duration <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SELECT RESERVATION WINDOW */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 flex-1 flex flex-col"
            >
              <div className="mb-6">
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                  Step 2 of 4
                </span>
                <h2 className="text-2xl font-black flex items-center gap-2 text-slate-950 dark:text-white font-medium">
                  Reservation Window
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Review your date & duration details below
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Date Pickers */}
              <div className="space-y-4 mb-6">
                <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5 border border-slate-300 dark:border-white/5 space-y-4">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                      Reservation Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                      Reservation End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                {/* Duration Summary */}
                <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-950 rounded-2xl p-5 border border-slate-300 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 block font-semibold">
                        Total Duration
                      </span>
                      <span className="text-sm font-bold text-slate-950 dark:text-white font-medium">
                        {duration} hour{duration > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-600 dark:text-slate-400 block font-semibold">
                      Price Estimate
                    </span>
                    <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <Button
                  onClick={handleCreateBooking}
                  disabled={isProcessing}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-6 text-base font-bold rounded-xl flex gap-1 justify-center"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Reserve Slot {selectedSlot?.name}{" "}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: MOCK CHECKOUT PAYMENT */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 flex-1 flex flex-col"
            >
              <div className="mb-6">
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                  Step 3 of 4
                </span>
                <h2 className="text-2xl font-black flex items-center gap-2 text-slate-950 dark:text-white font-medium">
                  <CreditCard className="text-cyan-600 dark:text-cyan-400" /> Secure Checkout
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Payment processed securely via Stripe or Razorpay
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Payment Gateway Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-300 dark:border-white/5 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    paymentMethod === "stripe"
                      ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-medium border border-slate-300 dark:border-white/10"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium"
                  }`}
                >
                  Stripe Checkout
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    paymentMethod === "razorpay"
                      ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-medium border border-slate-300 dark:border-white/10"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium"
                  }`}
                >
                  Razorpay (India)
                </button>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5 border border-slate-300 dark:border-white/5 space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Slot Details
                  </span>
                  <span className="text-xs font-bold text-slate-950 dark:text-white font-medium uppercase">
                    {selectedSlot?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Rate
                  </span>
                  <span className="text-xs font-bold text-slate-950 dark:text-white font-medium">
                    {formatCurrency(pricePerHour)}/hr
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Duration
                  </span>
                  <span className="text-xs font-bold text-slate-950 dark:text-white font-medium">
                    {duration} hour{duration > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-[1px] w-full bg-white/10" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-black">
                    Total Due
                  </span>
                  <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <Button
                  onClick={handleInitiatePayment}
                  disabled={isProcessing}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-6 text-base font-bold rounded-xl flex gap-1.5 justify-center"
                >
                  Pay & Confirm {formatCurrency(total)}
                </Button>
              </div>
            </motion.div>
          )}



          {/* STEP 4: BOOKING CONFIRMED */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <h2 className="text-2xl font-black text-slate-950 dark:text-white font-medium mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 max-w-xs mx-auto">
                Your parking slot{" "}
                <span className="text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                  {selectedSlot?.name}
                </span>{" "}
                is reserved successfully for {duration} hours.
              </p>

              <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5 border border-slate-300 dark:border-white/5 w-full space-y-3 mb-8 text-left text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wide">
                    Reservation ID
                  </span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    {bookingResult?.id?.substring(0, 8) || "xxxxxx"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wide">
                    Spot Name
                  </span>
                  <span className="font-bold">{spot.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wide">
                    Rate Paid
                  </span>
                  <span className="font-bold">
                    {formatCurrency(total)} ({duration} hrs)
                  </span>
                </div>
              </div>

              <Button
                onClick={() =>
                  router.push(
                    `/ticket/${bookingResult?.id || "mock-booking-active"}`,
                  )
                }
                className="w-full bg-white hover:bg-slate-200 text-slate-950 py-6 text-base font-bold rounded-xl"
              >
                View QR Code Ticket
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StripeModal 
        isOpen={showStripeModal} 
        onClose={() => setShowStripeModal(false)} 
        onSuccess={handlePaymentSuccess} 
        amount={total} 
      />

      <RazorpayModal 
        isOpen={showRazorpayModal} 
        onClose={() => setShowRazorpayModal(false)} 
        onSuccess={handlePaymentSuccess} 
        amount={total} 
      />
    </div>
  );
}
