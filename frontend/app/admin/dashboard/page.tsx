'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, MapPin, Settings, DollarSign, Calendar, Clock, 
  ChevronRight, BarChart3, Plus, LogOut, Loader2, Sparkles, SlidersHorizontal, Grid, AlertTriangle, ShieldCheck, Check, Trash, Activity, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { useRouter } from 'next/navigation';
import { getProfile, logout } from '@/services/auth';
import ThemeToggle from '@/components/ThemeToggle';
import { getAdminMetrics, getRevenueReport, createLocation, updateLocation, addPricingRule, getPricingRules, getAllBookings, updateBookingStatus } from '@/services/admin';
import { getSlots } from '@/services/booking';
import { useSearchStore } from '@/store/searchStore';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // States for stats and metrics
  const [metrics, setMetrics] = useState<any | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  // Lot selector and slots for slot manager
  const { results, fetchResults } = useSearchStore();
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Pricing rules builder states
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [newMultiplier, setNewMultiplier] = useState('1.5');
  const [newStartTime, setNewStartTime] = useState('17:00');
  const [newEndTime, setNewEndTime] = useState('21:00');
  const [addingRule, setAddingRule] = useState(false);

  // Lot builder states
  const [newLotName, setNewLotName] = useState('');
  const [newLotAddress, setNewLotAddress] = useState('');
  const [newLotPricing, setNewLotPricing] = useState('50');
  const [newLotSlots, setNewLotSlots] = useState('20');
  const [newLotCoordinates, setNewLotCoordinates] = useState('{"lat":9.9312,"lng":76.2673}');
  const [addingLot, setAddingLot] = useState(false);
  const [editLotId, setEditLotId] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch admin logs and data on mount
  const loadAdminData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      // Verify admin role
      const profile = await getProfile();
      if (profile.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      setAdminUser(profile);

      // Load metrics, revenue logs, all bookings, and search lots
      const [adminMetrics, revLog, allRes] = await Promise.all([
        getAdminMetrics(),
        getRevenueReport(),
        getAllBookings(),
        fetchResults(),
      ]);

      setMetrics(adminMetrics);
      setRevenueData(revLog);
      setBookings(allRes);
    } catch (err: any) {
      console.error('Failed to load admin workspace:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Update selectedLotId automatically when lots search results finish
  useEffect(() => {
    if (results.length > 0 && !selectedLotId) {
      setSelectedLotId(results[0].id);
    }
  }, [results]);

  // Load slot layout and pricing rules whenever selected lot changes
  useEffect(() => {
    if (!selectedLotId) return;

    async function loadLotConfigs() {
      try {
        setLoadingSlots(true);
        const [slotData, rules] = await Promise.all([
          getSlots(selectedLotId),
          getPricingRules(selectedLotId),
        ]);
        setSlots(slotData);
        setPricingRules(rules);
      } catch (err) {
        console.error('Failed to load slots/rules for lot:', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadLotConfigs();
  }, [selectedLotId]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Add a Peak Pricing rule
  const handleAddPricingRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId) return;
    setAddingRule(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const rule = await addPricingRule(
        selectedLotId,
        parseFloat(newMultiplier),
        newStartTime,
        newEndTime
      );
      setPricingRules((prev) => [rule, ...prev]);
      setSuccessMsg('Dynamic pricing multiplier added successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add pricing rule.');
    } finally {
      setAddingRule(false);
    }
  };

  // Create or Edit a Parking Lot location
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLotName || !newLotAddress || !newLotPricing) return;
    if (!editLotId && !newLotSlots) return;

    setAddingLot(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (editLotId) {
        const lot = await updateLocation(
          editLotId,
          {
            name: newLotName,
            location: newLotAddress,
            pricing: parseFloat(newLotPricing),
            coordinates: newLotCoordinates,
          }
        );
        setSuccessMsg(`Location "${lot.name}" updated successfully.`);
      } else {
        const lot = await createLocation(
          newLotName,
          newLotAddress,
          parseFloat(newLotPricing),
          parseInt(newLotSlots, 10),
          newLotCoordinates
        );
        setSuccessMsg(`Location "${lot.name}" with ${newLotSlots} slots created.`);
      }
      
      // Reset builder inputs
      setNewLotName('');
      setNewLotAddress('');
      setNewLotPricing('50');
      setNewLotSlots('20');
      setNewLotCoordinates('{"lat":9.9312,"lng":76.2673}');
      setEditLotId('');
      
      // Reload lot lists
      await fetchResults();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save parking lot.');
    } finally {
      setAddingLot(false);
    }
  };

  const handleSelectLotForEdit = (lotId: string) => {
    setEditLotId(lotId);
    if (lotId) {
      const lot = results.find(r => r.id === lotId);
      if (lot) {
        setNewLotName(lot.name);
        setNewLotAddress(lot.location);
        setNewLotPricing(lot.basePricePerHour?.toString() || '50');
        setNewLotSlots(lot._count?.slots?.toString() || '0');
        setNewLotCoordinates(lot.coordinates || '{"lat":9.9312,"lng":76.2673}');
      }
    } else {
      setNewLotName('');
      setNewLotAddress('');
      setNewLotPricing('50');
      setNewLotSlots('20');
      setNewLotCoordinates('{"lat":9.9312,"lng":76.2673}');
    }
  };

  // Toggle booking approvals/cancellations
  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map(b => b.id === bookingId ? { ...b, status } : b)
      );
      setSuccessMsg(`Booking status successfully marked as ${status}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Status update failed.');
    }
  };

  const currentLotDetails = results.find(r => r.id === selectedLotId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Syncing Admin Workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex selection:bg-cyan-500/30 relative overflow-hidden">
      
      {/* Sidebar background ambient */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-300 dark:border-white/10 bg-white shadow-sm dark:bg-slate-950/60 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen z-20 shrink-0">
        <div className="flex items-center gap-2.5 mb-12 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-slate-950 dark:text-white font-medium shadow-[0_0_15px_rgba(0,217,255,0.4)] animate-pulse">
            PF
          </div>
          <span className="text-xl font-black tracking-tight">ParkFlow <span className="text-cyan-600 dark:text-cyan-400 text-xs uppercase block tracking-wider font-bold">Admin Panel</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Analytics', isPage: false },
            { id: 'users', icon: Users, label: 'User Management', isPage: true, path: '/admin/users' },
            { id: 'charts', icon: BarChart3, label: 'Analytics Charts', isPage: true, path: '/admin/analytics' },
            { id: 'slots', icon: Grid, label: 'Slots Config', isPage: false },
            { id: 'pricing', icon: Settings, label: 'Pricing Engine', isPage: false },
            { id: 'builder', icon: Plus, label: 'Lot Builder', isPage: false },
            { id: 'bookings', icon: Calendar, label: 'Audits logs', isPage: false },
            { id: 'settings', icon: Settings, label: 'Settings', isPage: true, path: '/admin/settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.isPage) {
                  router.push(item.path!);
                } else {
                  setActiveTab(item.id);
                  setErrorMsg('');
                  setSuccessMsg('');
                }
              }}
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

        <div className="mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 font-semibold hover:bg-rose-500/5 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" /> Exit Console
          </button>
        </div>
      </aside>

      {/* Main content body */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black mb-1">Control Console</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">System Auditor: {adminUser?.name || 'Administrator'}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs font-bold text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Operational Live
            </div>
          </div>
        </header>

        {/* Messaging alerts */}
        {errorMsg && (
          <div className="p-3 mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: OPERATIONAL ANALYTICS */}
        {activeTab === 'overview' && metrics && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Overview Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Revenue */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 p-6 rounded-3xl relative overflow-hidden">
                <DollarSign className="absolute top-4 right-4 w-12 h-12 text-cyan-600 dark:text-cyan-400/10" />
                <span className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1.5">Gross Revenues</span>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white font-medium">{formatCurrency(metrics.totalRevenue || 0)}</h3>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">+14% vs last week</span>
              </div>

              {/* Booking audits */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 p-6 rounded-3xl relative overflow-hidden">
                <Calendar className="absolute top-4 right-4 w-12 h-12 text-cyan-600 dark:text-cyan-400/10" />
                <span className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1.5">System Bookings</span>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white font-medium">{metrics.totalBookings || 84}</h3>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block mt-1">{metrics.activeBookings || 6} active now</span>
              </div>

              {/* Occupancy */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 p-6 rounded-3xl relative overflow-hidden">
                <Grid className="absolute top-4 right-4 w-12 h-12 text-cyan-600 dark:text-cyan-400/10" />
                <span className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1.5">Average Occupancy</span>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white font-medium">{(metrics.occupancyRate || 42.5).toFixed(1)}%</h3>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1 rounded-full mt-2.5 overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${metrics.occupancyRate || 42.5}%` }} />
                </div>
              </div>

              {/* Locations */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 p-6 rounded-3xl relative overflow-hidden">
                <MapPin className="absolute top-4 right-4 w-12 h-12 text-cyan-600 dark:text-cyan-400/10" />
                <span className="text-[10px] text-slate-900 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1.5">Managed Lots</span>
                <h3 className="text-3xl font-black text-slate-950 dark:text-white font-medium">{metrics.totalLots || 20}</h3>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold block mt-1">3 major metro cities</span>
              </div>

            </div>

            {/* AI Insights & Predictions */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">AI Predictive Insights</h3>
                <div className="ml-auto px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-wider">ParkFlow Brain</div>
              </div>
              <div className="grid sm:grid-cols-3 gap-6 relative z-10">
                <div className="bg-slate-950/50 border border-slate-300 dark:border-white/5 p-5 rounded-2xl">
                  <p className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">Demand Forecast</p>
                  <p className="text-lg font-black text-slate-950 dark:text-white font-medium">Surge Expected</p>
                  <p className="text-xs text-rose-400 mt-1 font-medium leading-relaxed">Model predicts 25% increase in demand at Lulu Mall between 4PM-8PM.</p>
                </div>
                <div className="bg-slate-950/50 border border-slate-300 dark:border-white/5 p-5 rounded-2xl">
                  <p className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">Pricing Optimization</p>
                  <p className="text-lg font-black text-slate-950 dark:text-white font-medium">Underpriced: 3 Lots</p>
                  <p className="text-xs text-amber-400 mt-1 font-medium leading-relaxed">Consider enabling dynamic 1.5x multiplier for Kozhikode Beach lots.</p>
                </div>
                <div className="bg-slate-950/50 border border-slate-300 dark:border-white/5 p-5 rounded-2xl border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <p className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">Anomaly Detection</p>
                  <p className="text-lg font-black text-slate-950 dark:text-white font-medium">1 Sensor Alert</p>
                  <p className="text-xs text-indigo-400 mt-1 font-medium leading-relaxed">Slot A4 at MG Road reporting false occupancy for &gt; 24hrs.</p>
                </div>
              </div>
            </div>

            {/* Split charts grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Gross revenue report bar chart */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl p-6 flex flex-col min-h-[300px]">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-slate-700 dark:text-slate-300">Revenue Performance by Lot</h3>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickFormatter={(v) => v.slice(0, 10) + '..'} />
                      <YAxis stroke="#64748b" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Bar dataKey="revenue" fill="#00d9ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Action logs */}
              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-slate-700 dark:text-slate-300">Operational Log</h3>
                <div className="space-y-4">
                  {metrics.recentActivity.map((act: any) => (
                    <div key={act.id} className="border-l-2 border-cyan-400 pl-4 py-1">
                      <span className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block">{act.action}</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal mt-0.5">{act.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: SLOT MANAGER */}
        {activeTab === 'slots' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-black">Parking Slots Manager</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Review live sensor occupation states and block slots for maintenance.</p>
              </div>

              {/* Lot selector dropdown */}
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs font-bold rounded-xl px-4 py-3 outline-none text-cyan-600 dark:text-cyan-400"
              >
                {results.map(lot => (
                  <option key={lot.id} value={lot.id}>{lot.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider">Visual Floor Map</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{slots.length} Total slots mapped</span>
              </div>

              {loadingSlots ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Querying live sensor values...</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                  {slots.map(slot => {
                    const isOccupied = slot.status === 'BOOKED';
                    const isMaintenance = slot.status === 'MAINTENANCE';
                    let statusLabel = 'Available';
                    let style = 'border-slate-800 text-slate-600 dark:text-slate-400 hover:border-white/20';
                    
                    if (isOccupied) {
                      statusLabel = 'Occupied';
                      style = 'border-rose-500/20 bg-rose-500/5 text-rose-400';
                    } else if (isMaintenance) {
                      statusLabel = 'Blocked';
                      style = 'border-slate-950 bg-slate-100 dark:bg-slate-950 text-slate-600';
                    } else {
                      style = 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400';
                    }

                    return (
                      <div 
                        key={slot.id} 
                        className={`border rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1.5 transition-all ${style}`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">{slot.name}</span>
                        <span className="text-[8px] font-black uppercase tracking-wider block">{statusLabel}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: DYNAMIC PRICING ENGINE */}
        {activeTab === 'pricing' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Left side: Rules Editor */}
            <div className="md:col-span-1 space-y-6">
              <div>
                <h2 className="text-xl font-black">Pricing Rules</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Configure multiplier weights dynamically to auto-adjust rates during peak hours.</p>
              </div>

              <form onSubmit={handleAddPricingRule} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Select Target Lot</label>
                  <select
                    value={selectedLotId}
                    onChange={(e) => setSelectedLotId(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    {results.map(lot => (
                      <option key={lot.id} value={lot.id}>{lot.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Price Multiplier (e.g. 1.5x)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    required
                    value={newMultiplier}
                    onChange={(e) => setNewMultiplier(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Start Peak Hour</label>
                    <input
                      type="text"
                      placeholder="17:00"
                      required
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">End Peak Hour</label>
                    <input
                      type="text"
                      placeholder="21:00"
                      required
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={addingRule}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs flex gap-1 justify-center items-center shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  {addingRule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Add Pricing Rule</span>
                </button>
              </form>
            </div>

            {/* Right side: active rule lists */}
            <div className="md:col-span-2 space-y-4">
              <span className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block">Active Rules List ({pricingRules.length})</span>
              {pricingRules.length === 0 ? (
                <div className="bg-slate-900/20 border border-slate-300 dark:border-white/5 rounded-2xl p-8 text-center text-slate-900 dark:text-slate-500 italic text-xs">
                  No pricing overrides defined. Using standard hourly rates.
                </div>
              ) : (
                <div className="space-y-3">
                  {pricingRules.map((rule) => (
                    <div key={rule.id} className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 p-4 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/5 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                          {rule.multiplier}x
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Peak pricing multiplier</span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5"><Clock className="w-3.5 h-3.5" /> Time frame: {rule.startTime} to {rule.endTime}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase">Multiplier Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: LOT BUILDER */}
        {activeTab === 'builder' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black">Location Setup</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Register new facilities or edit existing ones.</p>
              </div>
              
              <div className="w-64">
                <select
                  value={editLotId}
                  onChange={(e) => handleSelectLotForEdit(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/15 focus:border-cyan-500/50 rounded-xl py-2 px-3 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">-- Create New Hub --</option>
                  {results.map(lot => (
                    <option key={lot.id} value={lot.id}>Edit: {lot.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleSaveLocation} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-3xl p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Parking Lot Name</label>
                  <input
                    type="text"
                    required
                    value={newLotName}
                    onChange={(e) => setNewLotName(e.target.value)}
                    placeholder="Grand Mall Multi-Level Lot"
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Address / City Location</label>
                  <input
                    type="text"
                    required
                    value={newLotAddress}
                    onChange={(e) => setNewLotAddress(e.target.value)}
                    placeholder="Bandra Kurla Complex, Mumbai, 400051"
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Base Hourly Pricing (INR)</label>
                  <input
                    type="number"
                    required
                    value={newLotPricing}
                    onChange={(e) => setNewLotPricing(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Total Slot Capacity</label>
                  <input
                    type="number"
                    max="100"
                    required={!editLotId}
                    disabled={!!editLotId}
                    value={newLotSlots}
                    onChange={(e) => setNewLotSlots(e.target.value)}
                    title={editLotId ? "Slot capacity cannot be edited directly for existing hubs" : ""}
                    className={`w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white font-medium focus:outline-none ${editLotId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider block mb-2">Geographical Coordinates (JSON)</label>
                  <input
                    type="text"
                    required
                    value={newLotCoordinates}
                    onChange={(e) => setNewLotCoordinates(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-white/15 focus:border-cyan-500/50 rounded-xl py-2.5 px-3.5 text-xs text-slate-950 dark:text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={addingLot}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs flex gap-1 justify-center items-center shadow-lg shadow-cyan-500/10 mt-6 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {addingLot ? <Loader2 className="w-4 h-4 animate-spin" /> : (editLotId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                <span>{editLotId ? 'Save Changes' : 'Create Facilities Location'}</span>
              </button>
            </form>
          </motion.div>
        )}

        {/* TAB 5: SYSTEM-WIDE AUDIT LOGS */}
        {activeTab === 'bookings' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-black">Audit Reservations logs</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Review system reservations and manage cancellations or check-in overrides manually.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-300 dark:border-white/5 bg-white shadow-sm dark:bg-slate-900/60 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Auditor Table</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-500">{bookings.length} reservations logged</span>
              </div>

              {bookings.length === 0 ? (
                <div className="text-slate-900 dark:text-slate-500 italic py-12 text-center text-xs">No user bookings in database. Check-ins simulate dynamically in customer portals.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-300 dark:border-white/5 text-slate-900 dark:text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-4">ID</th>
                        <th className="p-4">Customer Email</th>
                        <th className="p-4">Facilities / Spot</th>
                        <th className="p-4">Pricing</th>
                        <th className="p-4">Schedule Frame</th>
                        <th className="p-4">Access Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-600 dark:text-slate-400">{booking.id.substring(0, 8)}</td>
                          <td className="p-4 font-medium text-slate-200">{booking.user?.email || 'customer@example.com'}</td>
                          <td className="p-4 text-slate-700 dark:text-slate-300">
                            {booking.slot?.lot?.name} • <span className="uppercase text-cyan-600 dark:text-cyan-400 font-bold">{booking.slot?.name}</span>
                          </td>
                          <td className="p-4 text-cyan-600 dark:text-cyan-400 font-black">{formatCurrency(booking.amount)}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                            {new Date(booking.startTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })} to {new Date(booking.endTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full border text-[8px] font-black uppercase">
                              {booking.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'ACTIVE')}
                                  className="text-[10px] text-emerald-400 hover:underline font-bold px-2 py-1"
                                >
                                  Approve Checkin
                                </button>
                                <button
                                  onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                                  className="text-[10px] text-rose-400 hover:underline font-bold px-2 py-1"
                                >
                                  Force Cancel
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </main>

    </div>
  );
}
