"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, AlertTriangle, Clock, MapPin, Loader2, LogOut, Activity, QrCode, CheckCircle2, Shield, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, logout } from "@/services/auth";

const MOCK_VEHICLES = [
  { plate: "KL-01-AA-1234", type: "SUV", owner: "Alex Mercer", lot: "Lulu Mall Smart Lot", slot: "A1", entryTime: new Date(Date.now() - 5400000).toISOString(), expectedExit: new Date(Date.now() + 7200000).toISOString(), status: "NORMAL", bookingId: "bk001" },
  { plate: "MH-02-BB-5678", type: "Compact", owner: "Priya Sharma", lot: "Marine Drive Seafront", slot: "B3", entryTime: new Date(Date.now() - 3600000).toISOString(), expectedExit: new Date(Date.now() + 3600000).toISOString(), status: "NORMAL", bookingId: "bk002" },
  { plate: "KA-04-CD-9012", type: "Motorcycle", owner: "Unknown", lot: "MG Road Secure", slot: "A4", entryTime: new Date(Date.now() - 14400000).toISOString(), expectedExit: new Date(Date.now() - 3600000).toISOString(), status: "OVERSTAYED", bookingId: "bk004" },
  { plate: "DL-07-EF-3456", type: "Sedan", owner: "Arjun Patel", lot: "Fort Kochi Beach Parking", slot: "C1", entryTime: new Date(Date.now() - 1800000).toISOString(), expectedExit: new Date(Date.now() + 10800000).toISOString(), status: "NORMAL", bookingId: "bk005" },
  { plate: "TN-09-GH-7890", type: "Van", owner: "Rahul Nair", lot: "Infopark Kakkanad", slot: "D2", entryTime: new Date(Date.now() - 7200000).toISOString(), expectedExit: new Date(Date.now() - 1800000).toISOString(), status: "OVERSTAYED", bookingId: "bk006" },
];

function getElapsed(entryTime: string) {
  const elapsed = Math.floor((Date.now() - new Date(entryTime).getTime()) / 60000);
  if (elapsed < 60) return `${elapsed}m`;
  return `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`;
}

function getTimeRemaining(exitTime: string) {
  const diff = new Date(exitTime).getTime() - Date.now();
  if (diff < 0) return `${Math.floor(Math.abs(diff) / 60000)}m overdue`;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m left`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m left`;
}

export default function StaffVehiclesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicles] = useState(MOCK_VEHICLES);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "NORMAL" | "OVERSTAYED">("ALL");

  useEffect(() => {
    async function check() {
      try {
        const profile = await getProfile();
        if (profile.role === "CUSTOMER") { router.push("/dashboard"); return; }
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    }
    check();
  }, []);

  const filtered = vehicles.filter(v => {
    const matchSearch = v.plate.toLowerCase().includes(search.toLowerCase()) || v.owner.toLowerCase().includes(search.toLowerCase()) || v.lot.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || v.status === filter;
    return matchSearch && matchFilter;
  });

  const overstayed = vehicles.filter(v => v.status === "OVERSTAYED").length;
  const normal = vehicles.filter(v => v.status === "NORMAL").length;

  if (loading) return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex selection:bg-cyan-500/30">
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
            { label: "QR Scanner", path: "/staff/scanner", icon: QrCode },
            { label: "Vehicle Monitoring", path: "/staff/vehicles", icon: Car, active: true },
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

      <main className="flex-1 p-8 lg:p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black">Vehicle Monitoring</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">Live tracking of vehicles on lot</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { label: "Total On Lot", value: vehicles.length, color: "cyan", icon: Car },
            { label: "Active (Normal)", value: normal, color: "emerald", icon: Shield },
            { label: "Overstayed", value: overstayed, color: "rose", icon: AlertTriangle },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <stat.icon className={`absolute top-4 right-4 w-10 h-10 opacity-10 ${stat.color === "cyan" ? "text-cyan-600 dark:text-cyan-400" : stat.color === "emerald" ? "text-emerald-400" : "text-rose-400"}`} />
              <span className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1">{stat.label}</span>
              <span className={`text-3xl font-black ${stat.color === "cyan" ? "text-cyan-600 dark:text-cyan-400" : stat.color === "emerald" ? "text-emerald-400" : "text-rose-400"}`}>{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {overstayed > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{overstayed} vehicle{overstayed > 1 ? "s are" : " is"} overstayed. Please alert the relevant customers immediately.</span>
          </motion.div>
        )}

        {/* Filter + Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900 dark:text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by plate, owner, or lot..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 focus:border-emerald-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-950 dark:text-white font-medium focus:outline-none transition-all" />
          </div>
          <div className="flex gap-2">
            {(["ALL", "NORMAL", "OVERSTAYED"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${filter === f ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "border-slate-300 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-white/15"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v, i) => (
            <motion.div key={v.plate} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-5 transition-all ${v.status === "OVERSTAYED" ? "bg-rose-500/5 border-rose-500/20" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-white/5 hover:border-slate-300 dark:border-white/10"}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-lg font-black text-slate-950 dark:text-white font-medium tracking-wider">{v.plate}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{v.type} · {v.owner}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${v.status === "OVERSTAYED" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                  {v.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> {v.lot} · Slot {v.slot}
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> On lot for: <span className="text-slate-950 dark:text-white font-medium font-bold">{getElapsed(v.entryTime)}</span>
                </div>
                <div className={`flex items-center gap-2 font-bold ${v.status === "OVERSTAYED" ? "text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>
                  <AlertTriangle className={`w-3.5 h-3.5 ${v.status === "OVERSTAYED" ? "text-rose-400" : "text-slate-900 dark:text-slate-500"}`} />
                  {getTimeRemaining(v.expectedExit)}
                </div>
              </div>

              {v.status === "OVERSTAYED" && (
                <button className="mt-4 w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all">
                  🔔 Send Alert to Customer
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
