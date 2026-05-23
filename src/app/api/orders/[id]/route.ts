import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Estimated prep time in minutes per order type
const PREP_MINUTES: Record<string, number> = {
  delivery: 35,
  pickup: 20,
  'walk-in': 25,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate countdown timer
    // Timer starts when the order is accepted (status = 'confirmed')
    const acceptedEntry = (order.status_history as { status: string; at: string }[])
      ?.find(h => h.status === 'confirmed');

    let estimatedMinutes: number | null = null;
    let remainingSeconds: number | null = null;
    let progressPercent: number | null = null;

    if (acceptedEntry) {
      const prepTotal = (PREP_MINUTES[order.type] ?? 30) * 60; // in seconds
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(acceptedEntry.at).getTime()) / 1000
      );
      remainingSeconds = Math.max(0, prepTotal - elapsedSeconds);
      estimatedMinutes = PREP_MINUTES[order.type] ?? 30;
      progressPercent = Math.min(100, Math.round((elapsedSeconds / prepTotal) * 100));
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      type: order.type,
      customer_name: order.customer_name,
      total: order.total,
      items: order.order_items,
      status_history: order.status_history,
      created_at: order.created_at,
      timer: acceptedEntry
        ? { remaining_seconds: remainingSeconds, estimated_minutes: estimatedMinutes, progress_percent: progressPercent }
        : null,
    });

  } catch (err: any) {
    console.error('Get Order Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
