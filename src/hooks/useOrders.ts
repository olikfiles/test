'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface OrderTimer {
  remaining_seconds: number;
  estimated_minutes: number;
  progress_percent: number;
}

export interface OrderStatus {
  id: string;
  status: string;
  type: string;
  customer_name: string;
  total: number;
  items: OrderItem[];
  status_history: { status: string; at: string }[];
  created_at: string;
  timer: OrderTimer | null;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  type: 'delivery' | 'pickup' | 'walk-in';
  address?: string;
  notes?: string;
  items: { name: string; price: number; quantity: number; notes?: string }[];
}

// Statuses that mean the order is no longer in progress
const TERMINAL_STATUSES = ['delivered', 'completed', 'cancelled'];

// ─── Create Order ─────────────────────────────────────────────────────────────

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? 'Failed to place order');
      }
      return res.json() as Promise<{ success: boolean; order: { id: string; total: number; type: string } }>;
    },
  });
}

// ─── Order Status (with polling) ──────────────────────────────────────────────

export function useOrderStatus(id: string | null) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error ?? 'Order not found');
      }
      return res.json() as Promise<OrderStatus>;
    },
    enabled: !!id,
    staleTime: 0,
    // Poll every 5 seconds until the order reaches a terminal state
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || TERMINAL_STATUSES.includes(status)) return false;
      return 5000;
    },
  });
}
