import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/menu/tags
// Returns all available marketing tags
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('menu_tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ tags: data ?? [] });
  } catch (err: any) {
    console.error('GET /api/menu/tags error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
