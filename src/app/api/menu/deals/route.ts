import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/menu/deals
// Returns currently active deals (all-time staples + time-bound within date range)
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      // PGRST125 = table doesn't exist yet (schema not run). Return empty gracefully.
      if (error.code === 'PGRST125') {
        console.warn('GET /api/menu/deals: deals table not found — run supabase-schema.sql');
        return NextResponse.json({ deals: [] });
      }
      throw error;
    }

    // Filter time-bound deals to only those within their date range
    const activeDeals = (data ?? []).filter((deal: any) => {
      if (!deal.is_time_bound) return true;
      const afterStart = !deal.start_date || deal.start_date <= today;
      const beforeEnd = !deal.end_date || deal.end_date >= today;
      return afterStart && beforeEnd;
    });

    return NextResponse.json({ deals: activeDeals });
  } catch (err: any) {
    console.error('GET /api/menu/deals error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
