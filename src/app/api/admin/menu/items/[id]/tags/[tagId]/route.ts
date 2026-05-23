import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

// DELETE /api/admin/menu/items/[id]/tags/[tagId]
// Remove a tag from a menu item
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: item_id, tagId: tag_id } = await params;

    const { error } = await supabase
      .from('menu_item_tags')
      .delete()
      .eq('item_id', item_id)
      .eq('tag_id', tag_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/admin/menu/items/[id]/tags/[tagId] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
