import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE = parseInt(process.env.ADMIN_SESSION_MAX_AGE ?? '28800');

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body as { username: string; password: string };

  const expectedUsername = process.env.ADMIN_USERNAME ?? '';
  const expectedPassword = process.env.ADMIN_PASSWORD ?? '';

  if (
    username !== expectedUsername ||
    password !== expectedPassword ||
    !expectedUsername ||
    !expectedPassword
  ) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, `admin:${expectedPassword}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return response;
}
