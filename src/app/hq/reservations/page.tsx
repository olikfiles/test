'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, X, UserCheck, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ReservationStatus = 'pending' | 'confirmed' | 'declined' | 'seated' | 'completed' | 'no_show';

const statusBadge: Record<ReservationStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-green-500/20 text-green-400',
  declined: 'bg-red-500/20 text-red-400',
  seated: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-slate-500/20 text-slate-400',
  no_show: 'bg-rose-500/20 text-rose-400',
};

const statusLabel: Record<ReservationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  declined: 'Declined',
  seated: 'Seated',
  completed: 'Completed',
  no_show: 'No Show',
};

function formatDate(d: string) {
  const dt = new Date(d + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (dt.getTime() === today.getTime()) return 'Today';
  if (dt.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return dt.toLocaleDateString('en-FI', { weekday: 'short', month: 'short', day: 'numeric' });
}

function playChime() {
  const audio = new Audio('/chime.mp3'); 
  audio.volume = 0.5;
  audio.play().catch(() => {});
}

// ─── Reservation Row ────────────────────────────────────────────────────────────
function ReservationRow({ r, onAction }: {
  r: any;
  onAction: (id: string, action: 'confirm' | 'decline' | 'seat' | 'no_show', reason?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => { if(!isDeclining) setExpanded(p => !p); }}
      >
        <div className="shrink-0 text-center w-16">
          <p className="text-xs font-bold text-slate-400">{formatDate(r.date)}</p>
          <p className="text-white font-bold text-sm">{r.time}</p>
        </div>
        <div className="w-px h-8 bg-slate-700 shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{r.guest_name}</p>
          <p className="text-slate-400 text-xs">{r.party_size} guests{r.occasion ? ` · ${r.occasion}` : ''}</p>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${statusBadge[r.status as ReservationStatus]}`}>
          {statusLabel[r.status as ReservationStatus]}
        </span>

        <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
          {r.status === 'pending' && !isDeclining && (
            <>
              <button onClick={() => onAction(r.id, 'confirm')} title="Confirm"
                className="w-8 h-8 rounded-lg bg-green-500/20 hover:bg-green-500/40 text-green-400 flex items-center justify-center transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsDeclining(true); setExpanded(true); }} title="Decline"
                className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {r.status === 'confirmed' && (
            <>
              <button onClick={() => onAction(r.id, 'seat')} title="Mark as Seated"
                className="w-8 h-8 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 flex items-center justify-center transition-colors">
                <UserCheck className="w-4 h-4" />
              </button>
              <button onClick={() => onAction(r.id, 'no_show')} title="No Show"
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 flex items-center justify-center transition-colors">
                <AlertCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        {!isDeclining && (
          <div className="shrink-0 text-slate-600">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 border-t border-slate-800">
              
              {isDeclining ? (
                <div className="pt-4 space-y-3">
                  <p className="text-sm text-slate-400">Please provide a reason for declining this reservation (optional).</p>
                  <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none placeholder-slate-500 resize-none" rows={2} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setIsDeclining(false)} className="px-4 py-2 text-xs font-bold text-slate-300 bg-slate-800 rounded-lg">Cancel</button>
                    <button onClick={() => { onAction(r.id, 'decline', declineReason); setIsDeclining(false); }} className="px-4 py-2 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600">Confirm Decline</button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-500 mb-1">EMAIL</p>
                    <p className="text-white text-sm">{r.guest_email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-500 mb-1">PHONE</p>
                    <p className="text-white text-sm">{r.guest_phone}</p>
                  </div>
                  {r.notes && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold tracking-widest text-slate-500 mb-1">NOTES</p>
                      <p className="text-slate-300 text-sm">{r.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeFilter, setRangeFilter] = useState<'today' | 'upcoming' | 'all'>('upcoming');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'other'>('all');

  const fetchReservations = useCallback(async () => {
    const { data, error } = await supabase.from('reservations').select('*').order('date', { ascending: true }).order('time', { ascending: true });
    if (data) setReservations(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReservations();

    const channel = supabase.channel('schema-db-changes-reservations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reservations' }, payload => {
        playChime();
        setReservations(prev => [...prev, payload.new].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reservations' }, payload => {
        setReservations(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchReservations]);

  const handleAction = async (id: string, action: 'confirm' | 'decline' | 'seat' | 'no_show', reason?: string) => {
    try {
      await fetch('/api/admin/reservations/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, reason }),
      });
    } catch (e) {
      console.error('Failed to update reservation', e);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filtered = reservations.filter(r => {
    const dateOk = rangeFilter === 'all' ? true : rangeFilter === 'today' ? r.date === today : r.date >= today;
    const statusOk = statusFilter === 'all' ? true : statusFilter === 'pending' ? r.status === 'pending' : statusFilter === 'confirmed' ? r.status === 'confirmed' : !['pending', 'confirmed'].includes(r.status);
    return dateOk && statusOk;
  });

  const pending = reservations.filter(r => r.status === 'pending').length;

  if (loading) return <div className="text-white p-8">Loading reservations...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Reservations</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pending > 0 ? <span className="text-amber-400">{pending} pending review</span> : 'All reservations handled'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-full p-1 shadow-sm">
          {(['today', 'upcoming', 'all'] as const).map(f => (
            <button key={f} onClick={() => setRangeFilter(f)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full capitalize transition-colors ${rangeFilter === f ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>{f}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-full p-1 shadow-sm">
          {(['all', 'pending', 'confirmed', 'other'] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full capitalize transition-colors ${statusFilter === f ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No reservations match this filter.</p>
          ) : filtered.map(r => (
            <motion.div key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ReservationRow r={r} onAction={handleAction} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
