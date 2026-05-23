import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/menu/items?category_id=xxx&available_only=true
// Returns menu items, optionally filtered by category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');
    const availableOnly = searchParams.get('available_only') !== 'false';

    let query = supabase
      .from('menu_items')
      .select('*, menu_item_tags(tag_id, menu_tags(*)), menu_categories(id, name)')
      .order('sort_order', { ascending: true });

    if (categoryId) query = query.eq('category_id', categoryId);
    if (availableOnly) query = query.eq('is_available', true);

    const { data: items, error } = await query;
    if (error) throw error;

    const shaped = (items ?? []).map((item: any) => ({
      ...item,
      tags: (item.menu_item_tags ?? []).map((t: any) => t.menu_tags).filter(Boolean),
      category: item.menu_categories ?? null,
      menu_item_tags: undefined,
      menu_categories: undefined,
    }));

    return NextResponse.json({ items: shaped });
  } catch (err: any) {
    console.error('GET /api/menu/items error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
