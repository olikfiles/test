import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/menu/categories
// Returns all categories ordered by sort_order, each with their available menu items and tags
export async function GET() {
  try {
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (catError) throw catError;

    // Fetch all available items with their tags in one query
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('*, menu_item_tags(tag_id, menu_tags(*))')
      .eq('is_available', true)
      .order('sort_order', { ascending: true });

    if (itemsError) throw itemsError;

    // Shape items: flatten tags
    const shapedItems = (items ?? []).map((item: any) => ({
      ...item,
      tags: (item.menu_item_tags ?? []).map((t: any) => t.menu_tags).filter(Boolean),
      menu_item_tags: undefined,
    }));

    // Nest items under their category
    const result = (categories ?? []).map((cat: any) => ({
      ...cat,
      items: shapedItems.filter((item: any) => item.category_id === cat.id),
    }));

    return NextResponse.json({ categories: result });
  } catch (err: any) {
    console.error('GET /api/menu/categories error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
