'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { orderMode, setOrderMode, address } = useOrderStore();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState(address || '');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = orderMode === 'delivery' ? 5.90 : 0;
  const cartTotal = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');

    try {
      // 1. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: name,
          customer_phone: phone,
          type: orderMode,
          status: 'new',
          total: cartTotal,
          address: orderMode === 'delivery' ? checkoutAddress : null,
          notes: notes,
          status_history: [{ status: 'new', at: new Date().toISOString() }]
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert Order Items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      router.push(`/success?orderId=${orderData.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-transparent border-b border-gray-200 focus:border-foreground outline-none py-3 text-base placeholder-gray-400 transition-colors';

  return (
    <div className="min-h-screen pt-32 pb-32 bg-background">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* Form */}
        <div>
          <Link href="/" className="inline-block mb-12 text-sm font-bold text-gray-500 hover:text-foreground transition-colors">
            ← Back to Menu
          </Link>
          <h1 className="font-display font-bold text-5xl text-foreground mb-12">Details</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Aino Virtanen" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Phone</label>
                <input required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+358 40 123 4567" />
              </div>
            </div>

            {orderMode === 'delivery' && (
              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Delivery Address</label>
                <input required value={checkoutAddress} onChange={e => setCheckoutAddress(e.target.value)} className={inputClass} placeholder="Mannerheimintie 12, Helsinki" />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-muted-foreground mb-1">Notes for Kitchen</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Allergies, delivery instructions..." />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button 
              disabled={submitting || items.length === 0}
              type="submit" 
              className="w-full py-5 bg-primary text-white font-bold tracking-wide rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Processing...' : `Pay €${cartTotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-3xl p-10 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-bold text-2xl">Your Order</h2>
          </div>
          
          <div className="flex p-1 bg-white rounded-lg mb-6 shadow-sm border border-gray-100">
            <button
              onClick={() => setOrderMode('delivery')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                orderMode === 'delivery' ? 'bg-foreground text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Delivery (45-60 min)
            </button>
            <button
              onClick={() => setOrderMode('pickup')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                orderMode === 'pickup' ? 'bg-foreground text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Takeout (15-20 min)
            </button>
          </div>

          <div className="space-y-4 mb-8">
            {items.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <div>
                    <p className="font-bold text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-foreground">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 text-sm">Subtotal</p>
              <p className="font-medium">€{subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-sm">{orderMode === 'delivery' ? 'Delivery Fee' : 'Service Fee'}</p>
              <p className="font-medium">€{deliveryFee.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center text-xl font-bold">
              <p>Total</p>
              <p>€{cartTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
