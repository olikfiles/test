'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ToggleLeft, ToggleRight, Clock, Infinity } from 'lucide-react';
import { useDeals, useAdminDeals } from '@/hooks/useDeals';
import { useMenuItems } from '@/hooks/useMenu';
import type { Deal } from '@/hooks/useDeals';

// ─── Deal Card ──��─────────────────────────────────────────────────────────────
function DealCard({ deal, onToggle, onDelete }: {
  deal: Deal;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className={`bg-slate-900 border rounded-2xl p-5 transition-colors ${deal.is_active ? 'border-slate-800' : 'border-slate-800/50 opacity-60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-bold text-white">{deal.name}</p>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
              deal.is_time_bound ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {deal.is_time_bound ? <><Clock className="w-2.5 h-2.5" /> Time-Bound</> : <><Infinity className="w-2.5 h-2.5" /> Always Active</>}
            </span>
          </div>
          {deal.description && <p className="text-slate-400 text-sm mb-2">{deal.description}</p>}
          {deal.is_time_bound && deal.start_date && deal.end_date && (
            <p className="text-xs text-slate-500 mb-2">{deal.start_date} → {deal.end_date}</p>
          )}
          <p className="text-primary font-bold">€{Number(deal.price).toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggle(deal.id, deal.is_active)}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
              deal.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {deal.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
            {deal.is_active ? 'Active' : 'Inactive'}
          </button>
          <button
            onClick={() => onDelete(deal.id, deal.name)}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Deal Form ─────────────────────────────────────────────────────────
function CreateDealForm({ onClose }: { onClose: () => void }) {
  const { data: allItems } = useMenuItems();
  const { create } = useAdminDeals();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    is_time_bound: false,
    start_date: '',
    end_date: '',
  });
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.price || isNaN(Number(form.price))) { setError('A valid price is required'); return; }
    if (!selectedItemIds.length) { setError('Select at least one item'); return; }
    if (form.is_time_bound && (!form.start_date || !form.end_date)) {
      setError('Start and end dates are required for time-bound deals');
      return;
    }

    create.mutate(
      {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        item_ids: selectedItemIds,
        is_time_bound: form.is_time_bound,
        start_date: form.is_time_bound ? form.start_date : undefined,
        end_date: form.is_time_bound ? form.end_date : undefined,
      },
      {
        onSuccess: onClose,
        onError: (e: any) => setError(e.message),
      }
    );
  };

  const inputClass = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/60 placeholder-slate-500 transition-colors';
  const labelClass = 'block text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 mb-1.5';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-900 border border-slate-700 rounded-2xl p-6 overflow-hidden"
    >
      <h2 className="font-bold text-white mb-5">New Deal / Bundle</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Deal Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Weekend Special" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className={inputClass + ' resize-none'} placeholder="Short description shown on the homepage…" />
          </div>
          <div>
            <label className={labelClass}>Bundle Price (€) *</label>
            <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" className={inputClass} />
          </div>
        </div>

        {/* Items in bundle */}
        <div>
          <label className={labelClass}>Included Items *</label>
          {!allItems?.length ? (
            <p className="text-slate-500 text-sm">No menu items yet. Create items first.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {allItems.map(item => (
                <label key={item.id} className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer border transition-colors ${
                  selectedItemIds.includes(item.id) ? 'border-primary bg-primary/10' : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}>
                  <input type="checkbox" checked={selectedItemIds.includes(item.id)} onChange={() => toggleItem(item.id)} className="accent-primary" />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    <p className="text-slate-400 text-xs">€{Number(item.price).toFixed(2)}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Time bound */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input type="checkbox" checked={form.is_time_bound} onChange={e => setForm(p => ({ ...p, is_time_bound: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-slate-300 font-medium">Time-bound offer (auto-expires)</span>
          </label>
          {form.is_time_bound && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className={inputClass} />
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={create.isPending} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {create.isPending ? 'Creating…' : 'Create Deal'}
          </button>
          <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">Cancel</button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DealsPage() {
  const { data: deals, isLoading } = useDeals();
  const { toggle, remove } = useAdminDeals();
  const [showForm, setShowForm] = useState(false);

  const handleToggle = (id: string, current: boolean) => {
    toggle.mutate({ id, is_active: !current });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete deal "${name}"?`)) return;
    remove.mutate(id);
  };

  const active = deals?.filter(d => d.is_active) ?? [];
  const inactive = deals?.filter(d => !d.is_active) ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Deals & Bundles</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create promotional packages shown on the homepage</p>
        </div>
        <button
          onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Deal
        </button>
      </div>

      <AnimatePresence>
        {showForm && <CreateDealForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 bg-slate-900 rounded-2xl animate-pulse" />)}</div>
      ) : !deals?.length ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 mb-2">No deals yet.</p>
          <p className="text-slate-500 text-sm">Create a bundle to promote it on the homepage.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-3">Active ({active.length})</p>
              <div className="space-y-3">
                {active.map(deal => (
                  <DealCard key={deal.id} deal={deal} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
          {inactive.length > 0 && (
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-3">Inactive ({inactive.length})</p>
              <div className="space-y-3">
                {inactive.map(deal => (
                  <DealCard key={deal.id} deal={deal} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
