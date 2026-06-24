"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewDialogProps {
  isOpen: boolean;
  bookingId: string;
  lotId: string;
  lotName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function ReviewDialog({
  isOpen,
  bookingId,
  lotId,
  lotName,
  onClose,
  onSubmit,
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(rating, comment);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setRating(5);
        setComment("");
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-3xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 p-8 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-2 hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>

            {!success ? (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white font-medium mb-1">
                    How was your experience?
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Share your feedback about {lotName}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <span className="text-sm text-rose-300">{error}</span>
                  </motion.div>
                )}

                {/* Rating Stars */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        aria-label={`Rate ${star} out of 5`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setRating(star)}
                        className={`rounded-lg p-2 transition-colors ${
                          rating >= star
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-slate-800 text-slate-600 hover:bg-slate-700"
                        }`}
                      >
                        <Star
                          className="h-8 w-8"
                          fill={rating >= star ? "currentColor" : "none"}
                        />
                      </motion.button>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {rating === 5 && "Excellent"}
                    {rating === 4 && "Great experience"}
                    {rating === 3 && "Good, but could be better"}
                    {rating === 2 && "Needs improvement"}
                    {rating === 1 && "Disappointed"}
                  </div>
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Share your feedback (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked or what could be improved..."
                    maxLength={500}
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-3 text-sm text-slate-200 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none resize-none"
                    rows={4}
                  />
                  <div className="mt-1 text-xs text-slate-900 dark:text-slate-500">
                    {comment.length}/500 characters
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl"
                  >
                    Skip
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-4 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
                >
                  <Star className="h-8 w-8 text-emerald-400 fill-emerald-400" />
                </motion.div>
                <h3 className="mb-2 text-xl font-bold text-slate-950 dark:text-white font-medium">
                  Thank You!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your review helps other users find great parking spots
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
