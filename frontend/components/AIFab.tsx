"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, ParkingCircle } from "lucide-react";
import { toast } from "sonner";

export default function AIFab() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([
    { role: "ai", content: "Hi! I'm ParkFlow AI. Looking for parking or need help with a reservation?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");
    setHistory((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    // Mock AI response for Phase 3 integration
    setTimeout(() => {
      setIsTyping(false);
      let reply = "I can help with that! However, my core prediction engine is still spinning up.";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes("near")) {
        reply = "I found 3 parking locations near your destination. 'Lulu Mall Smart Lot' has 15 spots available right now. Shall I book one?";
        toast.success("AI found available slots!");
      } else if (lower.includes("cancel")) {
        reply = "To cancel your booking, head over to your Dashboard and click the 'Cancel' button on your active reservation.";
      } else if (lower.includes("price") || lower.includes("cost") || lower.includes("cheapest")) {
        reply = "The cheapest parking nearby is 'Marine Drive Seafront' at ₹50/hour.";
        toast.info("Pricing insights retrieved.");
      }

      setHistory((prev) => [...prev, { role: "ai", content: reply }]);
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-slate-900/90 backdrop-blur-xl border border-slate-300 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50 flex flex-col"
            style={{ height: "500px", maxHeight: "80vh" }}
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-b border-slate-300 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white font-medium">ParkFlow AI</h3>
                  <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">Smart Assistant • Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col">
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user" 
                        ? "bg-cyan-500 text-slate-950 font-medium" 
                        : "bg-slate-800 text-slate-200 border border-slate-300 dark:border-white/5"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-slate-800 border border-slate-300 dark:border-white/5 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 bg-slate-950/50 border-t border-slate-300 dark:border-white/10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-slate-950 dark:text-white font-medium placeholder:text-slate-900 dark:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!message.trim() || isTyping}
                  className="absolute right-2 w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-[0_0_30px_rgba(0,217,255,0.4)] flex items-center justify-center text-slate-950 dark:text-white font-medium"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </motion.button>
    </>
  );
}
