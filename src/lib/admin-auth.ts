import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';
const SESSION_TOKEN = process.env.ADMIN_PASSWORD ?? 'fallback_not_secure';

/**
 * Verifies the admin session cookie on the server side.
 * Returns true if the session is valid.
 */
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session) return false;
  // Simple token comparison — upgrade to signed JWT for production
  return session.value === `admin:${SESSION_TOKEN}`;
}

/**
 * The name of the session cookie.
 */
export { SESSION_COOKIE };
