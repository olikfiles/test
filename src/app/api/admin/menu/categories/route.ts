import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

// POST /api/admin/menu/categories
// Create a new menu category
export async function POST(req: NextRequest) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, sort_order } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Default sort_order to end of list if not provided
    let order = sort_order;
    if (order === undefined || order === null) {
      const { count } = await supabase
        .from('menu_categories')
        .select('*', { count: 'exact', head: true });
      order = count ?? 0;
    }

    const { data, error } = await supabase
      .from('menu_categories')
      .insert([{ name: name.trim(), sort_order: order }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ category: data }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/menu/categories error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
