'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useMenuCategories, useAdminItems, useTags, useAdminItemTags } from '@/hooks/useMenu';
import type { MenuItem, ItemSize, ItemAddon } from '@/hooks/useMenu';
import { Upload, X, Plus, Trash2 } from 'lucide-react';

export default function EditItemPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: categories } = useMenuCategories();
  const { data: tags } = useTags();
  const { update } = useAdminItems();
  const itemTagMutations = useAdminItemTags(id);

  const item: MenuItem | undefined = categories?.flatMap(c => c.items).find(i => i.id === id);

  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    is_available: true,
    featured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Customization state
  const [sizesEnabled, setSizesEnabled] = useState(false);
  const [sizes, setSizes] = useState<ItemSize[]>([
    { id: 'regular', name: 'Regular', subtitle: 'Perfect for one', price_diff: 0 },
    { id: 'large', name: 'Large', subtitle: 'To share', price_diff: 6 },
  ]);
  const [ingredientsText, setIngredientsText] = useState('');
  const [addons, setAddons] = useState<ItemAddon[]>([]);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!item) return;
    setForm({
      category_id: item.category_id,
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      is_available: item.is_available,
      featured: item.featured,
    });
    setImagePreview(item.image_url ?? null);
    setSelectedTagIds(item.tags.map(t => t.id));

    if (item.sizes && item.sizes.length > 0) {
      setSizesEnabled(true);
      setSizes(item.sizes);
    }
    setIngredientsText((item.removable_ingredients ?? []).join(', '));
    setAddons(item.addons ?? []);
  }, [item]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleTag = (tagId: string, currentlyAssigned: boolean) => {
    if (currentlyAssigned) {
      itemTagMutations.remove.mutate(tagId);
      setSelectedTagIds(prev => prev.filter(t => t !== tagId));
    } else {
      itemTagMutations.assign.mutate(tagId);
      setSelectedTagIds(prev => [...prev, tagId]);
    }
  };

  const updateSize = (index: number, field: keyof ItemSize, value: string | number) => {
    setSizes(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addSize = () => {
    setSizes(prev => [...prev, { id: `size-${Date.now()}`, name: '', subtitle: '', price_diff: 0 }]);
  };

  const removeSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const addAddon = () => {
    setAddons(prev => [...prev, { id: `addon-${Date.now()}`, name: '', price: 0 }]);
  };

  const updateAddon = (index: number, field: keyof ItemAddon, value: string | number) => {
    setAddons(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  const removeAddon = (index: number) => {
    setAddons(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.price || isNaN(Number(form.price))) { setError('A valid price is required'); return; }

    const removable_ingredients = ingredientsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const finalSizes = sizesEnabled ? sizes.filter(s => s.name.trim()) : null;
    const finalAddons = addons.filter(a => a.name.trim());

    try {
      setUploading(true);
      let image_url: string | undefined;

      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        if (!uploadRes.ok) {
          const e = await uploadRes.json();
          throw new Error(e.error ?? 'Image upload failed');
        }
        const { url } = await uploadRes.json();
        image_url = url;
      }

      await new Promise<void>((resolve, reject) => {
        update.mutate(
          {
            id,
            category_id: form.category_id,
            name: form.name,
            description: form.description,
            price: Number(form.price),
            ...(image_url ? { image_url } : {}),
            is_available: form.is_available,
            featured: form.featured,
            sizes: finalSizes,
            removable_ingredients,
            addons: finalAddons,
          } as any,
          {
            onSuccess: () => resolve(),
            onError: (err: any) => reject(err),
          }
        );
      });

      router.push('/hq/menu');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const inputClass = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-primary/60 placeholder-slate-500 transition-colors';
  const labelClass = 'block text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400 mb-1.5';
  const smallInputClass = 'bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary/60 placeholder-slate-500 transition-colors';

  if (!item && categories) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Item not found.</p>
        <Link href="/hq/menu" className="text-primary text-sm mt-4 block">← Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hq/menu" className="text-slate-400 hover:text-white transition-colors text-sm">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-white">Edit Item</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Image */}
        <div>
          <label className={labelClass}>Photo</label>
          <label className="block cursor-pointer">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-800">
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setImageFile(null); setImagePreview(null); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-slate-500 transition-colors bg-slate-900">
                <Upload className="w-8 h-8 text-slate-500" />
                <p className="text-slate-400 text-sm">Click to replace image</p>
              </div>
            )}
          </label>
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={form.category_id}
            onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
            className={inputClass + ' appearance-none cursor-pointer'}
          >
            {categories?.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Item Name *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className={inputClass + ' resize-none'} />
        </div>

        <div>
          <label className={labelClass}>Price (€) *</label>
          <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className={inputClass} />
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div>
            <label className={labelClass}>Marketing Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => {
                const assigned = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id, assigned)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      assigned
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Tag changes save immediately.</p>
          </div>
        )}

        {/* Size Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={labelClass + ' mb-0'}>Size Options</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sizesEnabled}
                onChange={e => setSizesEnabled(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-xs text-slate-400">Enable</span>
            </label>
          </div>
          {sizesEnabled && (
            <div className="space-y-2 bg-slate-900 rounded-xl p-4">
              <div className="grid grid-cols-[1fr_1fr_80px_36px] gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Name</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Subtitle</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">+Price €</span>
                <span />
              </div>
              {sizes.map((size, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_80px_36px] gap-2 items-center">
                  <input
                    value={size.name}
                    onChange={e => updateSize(i, 'name', e.target.value)}
                    placeholder="Regular"
                    className={smallInputClass + ' w-full'}
                  />
                  <input
                    value={size.subtitle}
                    onChange={e => updateSize(i, 'subtitle', e.target.value)}
                    placeholder="Perfect for one"
                    className={smallInputClass + ' w-full'}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={size.price_diff}
                    onChange={e => updateSize(i, 'price_diff', Number(e.target.value))}
                    className={smallInputClass + ' w-full'}
                  />
                  <button type="button" onClick={() => removeSize(i)} className="text-slate-500 hover:text-red-400 transition-colors flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSize}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add size
              </button>
            </div>
          )}
        </div>

        {/* Removable Ingredients */}
        <div>
          <label className={labelClass}>Removable Ingredients</label>
          <input
            value={ingredientsText}
            onChange={e => setIngredientsText(e.target.value)}
            placeholder="Tomato Sauce, Mozzarella, Fresh Basil (comma-separated)"
            className={inputClass}
          />
          <p className="text-xs text-slate-500 mt-1">Leave blank to hide the remove-ingredients section.</p>
        </div>

        {/* Premium Add-ons */}
        <div className="space-y-3">
          <label className={labelClass}>Premium Add-ons</label>
          {addons.length > 0 && (
            <div className="space-y-2 bg-slate-900 rounded-xl p-4">
              <div className="grid grid-cols-[1fr_100px_36px] gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Name</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Price €</span>
                <span />
              </div>
              {addons.map((addon, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_36px] gap-2 items-center">
                  <input
                    value={addon.name}
                    onChange={e => updateAddon(i, 'name', e.target.value)}
                    placeholder="Truffle Oil"
                    className={smallInputClass + ' w-full'}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={addon.price}
                    onChange={e => updateAddon(i, 'price', Number(e.target.value))}
                    className={smallInputClass + ' w-full'}
                  />
                  <button type="button" onClick={() => removeAddon(i)} className="text-slate-500 hover:text-red-400 transition-colors flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addAddon}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add add-on
          </button>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_available} onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-slate-300 font-medium">Available on menu</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-slate-300 font-medium">Mark as Signature</span>
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={update.isPending || uploading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {uploading || update.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <Link href="/hq/menu" className="px-6 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
