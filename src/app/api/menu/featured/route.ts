import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/menu/featured
// Returns up to 6 featured menu items for the landing page.
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, description, price, image_url')
      .eq('featured', true)
      .eq('is_available', true)
      .order('sort_order')
      .limit(6);

    if (error) throw error;

    return NextResponse.json({ items: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ items: [] });
  }
}
