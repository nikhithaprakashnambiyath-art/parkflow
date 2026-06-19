"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Clock, MapPin, Loader2, LogOut,
  Activity, QrCode, Car, Search, Filter, Check, XCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, logout } from "@/services/auth";
import { getAuthHeaders } from "@/services/auth";
import { formatCurrency } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const MOCK_BOOKINGS = [
  { id: "bk001", user: { name: "Alex Mercer", email: "alex@example.com" }, slot: { name: "A1", lot: { name: "Lulu Mall Smart Lot", location: "Edappally, Kochi" } }, startTime: new Date(Date.now() - 3600000).toISOString(), endTime: new Date(Date.now() + 7200000).toISOString(), status: "ACTIVE", amount: 150 },
  { id: "bk002", user: { name: "Priya Sharma", email: "priya@example.com" }, slot: { name: "B3", lot: { name: "Marine Drive Seafront", location: "Marine Drive, Kochi" } }, startTime: new Date(Date.now() - 1800000).toISOString(), endTime: new Date(Date.now() + 3600000).toISOString(), status: "ACTIVE", amount: 50 },
  { id: "bk003", user: { name: "Rahul Nair", email: "rahul@example.com" }, slot: { name: "C2", lot: { name: "Lulu Mall Smart Lot", location: "Edappally, Kochi" } }, startTime: new Date(Date.now()).toISOString(), endTime: new Date(Date.now() + 18000000).toISOString(), status: "PENDING", amount: 250 },
  { id: "bk004", user: { name: "Arjun Patel", email: "arjun@example.com" }, slot: { name: "A4", lot: { name: "MG Road Secure", location: "MG Road, Bengaluru" } }, startTime: new Date(Date.now() - 7200000).toISOString(), endTime: new Date(Date.now() + 3600000).toISOString(), status: "ACTIVE", amount: 100 },
];

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CANCELLED: "bg-slate-700/40 text-slate-400 border-white/5",
};

export default function StaffReservationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>(MOCK_BOOKINGS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PENDING" | "COMPLETED">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const profile = await getProfile();
        if (profile.role === "CUSTOMER") { router.push("/dashboard"); return; }
        const headers = getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, { headers: { ...headers, "Content-Type": "application/json" } });
        if (res.ok) { const data = await res.json(); if (data.length > 0) setBookings(data); }
      } catch {}
      finally { setLoading(false); }
    }
    check();
  }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = b.user?.name?.toLowerCase().includes(search.toLowerCase()) || b.user?.email?.toLowerCase().includes(search.toLowerCase()) || b.slot?.name?.toLowerCase().includes(search.toLowerCase()) || b.slot?.lot?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleVerify = async (id: string, action: "ACTIVE" | "COMPLETED") => {
    setUpdatingId(id);
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_BASE_URL}/api/admin/booking/${id}/status`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: action } : b));
    } catch {}
    finally { setUpdatingId(null); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex selection:bg-cyan-500/30">
      <aside className="w-64 border-r border-white/10 bg-slate-950/60 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-20 shrink-0">
        <div className="flex items-center gap-2.5 mb-10 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-white">
            <span className="text-xs font-black">PF</span>
          </div>
          <span className="text-xl font-black tracking-tight">ParkFlow <span className="text-emerald-400 text-xs block font-bold">Staff</span></span>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { label: "Staff Dashboard", path: "/staff", icon: Activity },
            { label: "Active Reservations", path: "/staff/reservations", icon: CheckCircle2, active: true },
            { label: "QR Scanner", path: "/staff/scanner", icon: QrCode },
            { label: "Vehicle Monitoring", path: "/staff/vehicles", icon: Car },
          ].map((item) => (
            <button key={item.path} onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${(item as any).active ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 font-semibold hover:bg-rose-500/5 transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-10 overflow-y-auto relative z-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black">Active Reservations</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">{filtered.length} reservations shown</p>
          </div>
          <div className="flex gap-2">
            {(["ALL", "ACTIVE", "PENDING", "COMPLETED"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${statusFilter === s ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "border-white/5 text-slate-400 hover:border-white/15"}`}>
                {s}
              </button>
            ))}
          </div>
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer, slot, or lot..."
            className="w-full bg-slate-900 border border-white/10 focus:border-emerald-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none transition-all" />
        </div>

        <div className="space-y-3">
          {filtered.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-slate-900 border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-2 h-full min-h-[60px] rounded-full flex-shrink-0 ${b.status === "ACTIVE" ? "bg-emerald-500" : b.status === "PENDING" ? "bg-amber-500" : b.status === "COMPLETED" ? "bg-blue-500" : "bg-slate-600"}`} />
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusColors[b.status]}`}>{b.status}</span>
                    <span className="text-[10px] font-mono text-slate-500"># {b.id.slice(0, 8)}</span>
                  </div>
                  <p className="text-sm font-black text-white">{b.user?.name}</p>
                  <p className="text-xs text-slate-500">{b.user?.email}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" /> {b.slot?.lot?.name} · Slot {b.slot?.name}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(b.startTime).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })} — {new Date(b.endTime).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="flex sm:flex-col justify-between items-center sm:items-end gap-3 shrink-0 border-t sm:border-0 border-white/5 pt-3 sm:pt-0">
                <span className="text-lg font-black text-cyan-400">{formatCurrency(b.amount)}</span>
                <div className="flex gap-2">
                  {b.status === "PENDING" && (
                    <button disabled={updatingId === b.id} onClick={() => handleVerify(b.id, "ACTIVE")}
                      className="text-xs font-bold text-emerald-400 border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-2 rounded-xl transition-all flex items-center gap-1 disabled:opacity-50">
                      {updatingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Check-In
                    </button>
                  )}
                  {b.status === "ACTIVE" && (
                    <button disabled={updatingId === b.id} onClick={() => handleVerify(b.id, "COMPLETED")}
                      className="text-xs font-bold text-blue-400 border border-blue-500/25 bg-blue-500/5 hover:bg-blue-500/10 px-3 py-2 rounded-xl transition-all flex items-center gap-1 disabled:opacity-50">
                      {updatingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />} Check-Out
                    </button>
                  )}
                  <button onClick={() => router.push(`/staff/scanner`)}
                    className="text-xs font-bold text-slate-400 border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all flex items-center gap-1">
                    <QrCode className="w-3 h-3" /> Scan
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-12 text-center text-slate-500 italic">No reservations match this filter.</div>
          )}
        </div>
      </main>
    </div>
  );
}
