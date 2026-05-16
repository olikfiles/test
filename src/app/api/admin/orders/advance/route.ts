import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { OrderConfirmedEmail } from '@/emails/OrderConfirmedEmail';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: NextRequest) {
  try {
    const { id, status, currentHistory } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update Database
    const history = currentHistory || [];
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status, 
        status_history: [...history, { status, at: new Date().toISOString() }] 
      })
      .eq('id', id)
      .select('*, order_items(*)')
      .single();

    if (error) throw error;

    // 2. Send Email if the order was just confirmed
    if (status === 'confirmed' && order) {
      
      // Calculate total from items if needed, or use order.total
      
      if (resend) {
        await resend.emails.send({
          from: 'SYÖ & JUO <onboarding@resend.dev>', // Default Resend test address
          to: [order.customer_email || 'test@example.com'], // Fallback if no email is collected
          subject: 'Your Order is Confirmed!',
          react: OrderConfirmedEmail({
            orderId: order.id,
            customerName: order.customer_name,
            type: order.type,
            items: order.order_items || [],
            total: order.total,
          }),
        });
      } else {
        // Fallback mock for development
        console.log('\n=============================================');
        console.log(`📧 MOCK EMAIL SENT: Order Confirmed`);
        console.log(`To: ${order.customer_name} (Order #${order.id.slice(0,6)})`);
        console.log(`Status: Add RESEND_API_KEY to send real emails.`);
        console.log('=============================================\n');
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error('Order Advance Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
