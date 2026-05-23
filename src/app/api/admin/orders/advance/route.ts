import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';
import { Resend } from 'resend';
import { OrderConfirmedEmail } from '@/emails/OrderConfirmedEmail';
import { logger } from '@/lib/logger';

const CTX = 'admin/orders/advance';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: NextRequest) {
  if (!await verifyAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, status, currentHistory } = await req.json();

    if (!id || !status) {
      logger.warn(CTX, 'Missing id or status');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    logger.info(CTX, `Advancing order ${id.slice(0, 8)} → ${status}`);

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

    if (error) { logger.error(CTX, 'DB update failed', { orderId: id, error: error.message }); throw error; }

    logger.info(CTX, `Order ${id.slice(0, 8)} updated to ${status}`);

    // 2. Send Email if the order was just confirmed
    if (status === 'confirmed' && order) {
      if (resend) {
        const { error: emailError } = await resend.emails.send({
          from: 'SYÖ & JUO <onboarding@resend.dev>',
          to: [order.customer_email || 'test@example.com'],
          subject: 'Your Order is Confirmed!',
          react: OrderConfirmedEmail({
            orderId: order.id,
            customerName: order.customer_name,
            type: order.type,
            items: order.order_items || [],
            total: order.total,
          }),
        });
        if (emailError) logger.error(CTX, 'Confirmation email failed', emailError);
        else logger.info(CTX, `Confirmation email sent for order ${id.slice(0, 8)}`);
      } else {
        logger.warn(CTX, `RESEND_API_KEY not set — skipping confirmation email for order ${id.slice(0, 8)}`);
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    logger.error(CTX, 'Unhandled error', { message: err.message });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
