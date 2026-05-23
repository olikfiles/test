'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Deal {
  id: string;
  name: string;
  description: string | null;
  price: number;
  item_ids: string[];
  is_active: boolean;
  is_time_bound: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export const dealKeys = {
  all: ['deals'] as const,
};

// ─── Customer hook ────────────────────────────────────────────────────────────

export function useDeals() {
  return useQuery({
    queryKey: dealKeys.all,
    queryFn: async () => {
      const res = await fetch('/api/menu/deals');
      if (!res.ok) throw new Error('Failed to load deals');
      const data = await res.json();
      return data.deals as Deal[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────

export function useAdminDeals() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: dealKeys.all });

  const create = useMutation({
    mutationFn: async (body: {
      name: string;
      description?: string;
      price: number;
      item_ids: string[];
      is_time_bound?: boolean;
      start_date?: string;
      end_date?: string;
    }) => {
      const res = await fetch('/api/admin/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, ...body }: Partial<Deal> & { id: string }) => {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/deals/${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: invalidate,
  });

  return { create, update, remove, toggle };
}
