import { NextResponse } from 'next/server';

// Replaced by /api/admin/auth/request + /api/admin/auth/verify (email OTP flow).
export async function POST() {
  return NextResponse.json({ error: 'This endpoint has been removed. Use /api/admin/auth/request.' }, { status: 410 });
}
