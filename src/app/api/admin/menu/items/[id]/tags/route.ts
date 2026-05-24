import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

// POST /api/admin/menu/items/[id]/tags
// Assign a tag to a menu item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: item_id } = await params;
    const { tag_id } = await req.json();

    if (!tag_id) {
      return NextResponse.json({ error: 'tag_id is required' }, { status: 400 });
    }

    // Validate item exists
    const { data: item, error: itemError } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    // Validate tag exists
    const { data: tag, error: tagError } = await supabase
      .from('menu_tags')
      .select('id')
      .eq('id', tag_id)
      .single();

    if (tagError || !tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('menu_item_tags')
      .insert([{ item_id, tag_id }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Tag already assigned to this item' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/menu/items/[id]/tags error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
