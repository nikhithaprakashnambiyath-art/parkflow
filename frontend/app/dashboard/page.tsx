'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, History, Car, Settings, 
  MapPin, Clock, BarChart3, Plus, LogOut, Bell, X, Check, ArrowRight, Loader2, Sparkles, Navigation, Star, MessageSquare,
  CreditCard, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import { getProfile, logout } from '@/services/auth';
import ThemeToggle from '@/components/ThemeToggle';
import { getBookingHistory, getVehicles, addVehicle, removeVehicle, getNotifications, markNotificationRead, cancelBooking, getMyReviews, submitReview, hasReviewed } from '@/services/booking';
import { ReviewDialog } from '@/components/review/ReviewDialog';
import { formatCurrency, formatDistance } from '@/lib/utils';

const usageData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.8 },
  { day: 'Wed', hours: 1.2 },
  { day: 'Thu', hours: 4.5 },
  { day: 'Fri', hours: 6.0 },
  { day: 'Sat', hours: 8.5 },
  { day: 'Sun', hours: 5.2 },
];

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any | null>(null);
  
  // Data lists from API
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewTarget, setReviewTarget] = useState<any | null>(null);
  const [reviewedBookings, setReviewedBookings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeTab === 'reviews') {
      setReviewsLoading(true);
      getMyReviews()
        .then(setMyReviews)
        .catch((err) => console.error('Failed to load reviews', err))
        .finally(() => setReviewsLoading(false));
    }
  }, [activeTab]);  
  // States
  const [loading, setLoading] = useState(true);
  const [showNotificationInbox, setShowNotificationInbox] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('suv');
  const [addingCar, setAddingCar] = useState(false);
  const [countdownText, setCountdownText] = useState('00:00:00');
  const [errorMsg, setErrorMsg] = useState('');

  const loadReviewedBookingState = async (bookingList: any[]) => {
    const completedBookings = bookingList.filter((booking) => booking.status === 'COMPLETED');

    if (completedBookings.length === 0) {
      setReviewedBookings({});
      return;
    }

    const entries = await Promise.all(
      completedBookings.map(async (booking) => {
        const reviewed = await hasReviewed(booking.id);
        return [booking.id, reviewed] as const;
      }),
    );

    setReviewedBookings(Object.fromEntries(entries));
  };

  // Fetch all user dashboard data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Verify session — throws immediately if no token present
        const profile = await getProfile();
        if (!profile) {
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(profile);

        // Fetch bookings, vehicles, and notifications
        const [bookingsHistory, carList, alerts] = await Promise.all([
          getBookingHistory(),
          getVehicles(),
          getNotifications(),
        ]);

        setBookings(bookingsHistory);
        setVehicles(carList);
        setNotifications(alerts);
        await loadReviewedBookingState(bookingsHistory);
      } catch (err: any) {
        // Silent redirect for auth failures; show error for backend being unreachable
        const isAuthError = err?.status === 401 || err?.message === 'Unauthenticated';
        if (!isAuthError) {
          console.error('Dashboard load error:', err);
        }
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter out the active or pending reservation for countdown timer
  const activeBooking = bookings.find(b => b.status === 'ACTIVE' || b.status === 'PENDING');

  // Countdown timer logic
  useEffect(() => {
    if (!activeBooking) return;

    const interval = setInterval(() => {
      const target = new Date(activeBooking.endTime).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdownText('Session Ended');
        clearInterval(interval);
      } else {
        const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        const pad = (n: number) => n.toString().padStart(2, '0');
        setCountdownText(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBooking]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;
    setAddingCar(true);
    setErrorMsg('');
    try {
      const car = await addVehicle(newPlate, newVehicleType);
      setVehicles((prev) => [car, ...prev]);
      setNewPlate('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register vehicle.');
    } finally {
      setAddingCar(false);
    }
  };

  const handleRemoveVehicle = async (id: string) => {
    try {
      await removeVehicle(id);
      setVehicles((prev) => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map(n => n.id === id ? { ...n, readStatus: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      setBookings((prev) =>
        prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b)
      );
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    }
  };

  const handleSubmitBookingReview = async (rating: number, comment: string) => {
    if (!reviewTarget) return;

    const lotId = reviewTarget.slot?.lot?.id;
    if (!lotId) {
      throw new Error('Parking lot details are missing for this booking.');
    }

    const review = await submitReview(reviewTarget.id, lotId, rating, comment);
    setReviewedBookings((prev) => ({ ...prev, [reviewTarget.id]: true }));

    if (activeTab === 'reviews') {
      setMyReviews((prev) => [review, ...prev.filter((item) => item.id !== review.id)]);
    }
  };

  const unreadAlertsCount = notifications.filter(n => !n.readStatus).length;

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Syncing user workspace...</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      CANCELLED: 'bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/5',
    };
    return map[status] || 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex selection:bg-cyan-500/30 relative overflow-hidden">
      
      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-300 dark:border-white/10 bg-white shadow-sm dark:bg-slate-950/60 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-20 shrink-0">
        <div className="flex items-center gap-2.5 mb-12 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-slate-950 dark:text-white font-medium shadow-[0_0_15px_rgba(0,217,255,0.4)]">
            PF
          </div>
          <span className="text-xl font-black tracking-tight">ParkFlow <span className="text-cyan-600 dark:text-cyan-400">AI</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview', isPage: false },
            { id: 'vehicles', icon: Car, label: 'My Vehicles', isPage: false },
            { id: 'history', icon: History, label: 'Booking Logs', isPage: false },
            { id: 'payments', icon: CreditCard, label: 'Payment History', isPage: true, path: '/payments' },
            { id: 'profile', icon: User, label: 'Profile', isPage: true, path: '/profile' },
            { id: 'reviews', icon: MessageSquare, label: 'My Reviews', isPage: false },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => item.isPage ? router.push(item.path!) : setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id 
                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
            <h4 className="font-bold text-slate-950 dark:text-white font-medium text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Premium Club</h4>
            <p className="text-[10px] text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">Save flat 10% on monthly passes & dynamic rates.</p>
            <Button size="sm" className="w-full bg-white text-slate-950 font-bold hover:bg-slate-200 mt-3 text-xs py-4 rounded-lg">Upgrade</Button>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 font-semibold hover:bg-rose-500/5 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-10">
        
        {/* Dashboard Header */}
        <header className="flex justify-between items-center mb-10 relative">
          <div>
            <h1 className="text-3xl font-black mb-1 flex items-center gap-2">
              Welcome back, {user?.name || 'Alex'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">Driver Workspace Portal</p>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'ADMIN' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/admin/dashboard')}
                className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 font-bold"
              >
                Admin Portal
              </Button>
            )}
            <ThemeToggle />
            {/* Real-Time Alerts Bell Popover */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNotificationInbox(!showNotificationInbox)}
                className="hover:bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl relative text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:text-white font-medium"
              >
                <Bell className="w-5 h-5" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </Button>

              <AnimatePresence>
                {showNotificationInbox && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-2xl shadow-2xl p-4 z-30"
                  >
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-300 dark:border-white/5 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider">Alert Notifications</span>
                      <button onClick={() => setShowNotificationInbox(false)} className="text-slate-900 dark:text-slate-500 hover:text-slate-950 dark:text-white font-medium">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar text-xs">
                      {notifications.length === 0 ? (
                        <div className="text-slate-900 dark:text-slate-500 italic py-4 text-center">No alerts logged.</div>
                      ) : (
                        notifications.map((alert) => (
                          <div 
                            key={alert.id} 
                            onClick={() => !alert.readStatus && handleMarkRead(alert.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              alert.readStatus 
                                ? 'bg-slate-950/20 border-transparent text-slate-600 dark:text-slate-400' 
                                : 'bg-cyan-500/5 border-cyan-500/20 text-slate-200'
                            }`}
                          >
                            <p className="leading-relaxed">{alert.message}</p>
                            {!alert.readStatus && (
                              <span className="text-[9px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mt-1 block flex items-center gap-1">
                                <Check className="w-3 h-3" /> Mark as read
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button 
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-5 rounded-xl shadow-[0_0_20px_rgba(0,217,255,0.2)] text-xs flex gap-2"
              onClick={() => router.push('/search')}
            >
              <MapPin className="w-4 h-4" /> Book a Spot
            </Button>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Live / Upcoming Reservation Panel */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3.5">Live Session Tracker</h2>
              {activeBooking ? (
                <div className="bg-white dark:bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
                  
                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center shrink-0">
                        <div className="w-6 h-6 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(0,217,255,1)] animate-pulse" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase tracking-wider mb-1.5">
                          {activeBooking.status}
                        </div>
                        <h3 className="text-xl font-black text-slate-950 dark:text-white font-medium">{activeBooking.slot?.lot?.name || 'Active Lot'}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1.5 font-medium">
                          <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Spot {activeBooking.slot?.name || 'A1'} • {activeBooking.slot?.lot?.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-center bg-slate-950/50 p-4 rounded-2xl border border-slate-300 dark:border-white/5 w-full md:w-auto">
                      <div className="text-right">
                        <p className="text-[9px] text-slate-900 dark:text-slate-500 uppercase tracking-widest font-black mb-1">Session Countdown</p>
                        <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight font-mono">{countdownText}</p>
                      </div>
                      <div className="h-10 w-[1px] bg-white/10" />
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => router.push(`/ticket/${activeBooking.id}`)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 rounded-xl shadow-[0_0_10px_rgba(0,217,255,0.1)]"
                        >
                          Show QR Ticket
                        </Button>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${activeBooking.slot?.lot?.name}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center border border-white/15 hover:border-white/30 text-slate-950 dark:text-white font-medium font-bold text-xs px-4 rounded-xl transition-all"
                        >
                          <Navigation className="w-3.5 h-3.5 mr-1" /> Route
                        </a>
                        {/* Rating & Feedback Modal Trigger */}
                        <Button
                          onClick={() => setShowReviewModal(true)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-md mt-2"
                        >
                          Leave Review
                        </Button>
                        {showReviewModal && (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-96">
                              <h3 className="text-lg font-bold mb-4 text-slate-200">Rate Your Parking</h3>
                              <div className="flex space-x-1 mb-3">
                                {[1,2,3,4,5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-600'}`}
                                    onClick={() => setRating(star)}
                                  />
                                ))}
                              </div>
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                className="w-full h-24 bg-slate-800 text-slate-200 p-2 rounded-md focus:outline-none"
                              />
                              <div className="flex justify-end mt-4 space-x-2">
                                <Button variant="ghost" onClick={() => setShowReviewModal(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  onClick={async () => {
                                    try {
                                      await submitReview(activeBooking.id, activeBooking.slot?.lot?.id || '', rating, comment);
                                      setShowReviewModal(false);
                                    } catch (e) {
                                      console.error('Failed to submit review', e);
                                    }
                                  }}
                                >
                                  Submit
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-sm dark:bg-slate-900/40 border border-slate-300 dark:border-white/5 p-8 rounded-3xl text-center flex flex-col items-center justify-center min-h-[140px]">
                  <p className="text-slate-900 dark:text-slate-500 italic text-sm">No active or upcoming reservations found.</p>
                  <Button 
                    variant="link" 
                    onClick={() => router.push('/search')}
                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 font-bold text-xs mt-2 uppercase tracking-wider flex items-center gap-1"
                  >
                    Find parking spaces now <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </section>

            {/* Smart Availability Prediction Widget */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Smart Availability Prediction</h2>
                <div className="ml-auto px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-wider">AI Powered</div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 relative z-10">
                <div className="bg-slate-950/50 border border-slate-300 dark:border-white/5 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Peak Hours Today</p>
                  <p className="text-lg font-black text-slate-950 dark:text-white font-medium">4:00 PM - 7:00 PM</p>
                  <p className="text-xs text-rose-400 mt-1 font-medium">High congestion expected</p>
                </div>
                <div className="bg-slate-950/50 border border-slate-300 dark:border-white/5 p-4 rounded-2xl">
                  <p className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Lulu Mall (Favorite)</p>
                  <p className="text-lg font-black text-slate-950 dark:text-white font-medium">85% Full</p>
                  <p className="text-xs text-amber-400 mt-1 font-medium">Spots filling up fast</p>
                </div>
                <div className="bg-slate-950/50 border border-slate-300 dark:border-white/5 p-4 rounded-2xl border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <p className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">Recommendation</p>
                  <p className="text-lg font-black text-slate-950 dark:text-white font-medium">Book Now</p>
                  <p className="text-xs text-indigo-400 mt-1 font-medium">Probability of finding spot: 12%</p>
                </div>
              </div>
            </section>

            {/* Split analytics grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Usage Analytics */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-slate-200">
                      <BarChart3 className="w-4 h-4 text-purple-400" /> Driving Analytics
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">Your parking hours this week</p>
                  </div>
                  <select className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none text-slate-700 dark:text-slate-300">
                    <option>This Week</option>
                  </select>
                </div>
                
                <div className="flex-1 min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData}>
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                      />
                      <Bar dataKey="hours" fill="#00d9ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Saved Locations */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-6 text-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Top Indian Cities
                </h3>
                
                <div className="space-y-4">
                  {[
                    { name: 'Kochi (Cochin)', desc: 'Kerala, India', count: '5 Lots', color: 'emerald' },
                    { name: 'Bengaluru (Bangalore)', desc: 'Karnataka, India', count: '5 Lots', color: 'blue' },
                    { name: 'Mumbai (Bombay)', desc: 'Maharashtra, India', count: '5 Lots', color: 'purple' }
                  ].map((loc, i) => (
                    <div 
                      key={i} 
                      onClick={() => router.push('/search')}
                      className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-slate-300 dark:border-white/10"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xs text-slate-950 dark:text-white font-medium">{loc.name}</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">{loc.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-900 dark:text-slate-500">{loc.count}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: MY VEHICLES */}
        {activeTab === 'vehicles' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <div className="mb-6">
              <h2 className="text-xl font-black">Register License Plates</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Add your vehicles to enable AI gate scans and automatic checking.</p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Add vehicle form */}
            <form onSubmit={handleAddVehicle} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-2xl p-5 grid sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">License Plate Number</label>
                <input
                  type="text"
                  required
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  placeholder="KA-01-MJ-9999"
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Vehicle Size / Type</label>
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="suv">SUV / Luxury</option>
                  <option value="compact">Compact / Sedan</option>
                  <option value="truck">Truck / Van</option>
                  <option value="motorcycle">Two-Wheeler / Bike</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={addingCar}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs flex gap-1 justify-center items-center shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {addingCar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Add Vehicle</span>
              </button>
            </form>

            {/* Registered vehicle list */}
            <div className="space-y-3 pt-4">
              <span className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block">Registered Fleet ({vehicles.length})</span>
              {vehicles.length === 0 ? (
                <div className="bg-slate-900/20 border border-slate-300 dark:border-white/5 rounded-2xl p-6 text-center text-slate-900 dark:text-slate-500 italic text-xs">
                  No vehicles registered yet. Register a plate above for gate sensor testing.
                </div>
              ) : (
                vehicles.map((car) => (
                  <div key={car.id} className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/5 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                        <Car className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-sm font-mono font-black tracking-wider text-slate-200">{car.plateNumber}</span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-semibold uppercase tracking-wider mt-0.5">{car.type}</span>
                      </div>
                    </div>
                    
                    {activeBooking && (
                      <div className="mt-4 flex flex-col items-start space-y-2">
                        <Button
                          onClick={() => setShowReviewModal(true)}
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-md"
                        >
                          Leave Review
                        </Button>
                        {showReviewModal && (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-96">
                              <h3 className="text-lg font-bold mb-4 text-slate-200">Rate Your Parking</h3>
                              <div className="flex space-x-1 mb-3">
                                {[1,2,3,4,5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-amber-400 fill-current' : 'text-gray-600'}`}
                                    onClick={() => setRating(star)}
                                  />
                                ))}
                              </div>
                              <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                className="w-full h-24 bg-slate-800 text-slate-200 p-2 rounded-md focus:outline-none"
                              />
                              <div className="flex justify-end mt-4 space-x-2">
                                <Button
                                  variant="ghost"
                                  onClick={() => setShowReviewModal(false)}
                                >Cancel</Button>
                                <Button
                                  onClick={async () => {
                                    try {
                                      await submitReview(
                                        activeBooking.id,
                                        activeBooking.slot?.lot?.id || '',
                                        rating,
                                        comment
                                      );
                                      setShowReviewModal(false);
                                    } catch (e) {
                                      console.error('Failed to submit review', e);
                                    }
                                  }}
                                >Submit</Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleRemoveVehicle(car.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: BOOKING HISTORY LOGS */}
        {activeTab === 'history' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <h2 className="text-xl font-black">Booking History Logs</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Review active, past checkouts, and cancelled parking slots.</p>
            </div>

            <div className="space-y-3.5">
              {bookings.length === 0 ? (
                <div className="bg-slate-900/20 border border-slate-300 dark:border-white/5 rounded-2xl p-8 text-center text-slate-900 dark:text-slate-500 italic text-xs">
                  No reservation history found.
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                          getStatusColor(b.status)
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-900 dark:text-slate-500 font-bold uppercase">ID: {b.id.substring(0, 8)}</span>
                      </div>
                      
                      <h3 className="text-base font-black text-slate-950 dark:text-white font-medium">{b.slot?.lot?.name || 'Smart Lot'}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Slot {b.slot?.name || 'A1'} • {b.slot?.lot?.location || 'Kochi, Kerala'}</p>
                      
                      <p className="text-[10px] text-slate-900 dark:text-slate-500 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(b.startTime).toLocaleString('en-IN')} - {new Date(b.endTime).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end shrink-0 border-t sm:border-0 border-slate-300 dark:border-white/5 pt-3 sm:pt-0">
                      <div>
                        <span className="text-[10px] text-slate-900 dark:text-slate-500 block uppercase font-bold tracking-wider mb-0.5">Amount Paid</span>
                        <span className="text-base font-black text-cyan-600 dark:text-cyan-400">{formatCurrency(b.amount)}</span>
                      </div>

                      <div className="flex gap-2 mt-auto pt-2.5">
                        {b.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelReservation(b.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all"
                          >
                            Cancel
                          </button>
                        )}
                        {b.status === 'COMPLETED' && (
                          reviewedBookings[b.id] ? (
                            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                              Reviewed
                            </div>
                          ) : (
                            <Button
                              onClick={() => setReviewTarget(b)}
                              className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 border border-amber-500/25 hover:border-amber-500/40 font-bold text-xs px-3.5 rounded-lg flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Rate & Feedback
                            </Button>
                          )
                        )}
                        {(b.status === 'ACTIVE' || b.status === 'PENDING') && (
                          <Button 
                            onClick={() => router.push(`/ticket/${b.id}`)}
                            className="bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs px-3.5 rounded-lg"
                          >
                            Show QR Code
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-black mb-4">My Reviews</h2>
            {reviewsLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-spin" />
              </div>
            )}
            {!reviewsLoading && myReviews.length === 0 && (
              <p className="text-slate-900 dark:text-slate-500 italic">You have not submitted any reviews yet.</p>
            )}
            <div className="space-y-4">
              {myReviews.map((rev) => (
                <div key={rev.id} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 fill-current text-amber-400" />
                    <span className="font-bold text-slate-200">{rev.rating} / 5</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">{rev.comment}</p>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span>{rev.lot?.name || 'Parking Lot'}</span>
                    <span className="mx-2">·</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md space-y-6"
          >
            <div>
              <h2 className="text-xl font-black">User Preferences</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Configure user role setups and login caches.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Name</span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{user?.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Email Address</span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{user?.email}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">User Access Level</span>
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">{user?.role}</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-300 dark:border-white/10 rounded-2xl p-5 bg-rose-500/5 border-rose-500/20 space-y-3">
              <h3 className="text-sm font-bold text-rose-400">Exit Driver Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Log out of your current session. You will need to log back in to review live reservation states.</p>
              <Button onClick={handleLogout} className="bg-rose-600 hover:bg-rose-500 text-slate-950 dark:text-white font-medium font-bold text-xs py-4.5 rounded-xl shadow-lg shadow-rose-500/10">
                Sign Out Account
              </Button>
            </div>
          </motion.div>
        )}

      </main>

      {reviewTarget && (
        <ReviewDialog
          isOpen={!!reviewTarget}
          bookingId={reviewTarget.id}
          lotId={reviewTarget.slot?.lot?.id || ''}
          lotName={reviewTarget.slot?.lot?.name || 'Parking Lot'}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleSubmitBookingReview}
        />
      )}

    </div>
  );
}
