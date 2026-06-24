import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Shield, X, Smartphone, CreditCard as CardIcon, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
}

export function RazorpayModal({ isOpen, onClose, onSuccess, amount }: RazorpayModalProps) {
  const [step, setStep] = useState<"methods" | "processing" | "success">("methods");

  useEffect(() => {
    if (!isOpen) {
      setStep("methods");
    }
  }, [isOpen]);

  const handlePay = () => {
    setStep("processing");
    // Simulate Razorpay network processing
    setTimeout(() => {
      setStep("success");
      // Wait for success animation before triggering callback
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Razorpay Header */}
        <div className="bg-blue-600 px-5 py-4 flex justify-between items-center relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">PF</span>
              </div>
              <span className="text-white font-bold tracking-wide">ParkFlow AI</span>
            </div>
            <p className="text-blue-100 text-[10px] uppercase font-bold tracking-widest opacity-80">Test Mode</p>
          </div>
          <div className="text-right relative z-10">
            <p className="text-blue-100 text-xs font-medium mb-0.5">Amount</p>
            <p className="text-white font-bold text-lg">{formatCurrency(amount)}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={step !== "methods"}
          className="absolute top-4 right-4 text-white/70 hover:text-white disabled:opacity-0 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-0 bg-slate-50 min-h-[320px] relative">
          <AnimatePresence mode="wait">
            {step === "methods" && (
              <motion.div
                key="methods"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-5"
              >
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Preferred Payment Methods</h3>
                  
                  <button onClick={handlePay} className="w-full flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800">UPI / QR</p>
                      <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                    </div>
                  </button>

                  <button onClick={handlePay} className="w-full flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <CardIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800">Cards</p>
                      <p className="text-xs text-slate-500">Visa, MasterCard, RuPay</p>
                    </div>
                  </button>

                  <button onClick={handlePay} className="w-full flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-slate-800">Netbanking</p>
                      <p className="text-xs text-slate-500">All Indian Banks</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white"
              >
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <h3 className="font-bold text-slate-800 mb-1">Processing Payment...</h3>
                <p className="text-xs text-slate-500">Please do not refresh or close this window.</p>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500 text-white"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle2 className="w-16 h-16 mb-4 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-1">Payment Successful!</h3>
                <p className="text-emerald-100 text-sm font-medium">Redirecting to merchant...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Razorpay Footer */}
        {step === "methods" && (
          <div className="bg-slate-100 border-t border-slate-200 py-3 px-5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 opacity-60 grayscale">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Secured by Razorpay</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
              <Shield className="w-3 h-3" /> PCI DSS Certified
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
