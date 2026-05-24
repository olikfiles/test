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

// PUT /api/admin/deals/[id]
// Update deal fields (including toggling is_active, changing dates, price, items)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const allowed = ['name', 'description', 'price', 'item_ids', 'is_active', 'is_time_bound', 'start_date', 'end_date'];
    const updates: Record<string, any> = {};

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = key === 'name' || key === 'description'
          ? body[key]?.trim() ?? null
          : body[key];
      }
    }

    if (updates.price !== undefined) {
      if (isNaN(Number(updates.price)) || Number(updates.price) < 0) {
        return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
      }
      updates.price = Number(updates.price);
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Validate item_ids if being changed
    if (updates.item_ids !== undefined) {
      if (!Array.isArray(updates.item_ids) || updates.item_ids.length === 0) {
        return NextResponse.json({ error: 'item_ids must be a non-empty array' }, { status: 400 });
      }
      const itemValidationError = await validateItemIds(updates.item_ids);
      if (itemValidationError) {
        return NextResponse.json({ error: itemValidationError }, { status: 404 });
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ deal: data });
  } catch (err: any) {
    console.error('PUT /api/admin/deals/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/deals/[id]
// Permanently delete a deal
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/admin/deals/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
