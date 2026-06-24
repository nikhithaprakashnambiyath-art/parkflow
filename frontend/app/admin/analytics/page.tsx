"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, BarChart3, Activity, Clock, MapPin, Loader2, LogOut, Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { getProfile, logout } from "@/services/auth";
import { formatCurrency } from "@/lib/utils";

const REVENUE_TREND = [
  { date: "Jun 1", revenue: 3200, bookings: 18 },
  { date: "Jun 5", revenue: 4800, bookings: 26 },
  { date: "Jun 8", revenue: 3900, bookings: 22 },
  { date: "Jun 10", revenue: 6100, bookings: 34 },
  { date: "Jun 12", revenue: 5400, bookings: 30 },
  { date: "Jun 14", revenue: 7200, bookings: 42 },
  { date: "Jun 16", revenue: 6800, bookings: 38 },
  { date: "Jun 18", revenue: 8100, bookings: 47 },
  { date: "Jun 19", revenue: 7600, bookings: 44 },
];

const PEAK_HOURS = [
  { hour: "6am", bookings: 8 }, { hour: "8am", bookings: 22 },
  { hour: "9am", bookings: 35 }, { hour: "10am", bookings: 28 },
  { hour: "12pm", bookings: 42 }, { hour: "2pm", bookings: 19 },
  { hour: "5pm", bookings: 48 }, { hour: "6pm", bookings: 55 },
  { hour: "7pm", bookings: 62 }, { hour: "8pm", bookings: 40 },
  { hour: "10pm", bookings: 15 }, { hour: "12am", bookings: 6 },
];

const OCCUPANCY_BY_LOT = [
  { name: "Lulu Mall", occupancy: 82 },
  { name: "Marine Drive", occupancy: 65 },
  { name: "Fort Kochi", occupancy: 51 },
  { name: "MG Road", occupancy: 78 },
  { name: "Infopark", occupancy: 43 },
  { name: "Calicut Mall", occupancy: 69 },
];

const BOOKING_STATUS_PIE = [
  { name: "Completed", value: 62, color: "#22c55e" },
  { name: "Active", value: 15, color: "#00d9ff" },
  { name: "Pending", value: 12, color: "#f59e0b" },
  { name: "Cancelled", value: 11, color: "#ef4444" },
];

const TOOLTIP_STYLE = { backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px", fontSize: "11px" };

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    async function check() {
      try {
        const profile = await getProfile();
        if (profile.role !== "ADMIN") router.push("/dashboard");
      } catch { router.push("/login"); }
      finally { setLoading(false); }
    }
    check();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex selection:bg-cyan-500/30">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-300 dark:border-white/10 bg-white shadow-sm dark:bg-slate-950/60 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-20 shrink-0">
        <div className="flex items-center gap-2.5 mb-10 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-slate-950 dark:text-white font-medium shadow-[0_0_15px_rgba(0,217,255,0.4)]">
            <span className="text-xs font-black">PF</span>
          </div>
          <span className="text-xl font-black tracking-tight">ParkFlow <span className="text-cyan-600 dark:text-cyan-400 text-xs block tracking-wider font-bold">Admin</span></span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { label: "Control Console", path: "/admin/dashboard" },
            { label: "User Management", path: "/admin/users" },
            { label: "Analytics", path: "/admin/analytics", active: true },
            { label: "Settings", path: "/admin/settings" },
          ].map((item) => (
            <button key={item.path} onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${item.active ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium hover:bg-white/5"}`}>
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => { logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 font-semibold hover:bg-rose-500/5 transition-all">
          <LogOut className="w-4 h-4" /> Exit Console
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-10 overflow-y-auto relative z-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black">Analytics Dashboard</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">Real-time performance insights</p>
          </div>
          <div className="flex items-center gap-2">
            {(["7d", "30d", "90d"] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${period === p ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" : "border-slate-300 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-white/15"}`}>
                {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </header>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Revenue", value: formatCurrency(87400), change: "+18.4%", up: true },
            { label: "Total Bookings", value: "847", change: "+12.1%", up: true },
            { label: "Avg Occupancy", value: "64.8%", change: "+3.2%", up: true },
            { label: "Avg Session", value: "2.4 hrs", change: "-0.3 hrs", up: false },
          ].map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-2xl p-5">
              <span className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1">{kpi.label}</span>
              <span className="text-2xl font-black text-slate-950 dark:text-white font-medium">{kpi.value}</span>
              <span className={`text-[10px] font-bold block mt-1 ${kpi.up ? "text-emerald-400" : "text-rose-400"}`}>{kpi.change} vs last period</span>
            </motion.div>
          ))}
        </div>

        {/* Revenue Trend */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Revenue Trend
                </h3>
                <p className="text-xs text-slate-900 dark:text-slate-500 mt-0.5">Daily revenue vs bookings</p>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_TREND}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00d9ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [formatCurrency(v), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#00d9ff" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status Pie */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-6">
              <Activity className="w-4 h-4 text-emerald-400" /> Booking Status
            </h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={BOOKING_STATUS_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {BOOKING_STATUS_PIE.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {BOOKING_STATUS_PIE.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Hours + Occupancy by Lot */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-6">
              <Clock className="w-4 h-4 text-amber-400" /> Peak Parking Hours
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PEAK_HOURS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="bookings" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-6">
              <MapPin className="w-4 h-4 text-rose-400" /> Occupancy by Lot
            </h3>
            <div className="space-y-3">
              {OCCUPANCY_BY_LOT.map((lot, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{lot.name}</span>
                    <span className={`font-bold ${lot.occupancy >= 75 ? "text-rose-400" : lot.occupancy >= 50 ? "text-amber-400" : "text-emerald-400"}`}>{lot.occupancy}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${lot.occupancy}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={`h-full rounded-full ${lot.occupancy >= 75 ? "bg-rose-500" : lot.occupancy >= 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
