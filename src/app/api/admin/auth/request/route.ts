import { NextResponse } from 'next/server';
import { createHash, randomInt } from 'crypto';
import { Resend } from 'resend';
import { AdminOtpEmail } from '@/emails/AdminOtpEmail';
import { logger } from '@/lib/logger';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import * as React from 'react';

const CTX = 'admin-auth/request';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Always return the same shape so callers cannot enumerate valid admin emails.
const OK = NextResponse.json({ ok: true });

export async function POST(request: Request) {
  let email: string;
  try {
    const body = await request.json();
    email = (body.email ?? '').toLowerCase().trim();
  } catch {
    logger.warn(CTX, 'Invalid JSON body');
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    logger.warn(CTX, 'Missing or malformed email in request');
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  logger.info(CTX, `OTP requested for ${email}`);

  // Check the email is a registered admin.
  const { data: adminUser, error: dbError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .single();

  // PGRST116 = no rows found (email not registered) — expected, continue silently.
  // Any other error (e.g. PGRST125 = table doesn't exist) is a real DB problem.
  if (dbError && dbError.code !== 'PGRST116') {
    logger.error(CTX, 'DB error looking up admin_users', { code: dbError.code, message: dbError.message });
    return NextResponse.json({ error: 'Service error, please try again later' }, { status: 500 });
  }

  // Return OK regardless so callers cannot tell whether the email is registered.
  if (!adminUser) {
    logger.info(CTX, `Email not found in admin_users — returning silent OK`);
    return OK;
  }

  // Invalidate any previous unused tokens for this email.
  await supabase
    .from('admin_otp_tokens')
    .delete()
    .eq('email', email)
    .eq('used', false);

  // Generate a cryptographically secure 6-digit code.
  const otp = randomInt(100000, 1000000).toString();
  const tokenHash = createHash('sha256').update(otp).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: insertError } = await supabase
    .from('admin_otp_tokens')
    .insert({ email, token_hash: tokenHash, expires_at: expiresAt });

  if (insertError) {
    logger.error(CTX, 'Failed to insert OTP token', insertError);
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
  }

  if (resend) {
    const { error: emailError } = await resend.emails.send({
      from: 'SYÖ & JUO <onboarding@resend.dev>',
      to: email,
      subject: `Your admin login code: ${otp}`,
      react: React.createElement(AdminOtpEmail, { otp }),
    });
    if (emailError) logger.error(CTX, 'Resend failed', emailError);
    else logger.info(CTX, `OTP email sent to ${email}`);
  } else {
    logger.warn(CTX, `RESEND_API_KEY not set — OTP for ${email}: ${otp}`);
  }

  return OK;
}
