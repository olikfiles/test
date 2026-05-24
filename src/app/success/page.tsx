'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOrderStore } from '@/store/useOrderStore';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { orderMode } = useOrderStore();

  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen pt-32 pb-32 bg-background flex flex-col items-center justify-center text-center px-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8 text-3xl">✓</div>
        <h1 className="font-display font-bold text-3xl mb-2 text-foreground">Order Received</h1>
        <p className="text-gray-500 mb-8">
          Order <span className="font-bold text-foreground">#{orderId?.slice(0, 6).toUpperCase() || 'SYS123'}</span> is being prepared.
        </p>
        
        {/* Prep Timer */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-sm font-bold text-foreground mb-4">
            {orderMode === 'delivery' ? '🚚 Delivery' : '🛍️ Takeout'}
          </p>
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">
            {orderMode === 'delivery' ? 'Estimated Delivery Time' : 'Estimated Prep Time'}
          </p>
          <p className="text-5xl font-display font-bold text-foreground">{formatTime(timeLeft)}</p>
        </div>

        <Link href="/" className="block w-full py-4 bg-foreground text-white font-bold rounded-full hover:bg-foreground/90 transition-colors">
          Back to Menu
        </Link>
      </motion.div>
    </div>
  );
}
