import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { setSessionCookie } from '@/lib/admin-auth';
import { logger } from '@/lib/logger';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const CTX = 'admin-auth/verify';

export async function POST(request: Request) {
  let email: string, otp: string;
  try {
    const body = await request.json();
    email = (body.email ?? '').toLowerCase().trim();
    otp = String(body.otp ?? '').trim();
  } catch {
    logger.warn(CTX, 'Invalid JSON body');
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !otp) {
    logger.warn(CTX, 'Missing email or otp in request body');
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
  }

  logger.info(CTX, `Verification attempt for ${email}`);

  const tokenHash = createHash('sha256').update(otp).digest('hex');
  const now = new Date().toISOString();

  // Find a matching, unused, non-expired token.
  const { data: token, error: dbError } = await supabase
    .from('admin_otp_tokens')
    .select('id')
    .eq('email', email)
    .eq('token_hash', tokenHash)
    .eq('used', false)
    .gt('expires_at', now)
    .single();

  if (dbError) logger.debug(CTX, 'Token lookup db error', { code: dbError.code });

  if (!token) {
    logger.warn(CTX, `OTP verification failed for ${email} — invalid or expired`);
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  // Mark the token used so it cannot be replayed.
  await supabase.from('admin_otp_tokens').update({ used: true }).eq('id', token.id);

  logger.info(CTX, `OTP verified — session created for ${email}`);

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response);
  return response;
}
