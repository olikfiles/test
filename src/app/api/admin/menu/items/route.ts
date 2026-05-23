import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';

const CTX = 'admin/menu/items';

// POST /api/admin/menu/items
// Create a new menu item
export async function POST(req: NextRequest) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { category_id, name, description, price, image_url, is_available, featured, sort_order, sizes, removable_ingredients, addons } = body;

    logger.info(CTX, 'Create item request', { category_id, name, price, image_url, is_available, featured });

    if (!category_id || !name?.trim() || price === undefined) {
      return NextResponse.json(
        { error: 'category_id, name, and price are required' },
        { status: 400 }
      );
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    // Default sort_order to end of category list
    let order = sort_order;
    if (order === undefined || order === null) {
      const { count } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category_id);
      order = count ?? 0;
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert([{
        category_id,
        name: name.trim(),
        description: description?.trim() ?? null,
        price: Number(price),
        image_url: image_url ?? null,
        is_available: is_available ?? true,
        featured: featured ?? false,
        sort_order: order,
        sizes: sizes ?? null,
        removable_ingredients: removable_ingredients ?? [],
        addons: addons ?? [],
      }])
      .select()
      .single();

    if (error) throw error;

    logger.info(CTX, 'Item created', { id: data.id, name: data.name, image_url: data.image_url });
    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/menu/items error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
