"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Calendar } from "lucide-react";

export interface Review {
  id: string;
  userId: string;
  bookingId?: string;
  lotId: string;
  rating: number;
  comment: string;
  createdAt: Date | string;
  user?: {
    name: string;
    email?: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  isLoading?: boolean;
  compact?: boolean;
}

export function ReviewsList({
  reviews,
  isLoading = false,
  compact = false,
}: ReviewsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-slate-900/50 p-6 text-center">
        <MessageSquare className="mx-auto h-8 w-8 text-slate-600 mb-2" />
        <p className="text-sm text-slate-400">
          No reviews yet. Be the first to share your experience!
        </p>
      </div>
    );
  }

  const displayReviews = compact ? reviews.slice(0, 3) : reviews;
  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      {!compact && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">
                  {avgRating}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(parseFloat(avgRating))
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Based on {reviews.length} reviews
              </p>
            </div>
            <div className="text-right">
              <div className="space-y-1 text-xs">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(
                    (r) => r.rating === rating,
                  ).length;
                  const percentage =
                    reviews.length > 0
                      ? Math.round((count / reviews.length) * 100)
                      : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-slate-500">{rating}★</span>
                      <div className="w-20 h-1.5 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-slate-500 w-8">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Individual Reviews */}
      <div className="space-y-3">
        {displayReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-white/5 bg-slate-950/40 p-4 hover:border-white/10 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-slate-200">
                  {review.user?.name || "Anonymous"}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {review.rating}.0
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                {new Date(review.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-sm text-slate-300 leading-relaxed">
                {review.comment}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Show More */}
      {compact && reviews.length > 3 && (
        <motion.button
          whileHover={{ y: -2 }}
          className="w-full py-2 rounded-lg border border-white/10 text-sm font-semibold text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors"
        >
          View all {reviews.length} reviews
        </motion.button>
      )}
    </div>
  );
}
