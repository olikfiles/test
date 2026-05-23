'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useOrderStatus } from '@/hooks/useOrders';
import { CheckCircle2, Clock, ChefHat, Truck, Package } from 'lucide-react';

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  new:              { label: 'Order Received',    icon: <CheckCircle2 className="w-6 h-6" />, description: 'Your order has been received and is awaiting confirmation.' },
  confirmed:        { label: 'Order Confirmed',   icon: <Clock className="w-6 h-6" />,        description: 'Your order is confirmed. The kitchen is getting ready.' },
  sent_to_kitchen:  { label: 'In the Kitchen',    icon: <ChefHat className="w-6 h-6" />,      description: 'Our chefs are preparing your order right now.' },
  on_route:         { label: 'On the Way',         icon: <Truck className="w-6 h-6" />,        description: 'Your order is out for delivery. Pay cash on arrival.' },
  ready:            { label: 'Ready for Pickup',  icon: <Package className="w-6 h-6" />,      description: 'Your order is ready. Come collect and pay at the counter.' },
  delivered:        { label: 'Delivered',          icon: <CheckCircle2 className="w-6 h-6" />, description: 'Your order has been delivered. Enjoy your meal!' },
  completed:        { label: 'Completed',          icon: <CheckCircle2 className="w-6 h-6" />, description: 'Order completed. Thank you for choosing SYÖ & JUO!' },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrderStatus(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <p className="text-2xl font-bold mb-2">Order not found</p>
          <p className="text-gray-500 mb-6">We couldn't find an order with this ID.</p>
          <Link href="/" className="px-6 py-3 bg-primary text-white rounded-full font-bold">Back to Home</Link>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[order.status] ?? STATUS_META.new;
  const isTerminal = ['delivered', 'completed'].includes(order.status);

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <div className="max-w-xl mx-auto px-6">

        {/* Status Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${isTerminal ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
            {meta.icon}
          </div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Order #{id.slice(0, 8).toUpperCase()}
          </p>
          <h1 className="font-display font-bold text-4xl mb-3">{meta.label}</h1>
          <p className="text-gray-500">{meta.description}</p>
        </motion.div>

        {/* Countdown Timer */}
        {order.timer && !isTerminal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 rounded-3xl p-8 mb-8 text-center"
          >
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">
              Estimated Time
            </p>
            {order.timer.remaining_seconds > 0 ? (
              <>
                <p className="font-display font-bold text-6xl text-foreground mb-2">
                  {formatTime(order.timer.remaining_seconds)}
                </p>
                <p className="text-sm text-gray-400 mb-5">minutes remaining</p>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${order.timer.progress_percent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </>
            ) : (
              <p className="font-display font-bold text-2xl text-green-600">Almost ready!</p>
            )}
          </motion.div>
        )}

        {/* Status Timeline */}
        <div className="bg-gray-50 rounded-3xl p-8 mb-8">
          <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-5">Order Progress</h2>
          <div className="space-y-4">
            {order.status_history.map((entry, i) => {
              const entryMeta = STATUS_META[entry.status];
              const isLatest = i === order.status_history.length - 1;
              return (
                <div key={i} className={`flex items-start gap-3 ${isLatest ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${isLatest ? 'bg-primary' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-bold text-sm">{entryMeta?.label ?? entry.status}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.at).toLocaleTimeString('en-FI', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-3xl p-8 mb-8">
          <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-5">Your Items</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground">{item.quantity}× {item.name}</span>
                <span className="font-bold">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-5 pt-5 flex justify-between font-bold">
            <span>Total</span>
            <span>€{order.total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Pay €{order.total.toFixed(2)} cash on {order.type === 'delivery' ? 'delivery' : 'pickup'}
          </p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
