import { notFound } from 'next/navigation';
import DevLogsClient from './DevLogsClient';

// Server component — evaluated at request time.
// notFound() causes Next.js to render the 404 page in production,
// making this route completely invisible outside development.
export default function DevLogsPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <DevLogsClient />;
}
