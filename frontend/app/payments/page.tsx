"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, Download, TrendingUp, Calendar, DollarSign,
  Check, X, Loader2, ArrowLeft, Receipt, Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, logout } from "@/services/auth";
import { getBookingHistory } from "@/services/booking";
import { formatCurrency } from "@/lib/utils";

function getPaymentMethodIcon(method: string) {
  if (method === "CARD") return "💳";
  if (method === "UPI") return "📱";
  if (method === "CASH") return "💵";
  return "🏦";
}

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "PENDING" | "CANCELLED">("ALL");

  useEffect(() => {
    async function load() {
      try {
        const [profile, history] = await Promise.all([getProfile(), getBookingHistory()]);
        setUser(profile);
        setBookings(history);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = filter === "ALL" ? bookings : bookings.filter(b => b.status === filter);
  const totalSpent = bookings.filter(b => b.status !== "CANCELLED").reduce((acc, b) => acc + (b.amount || 0), 0);
  const completed = bookings.filter(b => b.status === "COMPLETED").length;
  const pending = bookings.filter(b => b.status === "PENDING" || b.status === "ACTIVE").length;

  const statusStyle: Record<string, string> = {
    COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    ACTIVE: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    CANCELLED: "bg-slate-800/40 text-slate-400 border-white/5",
  };

  const handleDownloadInvoice = (booking: any) => {
    const lines = [
      "========================================",
      "       PARKFLOW AI — INVOICE",
      "========================================",
      `Invoice #: ${booking.id.slice(0, 8).toUpperCase()}`,
      `Date: ${new Date(booking.createdAt).toLocaleDateString("en-IN")}`,
      "----------------------------------------",
      `Location: ${booking.slot?.lot?.name || "N/A"}`,
      `Slot: ${booking.slot?.name || "N/A"}`,
      `From: ${new Date(booking.startTime).toLocaleString("en-IN")}`,
      `To: ${new Date(booking.endTime).toLocaleString("en-IN")}`,
      "----------------------------------------",
      `Subtotal: ${formatCurrency(booking.amount)}`,
      `GST (18%): ${formatCurrency(booking.amount * 0.18)}`,
      `TOTAL: ${formatCurrency(booking.amount * 1.18)}`,
      "========================================",
      "Thank you for using ParkFlow AI!",
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ParkFlow_Invoice_${booking.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30 flex">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/60 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-20 shrink-0">
        <div className="flex items-center gap-2.5 mb-10 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(0,217,255,0.4)]">
            <span className="text-xs font-black">PF</span>
          </div>
          <span className="text-xl font-black tracking-tight">ParkFlow <span className="text-cyan-400">AI</span></span>
        </div>

        <div className="space-y-1 flex-1">
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Payment History", path: "/payments", active: true },
            { label: "Profile", path: "/profile" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                item.active ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-10">
        <header className="mb-10">
          <h1 className="text-3xl font-black">Payment History</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">
            All transactions and invoices for {user?.name}
          </p>
        </header>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Spent", value: formatCurrency(totalSpent), icon: DollarSign, color: "cyan", sub: `${bookings.length} total bookings` },
            { label: "Completed", value: completed.toString(), icon: Check, color: "emerald", sub: "Successful sessions" },
            { label: "In Progress", value: pending.toString(), icon: Clock, color: "amber", sub: "Active / Pending" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-slate-900 border border-white/5 rounded-3xl p-6 relative overflow-hidden"
            >
              <stat.icon className={`absolute top-4 right-4 w-10 h-10 opacity-10 ${stat.color === "cyan" ? "text-cyan-400" : stat.color === "emerald" ? "text-emerald-400" : "text-amber-400"}`} />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">{stat.label}</span>
              <h3 className={`text-3xl font-black ${stat.color === "cyan" ? "text-cyan-400" : stat.color === "emerald" ? "text-emerald-400" : "text-amber-400"}`}>{stat.value}</h3>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">{stat.sub}</span>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["ALL", "COMPLETED", "ACTIVE", "PENDING", "CANCELLED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f === "ACTIVE" ? "PENDING" : f as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filter === f
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  : "border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-12 text-center text-slate-500 italic text-sm">
              No payment records found for this filter.
            </div>
          ) : (
            filtered.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-slate-900 border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                    <Receipt className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusStyle[b.status] || ""}`}>
                        {b.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold"># {b.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <h3 className="text-sm font-black text-white">{b.slot?.lot?.name || "Parking Lot"}</h3>
                    <p className="text-xs text-slate-400">Slot {b.slot?.name || "A1"} • {b.slot?.lot?.location || "Kochi, Kerala"}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                      <Calendar className="w-3 h-3" />
                      {new Date(b.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      <span>·</span>
                      <Clock className="w-3 h-3" />
                      {new Date(b.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} — {new Date(b.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col justify-between items-center sm:items-end shrink-0 border-t sm:border-0 border-white/5 pt-3 sm:pt-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">Amount</span>
                    <span className="text-xl font-black text-cyan-400">{formatCurrency(b.amount)}</span>
                  </div>
                  {b.status === "COMPLETED" && (
                    <button
                      onClick={() => handleDownloadInvoice(b)}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30 px-3 py-2 rounded-xl transition-all mt-2"
                    >
                      <Download className="w-3.5 h-3.5" /> Invoice
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
