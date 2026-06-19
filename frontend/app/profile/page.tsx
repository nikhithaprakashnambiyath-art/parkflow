"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Lock, Camera, Shield, Loader2, Check, AlertTriangle,
  LogOut, Trash2, ArrowLeft, Edit2, Save, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, logout, getAuthHeaders } from "@/services/auth";
import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"info" | "password" | "danger">("info");

  // Profile edit states
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState("");
  const [infoError, setInfoError] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile();
        setUser(profile);
        setEditName(profile.name);
        setEditEmail(profile.email);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const getInitials = (name: string) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setInfoError("");
    setInfoSuccess("");
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setUser(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("smartpark_user", JSON.stringify(updated));
      }
      setInfoSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      setInfoError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error("Failed to change password. Check current password.");
      setPwSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwError(err.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    ADMIN: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    CUSTOMER: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    OPERATOR: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden selection:bg-cyan-500/30">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 border-r border-white/10 bg-slate-950/60 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-20 shrink-0">
          <div className="flex items-center gap-2.5 mb-10 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(0,217,255,0.4)]">
              <span className="text-xs font-black">PF</span>
            </div>
            <span className="text-xl font-black tracking-tight">ParkFlow <span className="text-cyan-400">AI</span></span>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_25px_rgba(0,217,255,0.3)] mb-3 relative">
              {getInitials(user?.name || "")}
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-950 flex items-center justify-center">
                <Camera className="w-3 h-3 text-slate-400" />
              </div>
            </div>
            <h3 className="font-bold text-white text-sm">{user?.name}</h3>
            <p className="text-xs text-slate-400 truncate max-w-[180px]">{user?.email}</p>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border mt-2 ${roleColors[user?.role] || ''}`}>
              {user?.role}
            </span>
          </div>

          <nav className="flex-1 space-y-1">
            {[
              { id: "info", icon: User, label: "Personal Info" },
              { id: "password", icon: Lock, label: "Change Password" },
              { id: "danger", icon: Shield, label: "Account Safety" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === item.id
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-2">
            <button onClick={() => router.push("/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 font-semibold hover:bg-white/5 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <button onClick={() => { logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 font-semibold hover:bg-rose-500/5 transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <header className="mb-10">
            <h1 className="text-3xl font-black">Profile Settings</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Manage your account information</p>
          </header>

          {/* PERSONAL INFO */}
          {activeSection === "info" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
              {infoSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                  <Check className="w-4 h-4" /> {infoSuccess}
                </div>
              )}
              {infoError && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4" /> {infoError}
                </div>
              )}

              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black">Personal Information</h2>
                  <button
                    onClick={() => { setEditing(!editing); setInfoError(""); setInfoSuccess(""); }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${editing ? 'bg-slate-800 text-slate-300' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
                  >
                    {editing ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit2 className="w-3.5 h-3.5" /> Edit Profile</>}
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Full Name</label>
                    {editing ? (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-slate-950 border border-white/15 focus:border-cyan-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-white bg-slate-950/40 border border-white/5 rounded-xl py-3 px-4">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Email Address</label>
                    {editing ? (
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-white/15 focus:border-cyan-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-white bg-slate-950/40 border border-white/5 rounded-xl py-3 px-4">{user?.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Account Role</label>
                    <p className={`text-xs font-black uppercase tracking-widest inline-flex px-3 py-1.5 rounded-lg border ${roleColors[user?.role]}`}>
                      {user?.role}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Member Since</label>
                    <p className="text-sm text-slate-300">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
                  </div>

                  {editing && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          )}

          {/* CHANGE PASSWORD */}
          {activeSection === "password" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
              {pwSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                  <Check className="w-4 h-4" /> {pwSuccess}
                </div>
              )}
              {pwError && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4" /> {pwError}
                </div>
              )}

              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                <h2 className="text-lg font-black mb-6">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-5">
                  {[
                    { label: "Current Password", value: currentPassword, setter: setCurrentPassword, placeholder: "Your current password" },
                    { label: "New Password", value: newPassword, setter: setNewPassword, placeholder: "At least 8 characters" },
                    { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword, placeholder: "Repeat new password" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">{field.label}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={field.value}
                          onChange={e => field.setter(e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-950 border border-white/15 focus:border-cyan-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="w-full flex items-center gap-2 justify-center px-6 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all disabled:opacity-50"
                  >
                    {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {pwSaving ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* DANGER ZONE */}
          {activeSection === "danger" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl space-y-6">
              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6">
                <h2 className="text-lg font-black mb-2">Account Safety</h2>
                <p className="text-xs text-slate-400 mb-6">Manage security settings and session controls for your account.</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-slate-300">User ID</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">{user?.id}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-slate-300">Active Sessions</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">1 active session (this device)</p>
                    </div>
                    <button
                      onClick={() => { logout(); router.push("/login"); }}
                      className="text-xs font-bold text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all"
                    >
                      Sign Out All
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-rose-500/20 bg-rose-500/5 rounded-3xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-rose-400">Danger Zone</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Once you delete your account, all data including bookings, vehicles, and payment history will be permanently removed.</p>
                  </div>
                </div>
                <button
                  onClick={() => { if (confirm("Are you sure? This action is irreversible.")) { logout(); router.push("/"); } }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" /> Delete My Account
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
