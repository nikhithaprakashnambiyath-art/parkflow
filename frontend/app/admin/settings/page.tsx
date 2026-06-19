"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Shield, Database, Globe, Save, Loader2, Check, LogOut, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, logout } from "@/services/auth";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings state
  const [appName, setAppName] = useState("ParkFlow AI");
  const [supportEmail, setSupportEmail] = useState("support@parkflow.ai");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveBookings, setAutoApproveBookings] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [defaultHourlyRate, setDefaultHourlyRate] = useState("50");
  const [maxSlotsPerUser, setMaxSlotsPerUser] = useState("3");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [maxBookingHours, setMaxBookingHours] = useState("24");

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

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-300 font-medium">{label}</span>
      <button onClick={() => onChange(!value)} className="relative focus:outline-none">
        {value
          ? <ToggleRight className="w-8 h-8 text-cyan-400" />
          : <ToggleLeft className="w-8 h-8 text-slate-600" />
        }
      </button>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-950/60 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-20 shrink-0">
        <div className="flex items-center gap-2.5 mb-10 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white">
            <span className="text-xs font-black">PF</span>
          </div>
          <span className="text-xl font-black tracking-tight">ParkFlow <span className="text-cyan-400 text-xs block tracking-wider font-bold">Admin</span></span>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { label: "Control Console", path: "/admin/dashboard" },
            { label: "User Management", path: "/admin/users" },
            { label: "Analytics", path: "/admin/analytics" },
            { label: "Settings", path: "/admin/settings", active: true },
          ].map((item) => (
            <button key={item.path} onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${item.active ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 font-semibold hover:bg-rose-500/5 transition-all">
          <LogOut className="w-4 h-4" /> Exit Console
        </button>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black">System Settings</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Platform configuration & operational controls</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">

          {/* General */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-slate-900 border border-white/5 rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-cyan-400" /> General
            </h2>
            <div className="space-y-4">
              {[
                { label: "Application Name", value: appName, setter: setAppName },
                { label: "Support Email", value: supportEmail, setter: setSupportEmail },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">{f.label}</label>
                  <input value={f.value} onChange={e => f.setter(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 focus:border-cyan-500/50 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-all" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Booking Rules */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-900 border border-white/5 rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-5">
              <Database className="w-4 h-4 text-emerald-400" /> Booking Rules
            </h2>
            <div className="space-y-4">
              {[
                { label: "Default Hourly Rate (₹)", value: defaultHourlyRate, setter: setDefaultHourlyRate, type: "number" },
                { label: "Max Active Bookings Per User", value: maxSlotsPerUser, setter: setMaxSlotsPerUser, type: "number" },
                { label: "Max Booking Duration (hours)", value: maxBookingHours, setter: setMaxBookingHours, type: "number" },
                { label: "Session Timeout (minutes)", value: sessionTimeout, setter: setSessionTimeout, type: "number" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">{f.label}</label>
                  <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 focus:border-cyan-500/50 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none transition-all" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-slate-900 border border-white/5 rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-5">
              <Bell className="w-4 h-4 text-amber-400" /> Notifications
            </h2>
            <Toggle value={emailNotifications} onChange={setEmailNotifications} label="Email Notifications" />
            <Toggle value={pushNotifications} onChange={setPushNotifications} label="Push Notifications" />
            <Toggle value={bookingNotifications} onChange={setBookingNotifications} label="Booking Confirmation Alerts" />
          </motion.div>

          {/* System Controls */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className={`rounded-3xl p-6 border ${maintenanceMode ? "bg-rose-500/5 border-rose-500/20" : "bg-slate-900 border-white/5"}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-5">
              <Shield className="w-4 h-4 text-violet-400" /> System Controls
            </h2>
            <Toggle value={autoApproveBookings} onChange={setAutoApproveBookings} label="Auto-Approve Bookings" />
            <Toggle value={maintenanceMode} onChange={setMaintenanceMode} label="Maintenance Mode" />
            {maintenanceMode && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-semibold">
                ⚠ Maintenance mode is ON — new bookings are blocked for all users.
              </motion.div>
            )}

            <div className="mt-5 pt-5 border-t border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Danger Zone</p>
              <button
                onClick={() => { if (confirm("Flush all in-memory cache? This will reset mock data.")) alert("Cache cleared (mock action)."); }}
                className="text-xs font-bold text-rose-400 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 px-4 py-2.5 rounded-xl transition-all w-full text-left"
              >
                🗑️ Clear System Cache
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
