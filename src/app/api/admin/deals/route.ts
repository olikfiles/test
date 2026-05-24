import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

async function validateItemIds(item_ids: string[]): Promise<string | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id')
    .in('id', item_ids);

  if (error) throw error;

  const foundIds = (data ?? []).map((i: { id: string }) => i.id);
  const missing = item_ids.filter(id => !foundIds.includes(id));

  if (missing.length > 0) {
    return `Menu item(s) not found: ${missing.join(', ')}`;
  }
  return null;
}

// POST /api/admin/deals
// Create a new deal/bundle
export async function POST(req: NextRequest) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, price, item_ids, is_time_bound, start_date, end_date } = body;

    if (!name?.trim() || price === undefined || !Array.isArray(item_ids) || !item_ids.length) {
      return NextResponse.json(
        { error: 'name, price, and item_ids (non-empty array) are required' },
        { status: 400 }
      );
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    if (is_time_bound && (!start_date || !end_date)) {
      return NextResponse.json(
        { error: 'start_date and end_date are required for time-bound deals' },
        { status: 400 }
      );
    }

    // Validate all item_ids exist
    const itemValidationError = await validateItemIds(item_ids);
    if (itemValidationError) {
      return NextResponse.json({ error: itemValidationError }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('deals')
      .insert([{
        name: name.trim(),
        description: description?.trim() ?? null,
        price: Number(price),
        item_ids,
        is_active: true,
        is_time_bound: is_time_bound ?? false,
        start_date: is_time_bound ? start_date : null,
        end_date: is_time_bound ? end_date : null,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ deal: data }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/deals error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
