import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'admin_session';

// Middleware runs in Edge runtime — use Web Crypto API (no Node crypto imports).
async function verifySessionCookie(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const dot = token.lastIndexOf('.');
  if (dot === -1) return false;
  const sessionId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!sessionId || !sig || sig.length % 2 !== 0) return false;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    // Hex-decode the signature stored in the cookie.
    const sigBytes = new Uint8Array(sig.length / 2);
    for (let i = 0; i < sig.length; i += 2) {
      sigBytes[i / 2] = parseInt(sig.slice(i, i + 2), 16);
    }
    return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(sessionId));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/hq')) return NextResponse.next();
  if (pathname === '/hq/login') return NextResponse.next();

  const cookie = request.cookies.get(SESSION_COOKIE);
  if (!cookie || !(await verifySessionCookie(cookie.value))) {
    // Redirect to home to avoid advertising the admin portal URL.
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/hq/:path*'],
};
