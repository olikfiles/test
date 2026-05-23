'use client';

import { useQuery } from '@tanstack/react-query';

export interface WaitTimeEntry {
  min: number;
  max: number;
  label: string;
}

export interface WaitTimes {
  delivery: WaitTimeEntry;
  pickup: WaitTimeEntry;
}

export function useWaitTimes() {
  return useQuery({
    queryKey: ['wait-times'],
    queryFn: async () => {
      const res = await fetch('/api/fulfillment/wait-times');
      if (!res.ok) throw new Error('Failed to load wait times');
      const data = await res.json();
      return data.wait_times as WaitTimes;
    },
    staleTime: 60 * 1000,       // consider stale after 1 minute
    refetchInterval: 60 * 1000, // auto-refresh every 1 minute
  });
}
