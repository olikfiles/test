import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

// PUT /api/admin/menu/categories/[id]
// Rename or reorder a category
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
    const updates: Record<string, any> = {};

    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('menu_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ category: data });
  } catch (err: any) {
    console.error('PUT /api/admin/menu/categories/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/menu/categories/[id]
// Delete a category (cascades to its items)
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
      .from('menu_categories')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/admin/menu/categories/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
