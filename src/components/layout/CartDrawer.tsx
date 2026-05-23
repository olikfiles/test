'use client';

import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Truck, Store, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DELIVERY_FEE, SERVICE_FEE } from '@/lib/fees';

export function CartDrawer() {
  const { isDrawerOpen, toggleDrawer, items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const { orderMode, address, restaurantLocation } = useOrderStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getCartTotal();
  const deliveryFee = orderMode === 'delivery' && subtotal > 0 ? DELIVERY_FEE : 0;
  const serviceFee = orderMode === 'delivery' && subtotal > 0 ? SERVICE_FEE : 0;
  const grandTotal = subtotal + deliveryFee + serviceFee;

  const modeIcon = 
    orderMode === 'delivery' ? <Truck className="w-4 h-4 text-primary" /> :
    orderMode === 'pickup' ? <Store className="w-4 h-4 text-primary" /> :
    <Coffee className="w-4 h-4 text-primary" />;
    
  const modeText = 
    orderMode === 'delivery' ? `Delivery to ${address || 'Select Address'}` :
    orderMode === 'pickup' ? `Pickup from ${restaurantLocation}` :
    'Dine-in Order';

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={toggleDrawer}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:max-w-[440px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex flex-col border-b border-border bg-white z-10 shrink-0">
              <div className="flex items-center justify-between px-6 h-16">
                <span className="font-extrabold text-lg text-foreground">Your Order</span>
                <button onClick={toggleDrawer} className="p-2 bg-accent rounded-full text-foreground hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
              <div className="px-6 pb-4 flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  {modeIcon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Order Mode</span>
                  <span className="text-sm font-semibold text-foreground truncate max-w-[280px]">{modeText}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-muted/30">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-muted-foreground">Your cart is empty.</p>
                  <button onClick={toggleDrawer} className="font-bold text-primary hover:text-primary/80 transition-colors">
                    Start ordering
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {/* Optional Image */}
                      {item.image && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-accent">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-foreground text-sm leading-tight">{item.name}</h3>
                          <span className="font-bold text-sm ml-4">
                            €{((item.price + (item.customizations?.reduce((sum, c) => sum + c.price, 0) || 0)) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Customizations List */}
                        {item.customizations && item.customizations.length > 0 && (
                          <ul className="text-[12px] text-muted-foreground space-y-0.5 mb-2 font-medium">
                            {item.customizations.map((c, i) => (
                              <li key={i}>{c.name} {c.price > 0 && `(+€${c.price.toFixed(2)})`}</li>
                            ))}
                          </ul>
                        )}
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-auto pt-2">
                          <div className="flex items-center bg-accent rounded-lg p-0.5">
                            <button
                              onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                              className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-foreground hover:text-primary transition-colors"
                            >
                              <Minus className="w-3 h-3" strokeWidth={2.5} />
                            </button>
                            <span className="w-7 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-foreground hover:text-primary transition-colors"
                            >
                              <Plus className="w-3 h-3" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Upsells */}
                  <div className="pt-6 border-t border-border mt-8">
                    <h4 className="font-bold text-foreground mb-4">Complete your meal</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                      {/* Fake upsell 1 */}
                      <div className="w-32 shrink-0 bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden mb-2">
                          <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=200&auto=format&fit=crop" alt="Wine" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-sm line-clamp-1 mb-1">House Red</span>
                        <span className="text-xs text-muted-foreground font-medium mb-2">+€12.00</span>
                        <button className="w-full py-1.5 bg-accent text-foreground font-bold text-xs rounded-lg hover:bg-gray-200 transition-colors">Add</button>
                      </div>
                      {/* Fake upsell 2 */}
                      <div className="w-32 shrink-0 bg-white border border-border rounded-xl p-3 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-accent mb-2 flex items-center justify-center text-xl">🍰</div>
                        <span className="font-semibold text-sm line-clamp-1 mb-1">Tiramisu</span>
                        <span className="text-xs text-muted-foreground font-medium mb-2">+€8.00</span>
                        <button className="w-full py-1.5 bg-accent text-foreground font-bold text-xs rounded-lg hover:bg-gray-200 transition-colors">Add</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="bg-white border-t border-border shrink-0 p-6 pb-8 md:pb-6">
                <div className="space-y-3 mb-6 text-sm font-medium">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  {orderMode === 'delivery' && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Fee</span>
                        <span>€{deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Service Fee</span>
                        <span>€{serviceFee.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-foreground pt-4 border-t border-border text-lg font-extrabold">
                    <span>Total</span>
                    <span>€{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  onClick={toggleDrawer}
                  className="w-full h-14 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
