"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, CheckCircle2, XCircle, Loader2, LogOut,
  Activity, Car, Clock, AlertTriangle, Camera, Search, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, logout } from "@/services/auth";
import { simulateScan, getBookingDetails } from "@/services/booking";

export default function StaffScannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [action, setAction] = useState<"ENTRY" | "EXIT">("ENTRY");
  const [gateOpen, setGateOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function check() {
      try {
        const profile = await getProfile();
        if (profile.role === "CUSTOMER") { router.push("/dashboard"); return; }
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    }
    check();
    inputRef.current?.focus();
  }, []);

  const handleScan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!bookingId.trim()) return;
    setScanning(true);
    setError("");
    setResult(null);

    try {
      const details = await getBookingDetails(bookingId.trim());
      const scanResult = await simulateScan(bookingId.trim(), action);
      const scan = {
        id: bookingId.trim().slice(0, 8),
        user: details.user?.name || "Customer",
        slot: details.slot?.name || "A1",
        lot: details.slot?.lot?.name || "Parking Lot",
        action,
        time: new Date().toLocaleTimeString("en-IN"),
        status: "SUCCESS",
      };
      setResult({ ...details, scanResult });
      setRecentScans(prev => [scan, ...prev.slice(0, 9)]);
      setGateOpen(true);
      setTimeout(() => setGateOpen(false), 4000);
      setBookingId("");
    } catch (err: any) {
      setError(err.message || "Scan failed. Invalid or expired booking ID.");
      setRecentScans(prev => [{
        id: bookingId.trim().slice(0, 8),
        action,
        time: new Date().toLocaleTimeString("en-IN"),
        status: "FAILED",
      }, ...prev.slice(0, 9)]);
    } finally {
      setScanning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-300 dark:border-white/10 bg-white shadow-sm dark:bg-slate-950/60 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-20 shrink-0">
        <div className="flex items-center gap-2.5 mb-10 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-slate-950 dark:text-white font-medium">
            <span className="text-xs font-black">PF</span>
          </div>
          <span className="text-xl font-black tracking-tight">ParkFlow <span className="text-emerald-400 text-xs block font-bold">Staff</span></span>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { label: "Staff Dashboard", path: "/staff", icon: Activity },
            { label: "Active Reservations", path: "/staff/reservations", icon: CheckCircle2 },
            { label: "QR Scanner", path: "/staff/scanner", icon: QrCode, active: true },
            { label: "Vehicle Monitoring", path: "/staff/vehicles", icon: Car },
          ].map((item) => (
            <button key={item.path} onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${(item as any).active ? "bg-emerald-500/10 text-emerald-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium hover:bg-white/5"}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 font-semibold hover:bg-rose-500/5 transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-10 overflow-y-auto relative z-10">
        <header className="mb-8">
          <h1 className="text-3xl font-black">QR Scanner</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">Scan or enter booking ID to process entry/exit</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Scanner Panel */}
          <div className="space-y-5">
            {/* Action Select */}
            <div className="grid grid-cols-2 gap-3">
              {(["ENTRY", "EXIT"] as const).map((a) => (
                <button key={a} onClick={() => setAction(a)}
                  className={`py-4 rounded-2xl border font-bold text-sm transition-all ${action === a
                    ? a === "ENTRY" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "bg-blue-500/15 border-blue-500/40 text-blue-400"
                    : "border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-white/20"
                  }`}>
                  {a === "ENTRY" ? "🚗 Entry Gate" : "🏁 Exit Gate"}
                </button>
              ))}
            </div>

            {/* Scanner UI */}
            <div className={`relative rounded-3xl overflow-hidden border-2 aspect-square flex flex-col items-center justify-center transition-all ${gateOpen
              ? action === "ENTRY" ? "border-emerald-500/60 bg-emerald-500/5 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
              : "border-blue-500/60 bg-blue-500/5 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
              : "border-slate-300 dark:border-white/10 bg-white shadow-sm dark:bg-slate-900/60"}`}>
              <AnimatePresence mode="wait">
                {gateOpen ? (
                  <motion.div key="open" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center gap-4 text-center p-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-2 ${action === "ENTRY" ? "bg-emerald-500/20 border-emerald-500/40" : "bg-blue-500/20 border-blue-500/40"}`}>
                      <CheckCircle2 className={`w-10 h-10 ${action === "ENTRY" ? "text-emerald-400" : "text-blue-400"}`} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black ${action === "ENTRY" ? "text-emerald-400" : "text-blue-400"}`}>
                        {action === "ENTRY" ? "ENTRY GRANTED" : "EXIT GRANTED"}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Gate is opening...</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 text-center p-8">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-300 dark:border-white/10 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-slate-600" />
                      </div>
                      {/* Corner scan lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-lg" />
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-500 text-sm font-semibold">Point camera at QR code</p>
                      <p className="text-slate-600 text-xs mt-1">or enter Booking ID below</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Manual Input */}
            <form onSubmit={handleScan} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900 dark:text-slate-500" />
                <input
                  ref={inputRef}
                  value={bookingId}
                  onChange={e => setBookingId(e.target.value)}
                  placeholder="Paste or type Booking ID..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 focus:border-emerald-500/50 rounded-xl py-4 pl-11 pr-4 text-sm text-slate-950 dark:text-white font-medium focus:outline-none transition-all font-mono"
                />
              </div>
              <button type="submit" disabled={scanning || !bookingId.trim()}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center gap-2 justify-center transition-all disabled:opacity-50 ${action === "ENTRY"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "bg-blue-500 hover:bg-blue-400 text-slate-950 dark:text-white font-medium shadow-[0_0_20px_rgba(59,130,246,0.3)]"}`}>
                {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                {scanning ? "Processing..." : `Process ${action}`}
              </button>
            </form>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold">
                <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
          </div>

          {/* Scan Results + Log */}
          <div className="space-y-5">
            {/* Booking Details */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-emerald-500/20 rounded-3xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Booking Verified
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    ["Customer", result.user?.name || "N/A"],
                    ["Email", result.user?.email || "N/A"],
                    ["Parking Lot", result.slot?.lot?.name || "N/A"],
                    ["Slot", result.slot?.name || "N/A"],
                    ["Status", result.status],
                    ["Amount", `₹${result.amount}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-slate-300 dark:border-white/5 pb-2 last:border-0">
                      <span className="text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider">{k}</span>
                      <span className="text-slate-950 dark:text-white font-medium font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Scan Log */}
            <div className="bg-white shadow-sm dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 rounded-3xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Scan Log
              </h3>
              {recentScans.length === 0 ? (
                <p className="text-slate-600 italic text-xs py-4 text-center">No scans yet. Process a QR code to begin.</p>
              ) : (
                <div className="space-y-2">
                  {recentScans.map((scan, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border text-xs ${scan.status === "SUCCESS" ? "border-emerald-500/15 bg-emerald-500/5" : "border-rose-500/15 bg-rose-500/5"}`}>
                      <div className="flex items-center gap-2">
                        {scan.status === "SUCCESS" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        <span className="font-mono text-slate-700 dark:text-slate-300">{scan.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${scan.action === "ENTRY" ? "text-emerald-400 bg-emerald-500/10" : "text-blue-400 bg-blue-500/10"}`}>{scan.action}</span>
                      </div>
                      <span className="text-slate-900 dark:text-slate-500">{scan.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
