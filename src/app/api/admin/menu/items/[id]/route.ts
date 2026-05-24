import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

// PUT /api/admin/menu/items/[id]
// Update item fields or toggle availability
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

    const allowed = ['category_id', 'name', 'description', 'price', 'image_url', 'is_available', 'featured', 'sort_order', 'sizes', 'removable_ingredients', 'addons'];
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

    // Validate category_id exists if being changed
    if (updates.category_id) {
      const { data: cat, error: catError } = await supabase
        .from('menu_categories')
        .select('id')
        .eq('id', updates.category_id)
        .single();

      if (catError || !cat) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ item: data });
  } catch (err: any) {
    console.error('PUT /api/admin/menu/items/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/menu/items/[id]
// Delete a menu item (cascades to its tags)
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
      .from('menu_items')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/admin/menu/items/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
