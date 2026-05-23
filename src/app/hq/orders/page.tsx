'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { X, ChevronRight, Clock, ChefHat, Truck, Check, Eye, Phone, MapPin, MessageSquare, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type OrderStatus = 'new' | 'confirmed' | 'sent_to_kitchen' | 'on_route' | 'delivered' | 'cancelled';

const COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: 'new', label: 'New', color: 'border-amber-500/40' },
  { status: 'confirmed', label: 'Confirmed', color: 'border-blue-500/40' },
  { status: 'sent_to_kitchen', label: 'In Kitchen', color: 'border-purple-500/40' },
  { status: 'on_route', label: 'On Route', color: 'border-cyan-500/40' },
  { status: 'delivered', label: 'Done', color: 'border-green-500/40' },
];

const statusBadge: Record<string, string> = {
  new: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  sent_to_kitchen: 'bg-purple-500/20 text-purple-400',
  on_route: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const nextStatus: Partial<Record<OrderStatus, { label: string; status: OrderStatus; icon: React.ReactNode }>> = {
  new: { label: 'Confirm', status: 'confirmed', icon: <Check className="w-3.5 h-3.5" /> },
  confirmed: { label: 'Send to Kitchen', status: 'sent_to_kitchen', icon: <ChefHat className="w-3.5 h-3.5" /> },
  sent_to_kitchen: { label: 'Out for Delivery', status: 'on_route', icon: <Truck className="w-3.5 h-3.5" /> },
  on_route: { label: 'Mark Delivered', status: 'delivered', icon: <Check className="w-3.5 h-3.5" /> },
};

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

function playChime() {
  const audio = new Audio('/chime.mp3'); // User will need to provide this file, or we can use a base64 inline later.
  audio.volume = 0.5;
  audio.play().catch(() => { /* interaction required */ });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'delivery' | 'pickup' | 'walk-in'>('all');
  const [kdsMode, setKdsMode] = useState(false);
  
  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime order updates
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        playChime();
        fetchOrders(); // Re-fetch to get nested items
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const advanceOrder = async (id: string, status: OrderStatus, currentHistory: any[]) => {
    try {
      await fetch('/api/admin/orders/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, currentHistory }),
      });
    } catch (e) {
      console.error('Failed to advance order', e);
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedId) ?? null;
  const filtered = orders.filter(o => filter === 'all' || o.type === filter);

  if (loading) return <div className="text-white p-8">Loading live orders...</div>;

  return (
    <div className={`space-y-6 ${kdsMode ? 'max-w-none' : 'max-w-7xl'}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Live Orders</h1>
          <span className="text-slate-500 text-sm ml-2">{orders.filter(o => !['delivered','cancelled'].includes(o.status)).length} active</span>
        </div>
        
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={() => setKdsMode(!kdsMode)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 border ${
              kdsMode ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
            <Eye className="w-3.5 h-3.5" /> KDS Mode
          </button>

          {(['all', 'delivery', 'pickup', 'walk-in'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold rounded-full capitalize transition-colors border ${
                filter === f ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board - High Density */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {COLUMNS.map(col => {
          const colOrders = filtered.filter(o => o.status === col.status);
          
          return (
            <div key={col.status} className={`min-w-[300px] flex-1 shrink-0 bg-slate-900/50 backdrop-blur-xl border-t-2 ${col.color} border-l border-r border-b border-slate-800 rounded-xl flex flex-col max-h-[80vh] snap-center`}>
              {/* Sticky Header */}
              <div className="sticky top-0 p-3 bg-slate-900/90 backdrop-blur-md z-10 rounded-t-xl border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{col.label}</span>
                <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  {colOrders.length}
                </span>
              </div>
              
              {/* Scrollable Column Content */}
              <div className="p-3 space-y-3 overflow-y-auto flex-1">
                <AnimatePresence>
                  {colOrders.map(order => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      kdsMode={kdsMode}
                      onClick={() => setSelectedId(order.id)} 
                      onAdvance={() => nextStatus[order.status as OrderStatus] && advanceOrder(order.id, nextStatus[order.status as OrderStatus]!.status, order.status_history)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Order Detail Drawer ─── */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-700 z-50 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
                <div>
                  <p className="text-slate-400 text-xs font-mono">#{selectedOrder.id.slice(0, 8)}</p>
                  <h2 className="text-white font-bold text-lg mt-0.5">{selectedOrder.customer_name}</h2>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Status + type badges */}
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${statusBadge[selectedOrder.status]}`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 capitalize">
                    {selectedOrder.type}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-400">
                    {timeAgo(selectedOrder.created_at)}
                  </span>
                </div>

                {/* Customer info */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Customer</p>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    {selectedOrder.customer_phone}
                  </div>
                  {selectedOrder.address && (
                    <div className="flex items-start gap-2 text-slate-300 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      {selectedOrder.address}
                    </div>
                  )}
                </div>

                {/* Order-level notes */}
                {selectedOrder.notes && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-amber-400 mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Note to kitchen
                    </p>
                    <p className="text-amber-200 text-sm leading-relaxed">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Order items */}
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Items</p>
                  <div className="space-y-4">
                    {(selectedOrder.order_items || []).map((item: any, i: number) => (
                      <div key={i} className="bg-slate-800 rounded-xl p-4">
                        {/* Item name + quantity */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-bold text-sm shrink-0">{item.quantity}×</span>
                            <span className="text-white font-semibold text-sm">{item.name}</span>
                          </div>
                          <span className="text-slate-300 font-bold text-sm shrink-0">€{Number(item.price).toFixed(2)}</span>
                        </div>

                        {/* Customizations (size, add-ons, removed ingredients) */}
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="mt-2 space-y-1 pl-6">
                            {item.customizations.map((c: { name: string; price: number }, ci: number) => (
                              <div key={ci} className="flex items-center justify-between text-xs">
                                <span className={`font-medium ${c.name.startsWith('- No') ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {c.name}
                                </span>
                                {c.price > 0 && (
                                  <span className="text-slate-400">+€{c.price.toFixed(2)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Per-item special instructions */}
                        {item.notes && (
                          <div className="mt-2 pl-6 flex items-start gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-amber-300 text-xs italic">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-slate-800 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Total</p>
                  {selectedOrder.delivery_fee > 0 && (
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Delivery fee</span>
                      <span>€{Number(selectedOrder.delivery_fee).toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.service_fee > 0 && (
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Service fee</span>
                      <span>€{Number(selectedOrder.service_fee).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-700">
                    <span>Total</span>
                    <span>€{Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Status history */}
                {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3">Timeline</p>
                    <div className="space-y-2">
                      {[...selectedOrder.status_history].reverse().map((h: { status: string; at: string }, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 capitalize font-medium">{h.status.replace('_', ' ')}</span>
                          <span className="text-slate-500">{new Date(h.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Advance action */}
              {nextStatus[selectedOrder.status as OrderStatus] && (
                <div className="shrink-0 px-6 py-5 border-t border-slate-800 bg-slate-900">
                  <button
                    onClick={() => {
                      const next = nextStatus[selectedOrder.status as OrderStatus]!;
                      advanceOrder(selectedOrder.id, next.status, selectedOrder.status_history);
                      setSelectedId(null);
                    }}
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {nextStatus[selectedOrder.status as OrderStatus]!.icon}
                    {nextStatus[selectedOrder.status as OrderStatus]!.label}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, kdsMode, onClick, onAdvance }: { order: any; kdsMode: boolean; onClick: () => void; onAdvance: () => void; }) {
  const advance = nextStatus[order.status as OrderStatus];
  
  if (kdsMode) {
    // KDS Mode: Optimized for chefs reading from a distance
    return (
      <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-black border-2 border-slate-700 rounded-xl p-5 cursor-pointer hover:border-slate-500 shadow-2xl"
        onClick={onClick}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-yellow-400 font-mono text-xl font-bold">#{order.id.slice(0,6)}</span>
          <span className="text-white font-bold text-lg">{timeAgo(order.created_at)}</span>
        </div>
        <div className="space-y-2 mb-6">
          {(order.order_items || []).map((item: any, i: number) => (
            <div key={i} className="text-white text-xl font-bold leading-tight">
              <span className="text-purple-400 mr-2">{item.quantity}x</span>{item.name}
              {item.notes && <div className="text-red-400 text-sm ml-8">*** {item.notes} ***</div>}
            </div>
          ))}
        </div>
        {advance && (
          <button onClick={(e) => { e.stopPropagation(); onAdvance(); }}
            className="w-full py-4 text-xl font-bold rounded-lg bg-primary text-white active:scale-95 transition-transform uppercase">
            {advance.label}
          </button>
        )}
      </motion.div>
    );
  }

  // Standard Mode
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors shadow-lg"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-xs font-mono font-bold">#{order.id.slice(0,8)}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusBadge[order.status]}`}>
          {order.type}
        </span>
      </div>
      <p className="text-white font-bold text-sm mb-0.5">{order.customer_name}</p>
      <div className="text-slate-400 text-xs space-y-1 mt-3">
        {(order.order_items || []).map((i: any, idx: number) => (
          <div key={idx} className="truncate">{i.quantity}x {i.name}</div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700/50">
        <span className="text-slate-300 font-bold text-sm">€{order.total}</span>
        <span className="text-slate-500 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />{timeAgo(order.created_at)}
        </span>
      </div>
      {advance && (
        <button onClick={e => { e.stopPropagation(); onAdvance(); }}
          className="mt-3 w-full py-2 text-[11px] font-bold rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors flex items-center justify-center gap-1">
          {advance.icon} {advance.label} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}
