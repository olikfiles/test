import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual, randomUUID } from 'crypto';

export const SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE = parseInt(process.env.ADMIN_SESSION_MAX_AGE ?? '28800');

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET env var is not set');
  return s;
}

function signToken(sessionId: string): string {
  return createHmac('sha256', getSecret()).update(sessionId).digest('hex');
}

/** Creates a signed session token to store in the cookie. */
export function createSessionToken(): string {
  const sessionId = randomUUID();
  return `${sessionId}.${signToken(sessionId)}`;
}

/** Verifies a raw token string (splitting on the last dot). */
export function verifyToken(token: string): boolean {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return false;
  const sessionId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!sessionId || !sig) return false;
  try {
    const expected = signToken(sessionId);
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(sig, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Sets the session cookie on a NextResponse. */
export function setSessionCookie(response: { cookies: { set: Function } }): void {
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/** Verifies the session cookie from the current request context (server components / route handlers). */
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return false;
  try {
    return verifyToken(cookie.value);
  } catch {
    return false;
  }
}
