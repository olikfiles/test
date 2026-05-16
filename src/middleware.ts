import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminPrefix = `/hq`;

  // Only guard the admin portal
  if (!pathname.startsWith(adminPrefix)) {
    return NextResponse.next();
  }

  // Login page is always accessible (it's the auth entrypoint)
  if (pathname === `${adminPrefix}/login`) {
    return NextResponse.next();
  }

  // Check session cookie
  const session = request.cookies.get(SESSION_COOKIE);
  const password = process.env.ADMIN_PASSWORD ?? '';
  const isValid = session?.value === `admin:${password}`;

  if (!isValid) {
    // Unauthenticated access to /hq directly routes to home to hide the portal
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/hq/:path*'],
};
