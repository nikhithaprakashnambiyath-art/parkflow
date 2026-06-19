"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, QrCode, Car, Users, CheckCircle2, AlertTriangle,
  Clock, MapPin, Loader2, LogOut, TrendingUp, Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, logout } from "@/services/auth";
import { formatCurrency } from "@/lib/utils";

const MOCK_ACTIVE = [
  { id: "bk001", user: "Alex Mercer", slot: "A1", lot: "Lulu Mall Smart Lot", start: "09:30", end: "12:30", status: "ACTIVE", amount: 150 },
  { id: "bk002", user: "Priya Sharma", slot: "B3", lot: "Marine Drive Seafront", start: "10:00", end: "11:00", status: "ACTIVE", amount: 50 },
  { id: "bk003", user: "Rahul Nair", slot: "C2", lot: "Lulu Mall Smart Lot", start: "08:00", end: "13:00", status: "PENDING", amount: 250 },
  { id: "bk004", user: "Arjun Patel", slot: "A4", lot: "MG Road Secure", start: "11:00", end: "13:00", status: "ACTIVE", amount: 100 },
];

const MOCK_VEHICLES_ON_LOT = [
  { plate: "KL-01-AA-1234", type: "suv", lot: "Lulu Mall Smart Lot", slot: "A1", since: "09:35", status: "NORMAL" },
  { plate: "MH-02-BB-5678", type: "compact", lot: "Marine Drive Seafront", slot: "B3", since: "10:05", status: "NORMAL" },
  { plate: "KA-04-CD-9012", type: "motorcycle", lot: "MG Road Secure", slot: "A4", since: "11:10", status: "OVERSTAYED" },
];

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const profile = await getProfile();
        if (profile.role === "CUSTOMER") { router.push("/dashboard"); return; }
        setUser(profile);
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    }
    check();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
    </div>
  );

  const stats = [
    { label: "Active Reservations", value: MOCK_ACTIVE.filter(b => b.status === "ACTIVE").length, icon: CheckCircle2, color: "emerald" },
    { label: "Pending Check-In", value: MOCK_ACTIVE.filter(b => b.status === "PENDING").length, icon: Clock, color: "amber" },
    { label: "Vehicles On-Lot", value: MOCK_VEHICLES_ON_LOT.length, icon: Car, color: "cyan" },
    { label: "Alerts", value: MOCK_VEHICLES_ON_LOT.filter(v => v.status === "OVERSTAYED").length, icon: AlertTriangle, color: "rose" },
  ];

  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400", amber: "text-amber-400", cyan: "text-cyan-400", rose: "text-rose-400"
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex selection:bg-cyan-500/30">
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Staff Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/60 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-20 shrink-0">
        <div className="flex items-center gap-2.5 mb-3 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <span className="text-xs font-black">PF</span>
          </div>
          <span className="text-xl font-black tracking-tight">ParkFlow <span className="text-emerald-400 text-xs block tracking-wider font-bold">Staff</span></span>
        </div>

        <div className="p-3 mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Logged in as</p>
          <p className="text-sm font-bold text-white mt-0.5">{user?.name || "Staff Officer"}</p>
          <p className="text-[10px] text-slate-500">{user?.role}</p>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { label: "Staff Dashboard", path: "/staff", active: true, icon: Activity },
            { label: "Active Reservations", path: "/staff/reservations", icon: CheckCircle2 },
            { label: "QR Scanner", path: "/staff/scanner", icon: QrCode },
            { label: "Vehicle Monitoring", path: "/staff/vehicles", icon: Car },
          ].map((item) => (
            <button key={item.path} onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${item.active ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => { logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 font-semibold hover:bg-rose-500/5 transition-all">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-10 overflow-y-auto relative z-10">
        <header className="mb-10">
          <h1 className="text-3xl font-black">Staff Operations Hub</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Live parking facility management</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-slate-900 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <stat.icon className={`absolute top-4 right-4 w-10 h-10 opacity-10 ${colorMap[stat.color]}`} />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">{stat.label}</span>
              <span className={`text-4xl font-black ${colorMap[stat.color]}`}>{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Open QR Scanner", desc: "Scan entry/exit tickets", path: "/staff/scanner", color: "cyan", icon: QrCode },
            { label: "View Reservations", desc: "Check all active bookings", path: "/staff/reservations", color: "emerald", icon: Eye },
            { label: "Monitor Vehicles", desc: "Track vehicles on lot", path: "/staff/vehicles", color: "amber", icon: Car },
          ].map((action, i) => (
            <motion.button key={i} onClick={() => router.push(action.path)}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.08 }}
              className={`p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                action.color === "cyan" ? "bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40" :
                action.color === "emerald" ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40" :
                "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
              }`}>
              <action.icon className={`w-8 h-8 mb-3 ${action.color === "cyan" ? "text-cyan-400" : action.color === "emerald" ? "text-emerald-400" : "text-amber-400"}`} />
              <h3 className="font-bold text-white text-sm">{action.label}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Active Bookings Preview */}
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-white/5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Active & Pending Bookings</h2>
            <button onClick={() => router.push("/staff/reservations")} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold">View All →</button>
          </div>
          <div className="divide-y divide-white/5">
            {MOCK_ACTIVE.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-white/2 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-8 rounded-full ${b.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <div>
                    <p className="text-sm font-bold text-white">{b.user}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" /> {b.lot} · Slot {b.slot}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-300 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3 text-slate-500" /> {b.start} — {b.end}
                  </p>
                  <p className="text-xs font-black text-cyan-400">{formatCurrency(b.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
