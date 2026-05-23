import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Base prep times in minutes per fulfillment type
const BASE_TIMES: Record<string, number> = {
  delivery: 35,
  pickup: 20,
};

// Each active order in the kitchen adds this many minutes of extra wait
const MINUTES_PER_QUEUED_ORDER = 3;

// GET /api/fulfillment/wait-times
// Returns dynamic estimated wait times based on current kitchen queue.
// Response: { delivery: { min, max, label }, pickup: { min, max, label } }
export async function GET() {
  try {
    // Count orders currently in the kitchen
    const { count: kitchenCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['confirmed', 'sent_to_kitchen']);

    const queuedOrders = kitchenCount ?? 0;
    const extraMinutes = queuedOrders * MINUTES_PER_QUEUED_ORDER;

    const result: Record<string, { min: number; max: number; label: string }> = {};

    for (const [type, base] of Object.entries(BASE_TIMES)) {
      const min = base + extraMinutes;
      const max = min + 10;
      result[type] = {
        min,
        max,
        label: `${min}–${max} min`,
      };
    }

    return NextResponse.json({
      wait_times: result,
      queue_length: queuedOrders,
    });
  } catch (err: any) {
    console.error('GET /api/fulfillment/wait-times error:', err);
    // Return default times on error so the UI never breaks
    return NextResponse.json({
      wait_times: {
        delivery: { min: 35, max: 45, label: '35–45 min' },
        pickup: { min: 20, max: 30, label: '20–30 min' },
      },
      queue_length: 0,
    });
  }
}
