'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { useMenuCategories } from '@/hooks/useMenu';
import { useAdminCategories, useAdminItems } from '@/hooks/useMenu';
import type { MenuItem, MenuCategory } from '@/hooks/useMenu';

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategorySection({
  cat,
  onDeleteCategory,
  onToggleItem,
  onDeleteItem,
}: {
  cat: MenuCategory;
  onDeleteCategory: (id: string, name: string) => void;
  onToggleItem: (id: string, current: boolean) => void;
  onDeleteItem: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Category Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <button className="flex items-center gap-3 flex-1 text-left" onClick={() => setOpen(p => !p)}>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          <span className="font-bold text-white">{cat.name}</span>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{cat.items.length} items</span>
        </button>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/hq/menu/items/new?category_id=${cat.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </Link>
          <button
            onClick={() => onDeleteCategory(cat.id, cat.name)}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Items */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            {cat.items.length === 0 ? (
              <p className="text-slate-500 text-sm px-5 py-4">No items yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {cat.items.map((item: MenuItem) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-800" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-medium text-sm truncate">{item.name}</p>
                        {item.featured && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded uppercase">Signature</span>
                        )}
                        {item.tags.map(tag => (
                          <span key={tag.id} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded uppercase flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />{tag.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-400 text-xs">€{Number(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onToggleItem(item.id, item.is_available)}
                        className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                          item.is_available ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                        }`}
                        title={item.is_available ? 'Mark unavailable' : 'Mark available'}
                      >
                        {item.is_available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {item.is_available ? 'On' : 'Off'}
                      </button>
                      <Link
                        href={`/hq/menu/items/${item.id}/edit`}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => onDeleteItem(item.id, item.name)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminMenuPage() {
  const { data: categories, isLoading } = useMenuCategories();
  const catMutations = useAdminCategories();
  const itemMutations = useAdminItems();

  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [error, setError] = useState('');

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setError('');
    catMutations.create.mutate(
      { name: newCatName },
      {
        onSuccess: () => { setNewCatName(''); setAddingCat(false); },
        onError: (e: any) => setError(e.message),
      }
    );
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}" and all its items?`)) return;
    catMutations.remove.mutate(id);
  };

  const handleToggleItem = (id: string, current: boolean) => {
    itemMutations.toggleAvailability.mutate({ id, is_available: !current });
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    itemMutations.remove.mutate(id);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Menu Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage categories, items, and availability</p>
        </div>
        <button
          onClick={() => setAddingCat(p => !p)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {/* New Category Form */}
      <AnimatePresence>
        {addingCat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-5 overflow-hidden"
          >
            <p className="text-sm font-bold text-white mb-3">New Category</p>
            <div className="flex gap-3">
              <input
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
                placeholder="e.g. Starters, Mains, Desserts…"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-primary/60 placeholder-slate-500"
                autoFocus
              />
              <button
                onClick={handleCreateCategory}
                disabled={catMutations.create.isPending}
                className="px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {catMutations.create.isPending ? 'Saving…' : 'Create'}
              </button>
              <button onClick={() => setAddingCat(false)} className="px-4 py-2.5 bg-slate-800 text-slate-300 text-sm font-bold rounded-xl">Cancel</button>
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories + Items */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 bg-slate-900 rounded-2xl animate-pulse" />)}</div>
      ) : !categories?.length ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 mb-4">No categories yet.</p>
          <button onClick={() => setAddingCat(true)} className="text-primary text-sm font-bold hover:underline">Create your first category →</button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(cat => (
            <CategorySection
              key={cat.id}
              cat={cat}
              onDeleteCategory={handleDeleteCategory}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
