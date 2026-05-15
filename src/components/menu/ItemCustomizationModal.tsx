'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

export interface MenuItemData {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  featured?: boolean;
}

interface ItemCustomizationModalProps {
  item: MenuItemData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemCustomizationModal({ item, isOpen, onClose }: ItemCustomizationModalProps) {
  const { addItem, toggleDrawer, setDrawerOpen } = useCartStore();
  
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<'regular' | 'large'>('regular');
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [addons, setAddons] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  // Reset state when a new item is opened
  if (!item) return null;

  const defaultIngredients = ['Tomato Sauce', 'Mozzarella', 'Fresh Basil', 'Olive Oil'];
  const premiumAddons = [
    { id: 'truffle', name: 'Truffle Oil', price: 4.0 },
    { id: 'burrata', name: 'Extra Burrata', price: 6.5 },
    { id: 'prosciutto', name: 'Prosciutto di Parma', price: 5.0 },
  ];

  const sizePriceDiff = size === 'large' ? 6.0 : 0;
  const addonsPriceTotal = addons.reduce((total, addonId) => {
    const addon = premiumAddons.find(a => a.id === addonId);
    return total + (addon?.price || 0);
  }, 0);

  const unitPrice = item.price + sizePriceDiff + addonsPriceTotal;
  const totalPrice = unitPrice * quantity;

  const toggleRemoved = (ing: string) => {
    setRemovedIngredients(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  const toggleAddon = (addonId: string) => {
    setAddons(prev => 
      prev.includes(addonId) ? prev.filter(a => a !== addonId) : [...prev, addonId]
    );
  };

  const handleAddToCart = () => {
    const customizations = [];
    if (size === 'large') customizations.push({ name: 'Large Size', price: 6.0 });
    addons.forEach(a => {
      const addon = premiumAddons.find(p => p.id === a);
      if (addon) customizations.push({ name: `+ ${addon.name}`, price: addon.price });
    });
    removedIngredients.forEach(r => {
      customizations.push({ name: `- No ${r}`, price: 0 });
    });

    addItem({
      id: `${item.id}-${Date.now()}`, // unique ID for this specific customization combo
      baseId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      customizations,
      image: item.image,
      instructions: instructions || undefined,
    });
    
    onClose();
    setDrawerOpen(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[600px] h-[90vh] md:h-[85vh] bg-white md:rounded-3xl z-[70] flex flex-col shadow-2xl overflow-hidden rounded-t-3xl"
          >
            {/* Header / Hero Image */}
            <div className="relative h-[30%] shrink-0 bg-accent">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1">{item.name}</h2>
                <p className="text-white/80 text-sm font-medium">Base: €{item.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-muted/30">
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>

              {/* Size */}
              <section>
                <h3 className="font-bold text-foreground mb-3 text-lg">Choose Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSize('regular')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${size === 'regular' ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-gray-300'}`}
                  >
                    <div className="font-bold text-foreground">Regular</div>
                    <div className="text-sm text-muted-foreground mt-1">Perfect for one</div>
                  </button>
                  <button 
                    onClick={() => setSize('large')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${size === 'large' ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-foreground">Large</div>
                      <div className="text-sm font-bold text-primary">+€6.00</div>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">To share</div>
                  </button>
                </div>
              </section>

              {/* Removals */}
              <section>
                <h3 className="font-bold text-foreground mb-3 text-lg">Remove Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {defaultIngredients.map(ing => (
                    <button
                      key={ing}
                      onClick={() => toggleRemoved(ing)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        removedIngredients.includes(ing) 
                          ? 'border-red-500 bg-red-50 text-red-600' 
                          : 'border-border bg-white text-foreground hover:bg-gray-50'
                      }`}
                    >
                      {removedIngredients.includes(ing) ? `No ${ing}` : ing}
                    </button>
                  ))}
                </div>
              </section>

              {/* Addons */}
              <section>
                <h3 className="font-bold text-foreground mb-3 text-lg">Premium Add-ons</h3>
                <div className="space-y-3">
                  {premiumAddons.map(addon => (
                    <div 
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        addons.includes(addon.id) ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="font-semibold text-foreground">{addon.name}</span>
                      <span className="text-sm font-bold text-muted-foreground">+€{addon.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Instructions */}
              <section>
                <h3 className="font-bold text-foreground mb-3 text-lg">Special Instructions</h3>
                <textarea 
                  placeholder="Allergies? Extra napkins?"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-24"
                />
              </section>
            </div>

            {/* Footer / CTA */}
            <div className="shrink-0 bg-white border-t border-border p-5 pb-8 md:pb-5">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center bg-accent rounded-xl p-1 h-14">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-foreground hover:text-primary transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
                
                {/* Add to Order */}
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white h-14 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                >
                  <span>Add to Order</span>
                  <span className="opacity-50">•</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
