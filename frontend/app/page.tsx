"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store/searchStore";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";
import {
  Search,
  MapPin,
  Navigation,
  Clock,
  ShieldCheck,
  Zap,
  Star,
  MessageSquare,
  Send,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/services/auth";
import { getServiceReviews, submitServiceReview } from "@/services/review";

export default function Home() {
  const router = useRouter();
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const [query, setQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Service Reviews States
  const [serviceReviews, setServiceReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  // Review Submission States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setUser(getCurrentUser());
    getServiceReviews()
      .then(setServiceReviews)
      .catch((err) => console.error("Failed to load service reviews", err))
      .finally(() => setLoadingReviews(false));
  }, []);

  if (!isMounted) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query);
      router.push("/search");
    }
  };

  const handleServiceReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess(false);
    try {
      const newReview = await submitServiceReview(rating, comment);
      setServiceReviews((prev) => [newReview, ...prev]);
      setComment("");
      setRating(5);
      setReviewSuccess(true);
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-cyan-500/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/70 backdrop-blur-md border-b border-slate-300 dark:border-white/10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-slate-950 dark:text-white font-medium shadow-[0_0_15px_rgba(0,217,255,0.5)]">
            <span className="text-xs font-black">PF</span>
          </div>
          <span className="text-xl font-bold tracking-tight">ParkFlow <span className="text-cyan-600 dark:text-cyan-400">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-300">
          <a href="#how-it-works" className="hover:text-cyan-600 dark:text-cyan-400 transition-colors">How it works</a>
          <a href="#locations" className="hover:text-cyan-600 dark:text-cyan-400 transition-colors">Locations</a>
          <button onClick={() => router.push('/features')} className="hover:text-cyan-600 dark:text-cyan-400 transition-colors">Features</button>
          <button onClick={() => router.push('/pricing')} className="hover:text-cyan-600 dark:text-cyan-400 transition-colors">Pricing</button>
          <button onClick={() => router.push('/contact')} className="hover:text-cyan-600 dark:text-cyan-400 transition-colors">Contact</button>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Button variant="ghost" className="text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 font-medium hidden sm:flex" onClick={() => router.push("/admin/dashboard")}>
                  Admin Portal
                </Button>
              )}
              <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(0,217,255,0.3)]" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:text-white font-medium hover:bg-white/10 hidden sm:flex" onClick={() => router.push("/login")}>
                Log in
              </Button>
              <Button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(0,217,255,0.3)]" onClick={() => router.push("/login?tab=register")}>
                Sign up
              </Button>
            </>
          )}
          <ThemeToggle />
          <button className="md:hidden flex flex-col gap-1 p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span className={`w-5 h-0.5 bg-slate-300 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`w-5 h-0.5 bg-slate-300 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-slate-300 transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="fixed top-[65px] left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-300 dark:border-white/10 p-6 flex flex-col gap-4 md:hidden">
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors text-sm font-medium">How it works</a>
          <a href="#locations" onClick={() => setMenuOpen(false)} className="text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors text-sm font-medium">Locations</a>
          <button onClick={() => { router.push('/features'); setMenuOpen(false); }} className="text-left text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors text-sm font-medium">Features</button>
          <button onClick={() => { router.push('/pricing'); setMenuOpen(false); }} className="text-left text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors text-sm font-medium">Pricing</button>
          <button onClick={() => { router.push('/contact'); setMenuOpen(false); }} className="text-left text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:text-cyan-400 transition-colors text-sm font-medium">Contact</button>
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <button onClick={() => { router.push('/admin/dashboard'); setMenuOpen(false); }} className="text-left text-cyan-600 dark:text-cyan-400 font-bold text-sm">Admin Portal →</button>
              )}
              <button onClick={() => { router.push('/dashboard'); setMenuOpen(false); }} className="text-left text-cyan-600 dark:text-cyan-400 font-bold text-sm">Dashboard →</button>
            </>
          ) : (
            <button onClick={() => { router.push('/login'); setMenuOpen(false); }} className="text-left text-cyan-600 dark:text-cyan-400 font-bold text-sm">Log in →</button>
          )}
        </div>
      )}

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
        </div>

        <div className="container relative z-10 mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Copy & Booking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Live Occupancy Ticker: 2,401 spots available
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Park instantly.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Zero friction.
              </span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-lg leading-relaxed">
              ParkFlow AI delivers real-time availability, instant
              reservations, and seamless navigation in one premium smart-city platform.
            </p>

            {/* Dynamic Booking Card */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white shadow-sm dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-white/10 rounded-2xl p-2 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Where are you going? (e.g. Lulu Mall)"
                    className="w-full bg-slate-950/50 border border-slate-300 dark:border-white/5 rounded-xl py-4 pl-12 pr-4 text-slate-950 dark:text-white font-medium placeholder:text-slate-900 dark:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
                 <button
                   type="submit"
                   className="py-4 px-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-lg w-full md:w-auto shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all flex items-center justify-center gap-2"
                 >
                   <Search className="w-5 h-5" />
                   Find Parking
                 </button>
              </div>
            </form>
          </motion.div>

          {/* Right Column: Animated City Map placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 overflow-hidden shadow-2xl"
          >
            {/* Map Background Grid Simulation */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />

            {/* Floating Indicators (Interactive) */}
            <motion.div
              onClick={() => {
                setSearchQuery("Lulu Mall");
                router.push("/search");
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 bg-white/80 dark:bg-slate-950/80 backdrop-blur border border-cyan-500/30 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg cursor-pointer hover:border-cyan-400 transition-colors z-20"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,217,255,1)]" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-950 dark:text-white font-medium">₹50/hr</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">40 spots left</div>
              </div>
            </motion.div>

            <motion.div
              onClick={() => {
                setSearchQuery("MG Road");
                router.push("/search");
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3.5,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-1/3 right-1/4 bg-white/80 dark:bg-slate-950/80 backdrop-blur border border-emerald-500/30 px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg cursor-pointer hover:border-emerald-400 transition-colors z-20"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-950 dark:text-white font-medium">₹45/hr</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Premium Secure</div>
              </div>
            </motion.div>

            {/* Central Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-cyan-400 shadow-[0_0_30px_rgba(0,217,255,0.8)] animate-pulse" />
            </div>

            {/* Simulated route line */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 25 25 Q 50 25 50 50 T 75 66"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="1"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#00D9FF" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      </main>

      {/* How it Works Section */}
      <section className="py-24 border-t border-slate-300 dark:border-white/5 bg-slate-900/30 relative" id="how-it-works">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest block mb-2">Step-by-Step</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How ParkFlow AI Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">Three simple steps to secure, seamless parking in busy locations.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search Location', desc: 'Enter your destination or click popular spot markers to find available lots nearby in real-time.' },
              { step: '02', title: 'Choose Slot & Book', desc: 'Select your preferred parking slot and booking duration, then confirm checkout securely.' },
              { step: '03', title: 'Scan QR at Gate', desc: 'Arrive at the parking lot gate. Simply scan your digital QR ticket to open the automated boom barrier.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white shadow-sm dark:bg-slate-950/40 border border-slate-300 dark:border-white/5 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-4 right-4 text-4xl font-black text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors">{item.step}</div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white font-medium mb-3 mt-4">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-24 border-t border-slate-300 dark:border-white/5 bg-slate-100 dark:bg-slate-950 relative" id="locations">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest block mb-2">Operational Hubs</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Operational Parking Hubs</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">Instant bookings are operational in top landmarks across key Indian cities.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Lulu Mall Parking', loc: 'Edappally, Kochi, Kerala', image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=600&auto=format&fit=crop', spots: '40 spots left' },
              { name: 'Kozhikode Beach Parking', loc: 'Beach Road, Kozhikode, Kerala', image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=600&auto=format&fit=crop', spots: '120 spots left' },
              { name: 'Thampanoor Parking Hub', loc: 'Thampanoor, Trivandrum, Kerala', image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600&auto=format&fit=crop', spots: '180 spots left' }
            ].map((hub, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setSearchQuery(hub.name);
                  router.push("/search");
                }}
                className="bg-white shadow-sm dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 hover:border-cyan-500/40 rounded-2xl overflow-hidden cursor-pointer group transition-all"
              >
                <div className="h-48 overflow-hidden relative">
                  <Image src={hub.image} alt={hub.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-slate-300 dark:border-white/5">
                    {hub.spots}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-950 dark:text-white font-medium group-hover:text-cyan-600 dark:text-cyan-400 transition-colors">{hub.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{hub.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        className="py-24 border-t border-slate-300 dark:border-white/5 bg-slate-900/30 relative"
        id="benefits"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why choose ParkFlow AI?
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Award-winning experience designed for modern drivers and smart-city operators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white shadow-sm dark:bg-slate-950/40 border border-slate-300 dark:border-white/5 hover:border-cyan-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Navigation</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Turn-by-turn routing directly to your reserved spot. No more
                circling the block looking for spaces.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white shadow-sm dark:bg-slate-950/40 border border-slate-300 dark:border-white/5 hover:border-blue-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Booking</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Secure your space in under 60 seconds with our single-page
                progressive booking flow.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white shadow-sm dark:bg-slate-950/40 border border-slate-300 dark:border-white/5 hover:border-purple-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Dynamic Extension</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Running late? Extend your parking session with a single tap
                directly from your phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Reviews Section */}
      <section className="py-24 border-t border-slate-300 dark:border-white/5 bg-slate-100 dark:bg-slate-950 relative" id="reviews">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest block mb-2">Driver Feedback</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">What Drivers Say</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">Real customer reviews of our smart parking service, gate automation, and app.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            
            {/* Reviews Feed List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Latest Service Reviews ({serviceReviews.length})
              </h3>
              
              {loadingReviews ? (
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-500 py-8 justify-center">
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Loading feed...</span>
                </div>
              ) : serviceReviews.length === 0 ? (
                <p className="text-slate-900 dark:text-slate-500 italic py-6">No service reviews submitted yet. Be the first to leave one!</p>
              ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                  {serviceReviews.map((rev) => (
                    <div key={rev.id} className="bg-white shadow-sm dark:bg-slate-900/60 border border-slate-300 dark:border-white/5 rounded-xl p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-950 dark:text-white font-medium">{rev.user?.name || "Driver"}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3.5 h-3.5 ${star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-800"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">"{rev.comment}"</p>
                      <span className="text-[9px] text-slate-600 block text-right font-medium">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Service Review Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white font-medium mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Write a Service Review
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                Tell us about your overall experience using ParkFlow AI.
              </p>

              {user ? (
                <form onSubmit={handleServiceReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold">
                      {reviewError}
                    </div>
                  )}

                  {reviewSuccess && (
                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Review submitted successfully! Thank you.</span>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Overall Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => { setRating(star); setReviewSuccess(false); }}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star className={`w-7 h-7 ${star <= rating ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]" : "text-slate-800"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Feedback Comment</label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => { setComment(e.target.value); setReviewSuccess(false); }}
                      placeholder="Excellent gate speed, beautiful design..."
                      rows={4}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 rounded-xl text-xs flex gap-1.5 justify-center items-center shadow-lg disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    {submittingReview ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1" /> Submit Service Review
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="border border-dashed border-white/15 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
                  <p className="text-xs text-slate-900 dark:text-slate-500 italic mb-4 max-w-[200px]">You must be signed in to submit a service review.</p>
                  <Button 
                    onClick={() => router.push("/login")}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs"
                  >
                    Log In / Register
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
