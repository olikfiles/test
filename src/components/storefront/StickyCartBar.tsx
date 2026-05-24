'use client';

import { useCartStore } from '@/store/useCartStore';
import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function StickyCartBar() {
  const { items, getCartTotal } = useCartStore();
  const router = useRouter();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = getCartTotal();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none"
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-foreground text-white py-4 px-6 rounded-2xl shadow-xl flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                </div>
                <span className="font-medium text-sm">View Checkout</span>
              </div>
              <span className="font-bold">€{totalAmount.toFixed(2)}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
