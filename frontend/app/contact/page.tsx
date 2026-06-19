"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Phone, MapPin, Send, Check, MessageSquare, Clock, Loader2 } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 20) e.message = "Message must be at least 20 characters";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500)); // mock submit
    setSubmitting(false);
    setSubmitted(true);
  };

  const contacts = [
    { icon: Mail, label: "Email Us", value: "support@parkflow.ai", sub: "Response within 24 hours" },
    { icon: Phone, label: "Call Us", value: "+91 80 4567 8900", sub: "Mon–Fri, 9am–6pm IST" },
    { icon: MapPin, label: "Headquarters", value: "Kochi, Kerala, India", sub: "Smart City Hub, Kakkanad" },
    { icon: Clock, label: "Support Hours", value: "24/7 Online", sub: "Via app notifications & chat" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/70 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(0,217,255,0.5)]">
            <span className="text-xs">PF</span>
          </div>
          <span className="text-xl font-bold tracking-tight">ParkFlow <span className="text-cyan-400">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/features")} className="text-sm text-slate-300 hover:text-cyan-400 transition-colors hidden md:block">Features</button>
          <button onClick={() => router.push("/pricing")} className="text-sm text-slate-300 hover:text-cyan-400 transition-colors hidden md:block">Pricing</button>
          <button onClick={() => router.push("/login")} className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-16 text-center relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-6">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-4">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">touch</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Questions about our parking platform? Want to bring ParkFlow AI to your property? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-black mb-6">Contact Information</h2>
              {contacts.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-5 bg-slate-900/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <c.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">{c.label}</span>
                    <p className="text-sm font-semibold text-white">{c.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.sub}</p>
                  </div>
                </motion.div>
              ))}

              {/* Map placeholder */}
              <div className="mt-6 rounded-2xl overflow-hidden border border-white/5 aspect-video relative bg-slate-900">
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-slate-500">
                  <MapPin className="w-8 h-8 text-cyan-400" />
                  <span className="text-xs font-bold">Kochi, Kerala — Smart City Hub</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">Message Sent!</h3>
                    <p className="text-slate-400 text-sm">We'll get back to you at <span className="text-cyan-400">{form.email}</span> within 24 hours.</p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                      className="mt-6 px-5 py-2.5 text-sm text-slate-300 border border-white/15 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <h2 className="text-xl font-black mb-6">Send us a message</h2>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Full Name</label>
                        <input
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Alex Mercer"
                          className={`w-full bg-slate-950/60 border rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 transition-all ${errors.name ? 'border-rose-500/50 focus:ring-rose-500/30' : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/30'}`}
                        />
                        {errors.name && <p className="text-rose-400 text-[10px] mt-1 font-semibold">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Email Address</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="alex@company.com"
                          className={`w-full bg-slate-950/60 border rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 transition-all ${errors.email ? 'border-rose-500/50 focus:ring-rose-500/30' : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/30'}`}
                        />
                        {errors.email && <p className="text-rose-400 text-[10px] mt-1 font-semibold">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Subject</label>
                      <input
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="Enterprise partnership inquiry"
                        className={`w-full bg-slate-950/60 border rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 transition-all ${errors.subject ? 'border-rose-500/50 focus:ring-rose-500/30' : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/30'}`}
                      />
                      {errors.subject && <p className="text-rose-400 text-[10px] mt-1 font-semibold">{errors.subject}</p>}
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Message</label>
                      <textarea
                        rows={6}
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Tell us about your parking lot, number of slots, or any specific integration needs..."
                        className={`w-full bg-slate-950/60 border rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 transition-all resize-none ${errors.message ? 'border-rose-500/50 focus:ring-rose-500/30' : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/30'}`}
                      />
                      {errors.message && <p className="text-rose-400 text-[10px] mt-1 font-semibold">{errors.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 rounded-xl text-sm shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all flex items-center gap-2 justify-center disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
