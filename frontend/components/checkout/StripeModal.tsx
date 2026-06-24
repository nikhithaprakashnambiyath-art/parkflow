import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CreditCard, Loader2, CheckCircle2, Lock, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StripeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

export function StripeModal({ isOpen, onClose, onSuccess, amount }: StripeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate network request
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Wait for success animation before triggering callback
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          disabled={isProcessing || isSuccess}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg font-serif">S</span>
            </div>
            <span className="font-bold text-slate-800 text-lg">Stripe</span>
            <div className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              <Lock className="w-3 h-3" /> Test Mode
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-500">Pay ParkFlow AI</p>
                  <h2 className="text-3xl font-black text-slate-900">{formatCurrency(amount)}</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Card information</label>
                    <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                      <div className="px-3 py-3 border-b border-slate-300 flex items-center gap-2 bg-white">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="4242 4242 4242 4242" className="w-full outline-none text-sm text-slate-900 placeholder:text-slate-400" disabled={isProcessing} />
                      </div>
                      <div className="flex bg-white">
                        <input type="text" placeholder="MM / YY" className="w-1/2 px-3 py-3 outline-none border-r border-slate-300 text-sm text-slate-900 placeholder:text-slate-400" disabled={isProcessing} />
                        <input type="text" placeholder="CVC" className="w-1/2 px-3 py-3 outline-none text-sm text-slate-900 placeholder:text-slate-400" disabled={isProcessing} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Name on card</label>
                    <input type="text" placeholder="Alex Mercer" className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-sm" disabled={isProcessing} />
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `Pay ${formatCurrency(amount)}`
                  )}
                </button>
                
                <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Payments are secure and encrypted
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful</h3>
                <p className="text-slate-500 text-sm font-medium text-center">Your booking has been confirmed.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
