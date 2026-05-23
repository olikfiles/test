import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

const CTX = 'orders/create';

import { DELIVERY_FEE, SERVICE_FEE } from '@/lib/fees';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, customer_phone, type, address, notes, items } = body;

    if (!customer_name || !customer_phone || !type || !items?.length) {
      logger.warn(CTX, 'Missing required fields', { customer_name: !!customer_name, customer_phone: !!customer_phone, type, itemCount: items?.length });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (type === 'delivery' && !address) {
      logger.warn(CTX, 'Delivery order missing address');
      return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 });
    }

    logger.info(CTX, `New ${type} order for ${customer_name} — ${items.length} item(s)`);

    // Calculate totals
    const subtotal: number = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = type === 'delivery' ? DELIVERY_FEE : 0;
    const serviceFee = type === 'delivery' ? SERVICE_FEE : 0;
    const total = subtotal + deliveryFee + serviceFee;

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name,
        customer_phone,
        type,
        status: 'new',
        total,
        address: type === 'delivery' ? address : null,
        notes: notes || null,
        status_history: [{ status: 'new', at: new Date().toISOString() }],
      }])
      .select()
      .single();

    if (orderError) { logger.error(CTX, 'Failed to insert order', orderError); throw orderError; }

    // Insert order items
    const orderItems = items.map((item: {
      name: string;
      quantity: number;
      price: number;
      customizations?: { name: string; price: number }[];
      notes?: string;
    }) => ({
      order_id: order.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      customizations: item.customizations ?? [],
      notes: item.notes || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) { logger.error(CTX, 'Failed to insert order items', itemsError); throw itemsError; }

    logger.info(CTX, `Order created — id: ${order.id}, total: €${total.toFixed(2)}`);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total,
        subtotal,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        type,
        created_at: order.created_at,
      },
    }, { status: 201 });

  } catch (err: any) {
    logger.error(CTX, 'Unhandled error', { message: err.message });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
