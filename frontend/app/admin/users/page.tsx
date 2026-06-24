"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Shield, UserX, UserCheck, Loader2,
  ArrowLeft, LogOut, MoreVertical, Mail, Calendar, Car, CreditCard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, logout, getAuthHeaders } from "@/services/auth";
import { formatCurrency } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Mock users for fallback
const MOCK_USERS = [
  { id: "1", name: "Alex Mercer", email: "alex@example.com", role: "CUSTOMER", createdAt: new Date("2024-01-15"), _count: { bookings: 12, vehicles: 2 }, totalSpent: 1840 },
  { id: "2", name: "Priya Sharma", email: "priya@example.com", role: "CUSTOMER", createdAt: new Date("2024-02-22"), _count: { bookings: 8, vehicles: 1 }, totalSpent: 960 },
  { id: "3", name: "Rahul Nair", email: "rahul@example.com", role: "CUSTOMER", createdAt: new Date("2024-03-10"), _count: { bookings: 5, vehicles: 3 }, totalSpent: 620 },
  { id: "4", name: "Admin User", email: "admin@example.com", role: "ADMIN", createdAt: new Date("2024-01-01"), _count: { bookings: 0, vehicles: 0 }, totalSpent: 0 },
  { id: "5", name: "Staff Officer", email: "staff@example.com", role: "OPERATOR", createdAt: new Date("2024-02-01"), _count: { bookings: 0, vehicles: 0 }, totalSpent: 0 },
  { id: "6", name: "Arjun Patel", email: "arjun@example.com", role: "CUSTOMER", createdAt: new Date("2024-04-05"), _count: { bookings: 19, vehicles: 2 }, totalSpent: 2350 },
];

const roleColors: Record<string, string> = {
  ADMIN: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  CUSTOMER: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  OPERATOR: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "CUSTOMER" | "ADMIN" | "OPERATOR">("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const profile = await getProfile();
        if (profile.role !== "ADMIN") { router.push("/dashboard"); return; }
        const headers = getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: { ...headers, "Content-Type": "application/json" } });
        if (res.ok) {
          setUsers(await res.json());
        } else {
          setUsers(MOCK_USERS);
        }
      } catch {
        setUsers(MOCK_USERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex selection:bg-cyan-500/30">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[140px] pointer-events-none" />

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
            { label: "Analytics", path: "/admin/dashboard" },
            { label: "User Management", path: "/admin/users", active: true },
            { label: "Analytics Charts", path: "/admin/analytics" },
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
            <h1 className="text-3xl font-black">User Management</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">{users.length} total registered accounts</p>
          </div>
          <div className="flex items-center gap-3">
            {(["ALL", "CUSTOMER", "OPERATOR", "ADMIN"] as const).map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${roleFilter === r ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" : "border-slate-300 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-white/15"}`}>
                {r}
              </button>
            ))}
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: users.length, color: "cyan" },
            { label: "Customers", value: users.filter(u => u.role === "CUSTOMER").length, color: "blue" },
            { label: "Staff (Operators)", value: users.filter(u => u.role === "OPERATOR").length, color: "amber" },
            { label: "Admins", value: users.filter(u => u.role === "ADMIN").length, color: "violet" },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-2xl p-5">
              <span className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1">{stat.label}</span>
              <span className={`text-3xl font-black ${stat.color === "cyan" ? "text-cyan-600 dark:text-cyan-400" : stat.color === "blue" ? "text-blue-400" : stat.color === "amber" ? "text-amber-400" : "text-violet-400"}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900 dark:text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 focus:border-cyan-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-950 dark:text-white font-medium focus:outline-none transition-all"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 dark:border-white/5 text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Bookings</th>
                  <th className="p-4">Vehicles</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-xs font-black text-cyan-600 dark:text-cyan-400 border border-cyan-500/10">
                          {u.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-950 dark:text-white font-medium">{u.name}</p>
                          <p className="text-slate-900 dark:text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase ${roleColors[u.role] || ""}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{u._count?.bookings ?? 0}</td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{u._count?.vehicles ?? 0}</td>
                    <td className="p-4 font-bold text-cyan-600 dark:text-cyan-400">{formatCurrency(u.totalSpent ?? 0)}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium p-1.5 rounded-lg hover:bg-white/5 transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-slate-900 dark:text-slate-500 italic py-12 text-center text-xs">No users match the current filter.</div>
        )}

        {/* User Detail Panel */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-3xl p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl font-black text-slate-950 dark:text-white font-medium">
                  {selectedUser.name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedUser.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedUser.email}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border mt-1 inline-block ${roleColors[selectedUser.role]}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium p-2 rounded-xl hover:bg-white/5 transition-all">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white shadow-sm dark:bg-slate-950/60 border border-slate-300 dark:border-white/5 rounded-2xl p-4 text-center">
                <Car className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
                <span className="text-2xl font-black text-slate-950 dark:text-white font-medium">{selectedUser._count?.vehicles ?? 0}</span>
                <p className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold mt-1">Vehicles</p>
              </div>
              <div className="bg-white shadow-sm dark:bg-slate-950/60 border border-slate-300 dark:border-white/5 rounded-2xl p-4 text-center">
                <Calendar className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <span className="text-2xl font-black text-slate-950 dark:text-white font-medium">{selectedUser._count?.bookings ?? 0}</span>
                <p className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold mt-1">Bookings</p>
              </div>
              <div className="bg-white shadow-sm dark:bg-slate-950/60 border border-slate-300 dark:border-white/5 rounded-2xl p-4 text-center">
                <CreditCard className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{formatCurrency(selectedUser.totalSpent ?? 0)}</span>
                <p className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold mt-1">Total Spent</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
