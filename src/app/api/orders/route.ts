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

    // Validate all items reference a real, available menu item
    const menuItemIds: string[] = items.map((i: { menu_item_id: string }) => i.menu_item_id);
    if (menuItemIds.some((id: string) => !id)) {
      return NextResponse.json({ error: 'Each item must include a menu_item_id' }, { status: 400 });
    }

    const { data: menuItems, error: menuLookupError } = await supabase
      .from('menu_items')
      .select('id, name, price, is_available')
      .in('id', menuItemIds);

    if (menuLookupError) throw menuLookupError;

    const foundIds = (menuItems ?? []).map((i: { id: string }) => i.id);
    const missing = menuItemIds.filter((id: string) => !foundIds.includes(id));
    if (missing.length > 0) {
      return NextResponse.json({ error: `Menu item(s) not found: ${missing.join(', ')}` }, { status: 404 });
    }

    const unavailable = (menuItems ?? [])
      .filter((i: { is_available: boolean }) => !i.is_available)
      .map((i: { name: string }) => i.name);
    if (unavailable.length > 0) {
      return NextResponse.json({ error: `Item(s) currently unavailable: ${unavailable.join(', ')}` }, { status: 400 });
    }

    const itemMap = Object.fromEntries(
      (menuItems ?? []).map((i: { id: string; price: number }) => [i.id, i])
    );

    // Calculate totals using DB prices — client-sent price is ignored
    const subtotal: number = items.reduce(
      (sum: number, item: { menu_item_id: string; quantity: number; customizations?: { price: number }[] }) => {
        const dbItem = itemMap[item.menu_item_id] as { price: number };
        const customizationsTotal = (item.customizations ?? []).reduce((s: number, c: { price: number }) => s + c.price, 0);
        return sum + (dbItem.price + customizationsTotal) * item.quantity;
      },
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

    // Insert order items — price stored is DB base price + customization upcharges
    const orderItems = items.map((item: {
      menu_item_id: string;
      name: string;
      quantity: number;
      customizations?: { name: string; price: number }[];
      notes?: string;
    }) => {
      const dbItem = itemMap[item.menu_item_id] as unknown as { price: number; name: string };
      const customizationsTotal = (item.customizations ?? []).reduce((s: number, c: { price: number }) => s + c.price, 0);
      return {
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        name: item.name,
        quantity: item.quantity,
        price: dbItem.price + customizationsTotal,
        customizations: item.customizations ?? [],
        notes: item.notes || null,
      };
    });

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
