'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, ShoppingBag, CalendarDays, ChefHat, Clock, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const statusColor: Record<string, string> = {
  new: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  sent_to_kitchen: 'bg-purple-500/20 text-purple-400',
  on_route: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const statusLabel: Record<string, string> = {
  new: 'New',
  confirmed: 'Confirmed',
  sent_to_kitchen: 'In Kitchen',
  on_route: 'On Route',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

function StatCard({ label, value, icon, sub }: { label: string; value: string; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
      <div className="p-3 bg-slate-800 rounded-xl shrink-0 relative z-10">{icon}</div>
      <div className="relative z-10">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// Generates a mock 7-day revenue trend based on the live today total + static history
// In a fully live app, this would query historical orders
function generateTrendData(todayRevenue: number) {
  const data = [];
  const now = new Date();
  for (let i = 6; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: Math.floor(Math.random() * 800) + 400, // mock historical
    });
  }
  data.push({ name: 'Today', revenue: todayRevenue });
  return data;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveStats = useCallback(async () => {
    // We only need basic order data for the dashboard (not all items) to keep it fast
    const { data: oData } = await supabase.from('orders').select('id, created_at, customer_name, type, status, total').order('created_at', { ascending: false }).limit(50);
    const { data: rData } = await supabase.from('reservations').select('*').order('time', { ascending: true });
    
    if (oData) setOrders(oData);
    if (rData) setReservations(rData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLiveStats();

    const channel = supabase.channel('dashboard-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchLiveStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        fetchLiveStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchLiveStats]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_at.startsWith(todayStr));
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const kitchenOrders = orders.filter(o => o.status === 'sent_to_kitchen').length;
  const todayReservations = reservations.filter(r => r.date === todayStr);

  const trendData = useMemo(() => generateTrendData(todayRevenue), [todayRevenue]);

  if (loading) return <div className="text-white p-8">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Operations HQ</h1>
        <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString('en-FI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Revenue" value={`€${todayRevenue.toFixed(2)}`} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} sub={`${todayOrders.length} orders`} />
        <StatCard label="Kitchen Queue" value={String(kitchenOrders)} icon={<ChefHat className="w-5 h-5 text-purple-400" />} sub="awaiting service" />
        <StatCard label="Pending Res" value={String(pendingReservations)} icon={<CalendarDays className="w-5 h-5 text-amber-400" />} sub="need confirmation" />
        <StatCard label="Today's Covers" value={String(todayReservations.length)} icon={<CheckCircle2 className="w-5 h-5 text-cyan-400" />} sub="reservations today" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Trend & Orders */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Trend Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Revenue Trend (7 Days)
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981' }}
                    formatter={(value: any) => [`€${Number(value).toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-400" /> Recent Live Orders
            </h2>
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-xs font-bold text-slate-500 shrink-0 uppercase tracking-widest">{order.id.slice(0,6)}</div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{order.customer_name}</p>
                      <p className="text-slate-500 text-xs capitalize">{order.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-1 w-16 justify-end">
                      {timeAgo(order.created_at)}
                    </span>
                    <span className="text-white text-sm font-bold w-12 text-right">€{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Reservations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" /> Today's Bookings
          </h2>
          {todayReservations.length === 0 ? (
            <p className="text-slate-500 text-sm">No reservations for today.</p>
          ) : (
            <div className="space-y-3">
              {todayReservations.map(r => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0">
                  <div>
                    <p className="text-white text-sm font-medium">{r.guest_name}</p>
                    <p className="text-slate-500 text-xs">{r.party_size} guests · {r.time}</p>
                  </div>
                  <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-full ${
                    r.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    r.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    r.status === 'seated' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
