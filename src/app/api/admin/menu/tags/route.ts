import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

// POST /api/admin/menu/tags
// Create a new marketing tag (e.g. "Popular", "Chef's Recommend", "Today's Deal")
export async function POST(req: NextRequest) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, color } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('menu_tags')
      .insert([{ name: name.trim(), color: color ?? 'gray' }])
      .select()
      .single();

    if (error) {
      // Unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A tag with this name already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ tag: data }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/admin/menu/tags error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
