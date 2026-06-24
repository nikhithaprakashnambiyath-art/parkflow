"use client";

import React, { useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence, useInView } from "framer-motion";

interface Inputs {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setIsSubmitting(true);
    // Simulate API delivery
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      reset();
    }, 1800);
  };

  return (
    <section
      ref={containerRef}
      id="contact"
      className="relative w-full py-24 md:py-32 px-6 overflow-hidden bg-[#050816] border-t border-slate-900 flex items-center"
    >
      {/* Decorative glows */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#6C63FF]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00E5FF]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center flex flex-col items-center"
        >
          <span className="font-mono text-xs text-[#00E5FF] tracking-[0.3em] uppercase">06. INQUIRIES</span>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white mt-2 uppercase tracking-tight">
            CONNECT WITH ME
          </h2>
          <div className="w-12 h-1 bg-[#8B5CF6] mt-4 rounded" />
        </motion.div>

        {/* Contact Form Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-panel p-8 md:p-12 rounded-2xl border border-white/5 relative overflow-hidden pointer-events-auto shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="contact-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      {...register("name", { required: "Name is required" })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all duration-300 pointer-events-auto"
                    />
                    {errors.name && (
                      <span className="text-xs text-red-500 font-mono mt-1 block">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all duration-300 pointer-events-auto"
                    />
                    {errors.email && (
                      <span className="text-xs text-red-500 font-mono mt-1 block">
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message field */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell me about your internship scope or project objectives..."
                    {...register("message", { required: "Message is required" })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all duration-300 resize-none pointer-events-auto"
                  />
                  {errors.message && (
                    <span className="text-xs text-red-500 font-mono mt-1 block">
                      {errors.message.message}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-4 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-10 py-3.5 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-sm font-semibold tracking-wider hover:scale-105 hover:shadow-neon-primary disabled:opacity-50 transition-all duration-300 pointer-events-auto"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Transmitting Signals...</span>
                      </div>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 flex flex-col items-center justify-center"
              >
                {/* Glowing Success Ring */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, delay: 0.2 }}
                  className="w-20 h-20 rounded-full border-2 border-[#00E5FF] flex items-center justify-center text-3xl text-[#00E5FF] shadow-neon-secondary mb-6"
                >
                  ✓
                </motion.div>

                <h3 className="font-heading text-3xl font-bold text-white mb-2 uppercase">
                  MESSAGE TRANSMITTED
                </h3>
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-light mb-8">
                  Signals successfully sent into Nikhitha's digital orbit. I will review and respond back as soon as possible.
                </p>

                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-2.5 rounded-full border border-slate-700 hover:border-[#00E5FF] hover:bg-slate-900/40 text-xs font-mono text-slate-400 hover:text-white transition-all duration-300 pointer-events-auto"
                >
                  Send Another Signal
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
