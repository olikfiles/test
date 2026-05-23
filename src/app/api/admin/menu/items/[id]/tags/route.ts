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

    const { error } = await supabase
      .from('menu_item_tags')
      .insert([{ item_id, tag_id }]);

    if (error) {
      // Primary key duplicate — tag already assigned
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
