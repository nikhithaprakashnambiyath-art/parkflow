"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Zap, MapPin, QrCode, BarChart3, Shield, Car, Clock,
  Wifi, CreditCard, Bell, Users, Settings, ArrowRight, Check
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    color: "cyan",
    title: "Real-Time Availability",
    description: "Live slot status updates powered by IoT sensors. See exactly which spots are free before you arrive — no more wasted drives.",
    bullets: ["Live sensor data every 10 seconds", "Color-coded slot map", "Availability heatmaps by time"]
  },
  {
    icon: Zap,
    color: "blue",
    title: "Instant Reservations",
    description: "Reserve a parking slot in under 60 seconds. Our single-page booking flow removes every point of friction between you and your spot.",
    bullets: ["One-tap booking confirmation", "Flexible start & end times", "Instant cancellation anytime"]
  },
  {
    icon: QrCode,
    color: "indigo",
    title: "QR Code Gate Access",
    description: "Your digital parking ticket doubles as a gate pass. Scan at entry and exit — no physical tickets, no staff interaction needed.",
    bullets: ["Unique encrypted QR per booking", "Staff scan verification", "Auto check-in on scan"]
  },
  {
    icon: BarChart3,
    color: "emerald",
    title: "Advanced Analytics",
    description: "Deep insights into revenue, occupancy trends, and peak usage patterns. Make data-driven decisions to maximize lot performance.",
    bullets: ["Revenue trend charts", "Occupancy heatmaps", "Peak hour analytics"]
  },
  {
    icon: Shield,
    color: "violet",
    title: "Role-Based Access Control",
    description: "Three distinct portals for Customers, Staff, and Admins — each with precisely scoped permissions and workflows.",
    bullets: ["JWT-secured sessions", "Customer / Staff / Admin roles", "Audit log of all actions"]
  },
  {
    icon: Car,
    color: "amber",
    title: "Vehicle Fleet Management",
    description: "Register multiple vehicles with plate numbers. Our system auto-matches your plate to active bookings for seamless gate verification.",
    bullets: ["Multi-vehicle registration", "Plate-to-booking matching", "Vehicle type classification"]
  },
  {
    icon: CreditCard,
    color: "rose",
    title: "Smart Payment Gateway",
    description: "Secure mock payment processing with full invoice generation. Track all transactions with detailed receipts and export options.",
    bullets: ["Multiple payment methods", "Auto invoice generation", "Full payment history"]
  },
  {
    icon: Settings,
    color: "slate",
    title: "Dynamic Pricing Engine",
    description: "Set custom pricing multipliers for peak hours automatically. Maximize revenue during demand spikes while staying competitive off-peak.",
    bullets: ["Time-based multipliers", "Per-lot pricing rules", "Live rate preview"]
  },
  {
    icon: Bell,
    color: "cyan",
    title: "Smart Notifications",
    description: "Real-time alerts for booking confirmations, session expirations, payment receipts, and lot maintenance updates.",
    bullets: ["In-app notification center", "Session countdown alerts", "Cancellation notices"]
  }
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  cyan:   { bg: "bg-cyan-500/10",   text: "text-cyan-600 dark:text-cyan-400",   border: "group-hover:border-cyan-500/30" },
  blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "group-hover:border-blue-500/30" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "group-hover:border-indigo-500/30" },
  emerald:{ bg: "bg-emerald-500/10",text: "text-emerald-400",border: "group-hover:border-emerald-500/30" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "group-hover:border-violet-500/30" },
  amber:  { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "group-hover:border-amber-500/30" },
  rose:   { bg: "bg-rose-500/10",   text: "text-rose-400",   border: "group-hover:border-rose-500/30" },
  slate:  { bg: "bg-slate-500/10",  text: "text-slate-700 dark:text-slate-300",  border: "group-hover:border-slate-400/30" },
};

export default function FeaturesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-cyan-500/30">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/70 backdrop-blur-md border-b border-slate-300 dark:border-white/10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-slate-950 dark:text-white font-medium shadow-[0_0_15px_rgba(0,217,255,0.5)]">
            <span className="text-xs">PF</span>
          </div>
          <span className="text-xl font-bold tracking-tight">ParkFlow <span className="text-cyan-600 dark:text-cyan-400">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/pricing")} className="text-sm text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors hidden md:block">Pricing</button>
          <button onClick={() => router.push("/contact")} className="text-sm text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors hidden md:block">Contact</button>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-20 text-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-6">
              <Wifi className="w-3.5 h-3.5" /> Enterprise-grade smart parking
            </span>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
              Everything you need<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">to park smarter</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              ParkFlow AI combines real-time IoT data, intelligent booking flows, and beautiful analytics to make parking effortless for drivers and profitable for operators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-slate-300 dark:border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const c = colorMap[feat.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className={`group p-7 rounded-2xl bg-white shadow-sm dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 ${c.border} hover:bg-white dark:bg-slate-900 transition-all duration-300`}
                >
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center ${c.text} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white font-medium mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{feat.description}</p>
                  <ul className="space-y-1.5">
                    {feat.bullets.map((b, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs text-slate-900 dark:text-slate-500">
                        <Check className={`w-3.5 h-3.5 ${c.text} flex-shrink-0`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-slate-300 dark:border-white/5 text-center">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black mb-4">Ready to transform your parking?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Join thousands of drivers already using ParkFlow AI across India.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/login?tab=register")}
                className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all flex items-center gap-2 justify-center"
              >
                Start Free Today <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="px-8 py-4 rounded-xl border border-white/15 text-slate-700 dark:text-slate-300 hover:bg-white/5 font-semibold text-sm transition-all"
              >
                View Pricing
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
