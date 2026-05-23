import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// This endpoint is intentionally only useful in development.
// In production it always returns 403 and the buffer is never populated.
function guardProd() {
  if (process.env.NODE_ENV !== 'development') {
    // Return 404 so the endpoint appears to not exist in production.
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return null;
}

export async function GET() {
  const block = guardProd();
  if (block) return block;
  return NextResponse.json({ logs: logger.getBuffer() });
}

export async function DELETE() {
  const block = guardProd();
  if (block) return block;
  logger.clearBuffer();
  return NextResponse.json({ ok: true });
}
