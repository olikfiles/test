import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { ReservationConfirmedEmail } from '@/emails/ReservationConfirmedEmail';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: NextRequest) {
  try {
    const { id, action, reason } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const statusMap: Record<string, string> = { 
      confirm: 'confirmed', 
      decline: 'declined', 
      seat: 'seated', 
      no_show: 'no_show' 
    };
    
    const newStatus = statusMap[action];
    const updates: any = { status: newStatus };
    if (action === 'decline' && reason) updates.notes = `DECLINED REASON: ${reason}`;

    // 1. Update Database
    const { data: reservation, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    // 2. Send Email if the reservation was just confirmed
    if (action === 'confirm' && reservation) {
      
      if (resend) {
        await resend.emails.send({
          from: 'SYÖ & JUO Reservations <reservations@syojuo.fi>', // Requires a verified domain in Resend
          to: [reservation.guest_email],
          subject: 'Your Reservation is Confirmed!',
          react: ReservationConfirmedEmail({
            guestName: reservation.guest_name,
            date: reservation.date,
            time: reservation.time,
            partySize: reservation.party_size,
            occasion: reservation.occasion,
          }),
        });
      } else {
        // Fallback mock for development
        console.log('\n=============================================');
        console.log(`📧 MOCK EMAIL SENT: Reservation Confirmed`);
        console.log(`To: ${reservation.guest_email} (${reservation.guest_name})`);
        console.log(`Date: ${reservation.date} at ${reservation.time}`);
        console.log(`Status: Add RESEND_API_KEY to send real emails.`);
        console.log('=============================================\n');
      }
    }

    return NextResponse.json({ success: true, reservation });
  } catch (err: any) {
    console.error('Reservation Action Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
