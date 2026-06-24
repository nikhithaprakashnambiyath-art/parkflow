'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, QrCode, AlertTriangle, ShieldCheck,
  MapPin, Calendar, Clock, Sparkles, Car, Star, MessageSquare,
  ThumbsUp, Send, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getBookingDetails, simulateScan, submitReview, hasReviewed } from '@/services/booking';
import { formatCurrency } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

// ─── Review Modal ────────────────────────────────────────────────────────────
const QUICK_TAGS = [
  'Easy Access', 'Clean & Safe', 'Great Value', 'Smooth QR Scan',
  'Well Lit', 'Good Security', 'Spacious Slots', 'Fast Service',
];

function ReviewModal({
  bookingId,
  lotId,
  lotName,
  onClose,
  onSuccess,
}: {
  bookingId: string;
  lotId: string;
  lotName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const fullComment = [
        ...(selectedTags.length > 0 ? [selectedTags.join(', ')] : []),
        comment.trim(),
      ]
        .filter(Boolean)
        .join(' • ');

      await submitReview(bookingId, lotId, rating, fullComment);
      setDone(true);
      setTimeout(onSuccess, 1800);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];
  const displayRating = hoverRating || rating;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white font-medium">Rate Your Visit</h2>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{lotName}</p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 transition-all duration-150 ${
                          star <= displayRating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                            : 'text-slate-700'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {displayRating > 0 && (
                    <motion.span
                      key={displayRating}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="text-sm font-bold text-amber-400"
                    >
                      {ratingLabels[displayRating]}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Tags */}
              <div className="mb-5">
                <span className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">
                  What stood out? (optional)
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-600 dark:text-cyan-400'
                          : 'bg-white/3 border-white/8 text-slate-600 dark:text-slate-400 hover:border-white/20 hover:text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {selectedTags.includes(tag) && <span className="mr-1">✓</span>}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                  Additional comments (optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 py-5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </Button>

              <p className="text-center text-[10px] text-slate-600 mt-3">
                Your feedback helps improve the parking experience for everyone.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 flex flex-col items-center text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-5"
              >
                <ThumbsUp className="w-9 h-9 text-emerald-400" />
              </motion.div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white font-medium mb-2">Thanks for the feedback!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px]">
                Your review helps other drivers find the best spots.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Ticket Page ─────────────────────────────────────────────────────────
export default function QrTicket({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // ── ALL hooks must be declared before any conditional returns ──
  const [isMounted, setIsMounted] = useState(false);
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Simulator states
  const [simulating, setSimulating] = useState(false);
  const [gateStatus, setGateStatus] = useState<'closed' | 'open-entry' | 'open-exit'>('closed');
  const [simLog, setSimLog] = useState<string[]>([]);

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await getBookingDetails(id);
      setBooking(data);

      // Check if user already reviewed this booking
      const reviewed = await hasReviewed(id);
      setAlreadyReviewed(reviewed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const handleSimulateScan = async (action: 'ENTRY' | 'EXIT') => {
    setSimulating(true);
    setErrorMsg('');
    try {
      const res = await simulateScan(id, action);

      setGateStatus(action === 'ENTRY' ? 'open-entry' : 'open-exit');
      setSimLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ${res.message}`,
        ...prev,
      ]);

      await loadDetails();

      // After exit, prompt for review (with a short delay for UX)
      if (action === 'EXIT') {
        setTimeout(() => {
          setShowReviewModal(true);
        }, 1800);
      }

      setTimeout(() => {
        setGateStatus('closed');
      }, 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gate check-in failed.');
      setSimLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Error: ${err.message}`,
        ...prev,
      ]);
    } finally {
      setSimulating(false);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Fallback booking object
  const activeBooking = booking || {
    id,
    status: 'PENDING',
    startTime: new Date(),
    endTime: new Date(Date.now() + 7200000),
    amount: 100,
    slot: {
      name: 'A2',
      lot: {
        id: 'mock-uuid-1',
        name: 'Lulu Mall Smart Lot',
        location: 'Edappally, Kochi, Kerala',
        coordinates: JSON.stringify({ lat: 9.9722, lng: 76.3161 }),
      },
    },
  };

  const lotId = activeBooking?.slot?.lot?.id || 'mock-uuid-1';
  const lotName = activeBooking?.slot?.lot?.name || 'Parking Lot';

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    CANCELLED: 'bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/5',
  };

  return (
    <>
      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && !alreadyReviewed && (
          <ReviewModal
            bookingId={id}
            lotId={lotId}
            lotName={lotName}
            onClose={() => setShowReviewModal(false)}
            onSuccess={() => {
              setShowReviewModal(false);
              setAlreadyReviewed(true);
              setReviewDone(true);
            }}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex items-center justify-center py-12 px-6 relative selection:bg-cyan-500/30 overflow-hidden">
        {/* Animated Ambient background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[128px] pointer-events-none" />

        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 relative z-10">

          {/* LEFT PANEL: THE QR TICKET */}
          <div className="flex flex-col items-center">

            {/* Back Button */}
            <div className="w-full mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium hover:bg-white/5 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
              </Button>
            </div>

            {/* Ticket Card */}
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">

              {/* Holographic Header Bar */}
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 px-6 py-4 flex items-center justify-between border-b border-slate-300 dark:border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">Boarding Pass</span>
                <div className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                  statusColors[activeBooking.status] || 'bg-white dark:bg-slate-900'
                }`}>
                  {activeBooking.status}
                </div>
              </div>

              <div className="p-6 flex flex-col items-center text-center">

                {/* QR Code */}
                <div className="bg-white p-4 rounded-2xl shadow-xl mb-6 relative group border-4 border-slate-950">
                  <div className="absolute inset-4 border-2 border-cyan-500/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(0,217,255,1)] animate-[bounce_2s_infinite_linear]" />
                  </div>

                  <QRCodeSVG
                    value={id}
                    size={176}
                    bgColor={"#FFFFFF"}
                    fgColor={"#020617"}
                    level={"H"}
                    includeMargin={false}
                  />
                </div>

                <div className="mb-2">
                  <span className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block">Reservation Identifier</span>
                  <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">{id}</span>
                </div>

                <h3 className="text-xl font-black text-slate-950 dark:text-white font-medium mt-4">{activeBooking.slot.lot.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> {activeBooking.slot.lot.location}
                </p>

                {/* Dotted separator */}
                <div className="w-full flex items-center my-6">
                  <div className="w-3 h-6 bg-slate-100 dark:bg-slate-950 rounded-r-full -ml-6 border-y border-r border-slate-300 dark:border-white/10 shrink-0" />
                  <div className="flex-1 border-t border-dashed border-white/20" />
                  <div className="w-3 h-6 bg-slate-100 dark:bg-slate-950 rounded-l-full -mr-6 border-y border-l border-slate-300 dark:border-white/10 shrink-0" />
                </div>

                {/* Ticket details */}
                <div className="w-full grid grid-cols-2 gap-4 text-left text-xs">
                  <div>
                    <span className="text-slate-900 dark:text-slate-500 font-semibold uppercase tracking-wider block mb-1">Assigned Slot</span>
                    <span className="text-sm font-bold text-slate-950 dark:text-white font-medium uppercase flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Slot {activeBooking.slot.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-slate-500 font-semibold uppercase tracking-wider block mb-1">Total Pricing</span>
                    <span className="text-sm font-bold text-slate-950 dark:text-white font-medium">{formatCurrency(activeBooking.amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-slate-500 font-semibold uppercase tracking-wider block mb-1">Starts At</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-900 dark:text-slate-500" /> {formatDate(activeBooking.startTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-slate-500 font-semibold uppercase tracking-wider block mb-1">Ends At</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-900 dark:text-slate-500" /> {formatDate(activeBooking.endTime)}
                    </span>
                  </div>
                </div>

                {/* Review CTA for completed bookings */}
                {activeBooking.status === 'COMPLETED' && (
                  <div className="w-full mt-6">
                    {reviewDone || alreadyReviewed ? (
                      <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Review Submitted — Thank you!
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Star className="w-4 h-4" />
                        Leave a Review for This Parking Lot
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: GATE SIMULATOR */}
          <div className="bg-white shadow-sm dark:bg-slate-900/60 border border-slate-300 dark:border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col relative overflow-hidden">

            {/* Simulation Header */}
            <div className="mb-6">
              <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider block mb-1">Gate Operations</span>
              <h2 className="text-2xl font-black flex items-center gap-2 text-slate-950 dark:text-white font-medium">
                Gate Simulator
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Simulate scanning this QR code at entry/exit points to verify live sensor responses.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Gate Animation */}
            <div className="border border-slate-300 dark:border-white/5 bg-slate-100 dark:bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] mb-6 relative overflow-hidden">
              {gateStatus !== 'closed' && (
                <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
              )}

              <AnimatePresence mode="wait">
                {gateStatus === 'closed' && (
                  <motion.div
                    key="closed"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-900 dark:text-slate-500">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Gate Status</span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-500 uppercase mt-0.5">CLOSED • WAITING FOR SCAN</h3>
                    </div>
                  </motion.div>
                )}

                {gateStatus === 'open-entry' && (
                  <motion.div
                    key="entry"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/30">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Access Granted</span>
                      <h3 className="text-lg font-black text-emerald-400 uppercase mt-0.5">ENTRY GATE OPENING</h3>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Sensor detected license plate matching slot {activeBooking.slot.name}</p>
                    </div>
                  </motion.div>
                )}

                {gateStatus === 'open-exit' && (
                  <motion.div
                    key="exit"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center text-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-500/30">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Access Granted</span>
                      <h3 className="text-lg font-black text-blue-400 uppercase mt-0.5">EXIT GATE OPENING</h3>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Check-out recorded. Slot {activeBooking.slot.name} released to available pool.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scan Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                onClick={() => handleSimulateScan('ENTRY')}
                disabled={simulating || activeBooking.status !== 'PENDING'}
                className="py-6 rounded-xl border border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed uppercase"
              >
                Simulate Entry Gate
              </Button>
              <Button
                onClick={() => handleSimulateScan('EXIT')}
                disabled={simulating || activeBooking.status !== 'ACTIVE'}
                className="py-6 rounded-xl border border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed uppercase"
              >
                Simulate Exit Gate
              </Button>
            </div>

            {/* Review nudge after exit */}
            {activeBooking.status === 'COMPLETED' && !alreadyReviewed && !reviewDone && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20"
              >
                <p className="text-xs text-amber-400 font-bold flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Parking session complete! Share your experience.
                </p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="text-[11px] text-amber-300/80 underline underline-offset-2 hover:text-amber-300"
                >
                  Write a review →
                </button>
              </motion.div>
            )}

            {/* Simulated Gate Log */}
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/5 rounded-2xl p-4 min-h-[140px] max-h-[200px] overflow-hidden">
              <span className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider mb-2 block">System Telemetry Log</span>
              <div className="flex-1 overflow-y-auto space-y-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-400">
                {simLog.length === 0 ? (
                  <div className="text-slate-600 italic py-4">No sensor events recorded. Select simulation triggers above to begin gate testing.</div>
                ) : (
                  simLog.map((log, index) => (
                    <div key={index} className="truncate border-b border-slate-300 dark:border-white/5 pb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
