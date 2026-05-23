'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { DELIVERY_FEE, SERVICE_FEE } from '@/lib/fees';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { orderMode, address } = useOrderStore();
  const createOrder = useCreateOrder();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState(address || '');
  const [notes, setNotes] = useState('');

  const subtotal = items.reduce(
    (acc, item) =>
      acc + (item.price + (item.customizations?.reduce((s, c) => s + c.price, 0) ?? 0)) * item.quantity,
    0
  );
  const deliveryFee = orderMode === 'delivery' ? DELIVERY_FEE : 0;
  const serviceFee = orderMode === 'delivery' ? SERVICE_FEE : 0;
  const grandTotal = subtotal + deliveryFee + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;

    const orderItems = items.map(item => ({
      name: item.name,
      price: item.price + (item.customizations?.reduce((s, c) => s + c.price, 0) ?? 0),
      quantity: item.quantity,
      notes: item.instructions,
    }));

    createOrder.mutate(
      {
        customer_name: name,
        customer_phone: phone,
        type: orderMode === 'dine-in' ? 'walk-in' : orderMode,
        address: orderMode === 'delivery' ? checkoutAddress : undefined,
        notes: notes || undefined,
        items: orderItems,
      },
      {
        onSuccess: (data) => {
          clearCart();
          router.push(`/order/${data.order.id}`);
        },
      }
    );
  };

  const inputClass =
    'w-full bg-transparent border-b border-gray-200 focus:border-foreground outline-none py-3 text-base placeholder-gray-400 transition-colors';

  return (
    <div className="min-h-screen pt-32 pb-32 bg-background">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">

        {/* Form */}
        <div>
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-muted-foreground mb-6">Checkout</p>
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

            {createOrder.isError && (
              <p className="text-red-500 text-sm">{(createOrder.error as Error).message}</p>
            )}

            <button
              disabled={createOrder.isPending || !items.length}
              type="submit"
              className="w-full py-5 bg-primary text-white font-bold tracking-wide rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createOrder.isPending ? 'Placing order…' : `Place Order · €${grandTotal.toFixed(2)}`}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Payment is cash on {orderMode === 'delivery' ? 'delivery' : 'pickup'}.
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-3xl p-10 h-fit">
          <h2 className="font-display font-bold text-2xl mb-8">Your Order</h2>
          <div className="space-y-4 mb-8">
            {items.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              items.map(item => {
                const addonsTotal = item.customizations?.reduce((s, c) => s + c.price, 0) ?? 0;
                return (
                  <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-0">
                    <div>
                      <p className="font-bold text-sm text-foreground">{item.name}</p>
                      {item.customizations?.map((c, i) => (
                        <p key={i} className="text-xs text-gray-400">{c.name}</p>
                      ))}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-foreground">€{((item.price + addonsTotal) * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <p>Subtotal</p><p>€{subtotal.toFixed(2)}</p>
            </div>
            {orderMode === 'delivery' && (
              <>
                <div className="flex justify-between text-sm text-gray-500">
                  <p>Delivery Fee</p><p>€{deliveryFee.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <p>Service Fee</p><p>€{serviceFee.toFixed(2)}</p>
                </div>
              </>
            )}
            <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-200">
              <p>Total</p><p>€{grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
