'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MenuTag {
  id: string;
  name: string;
  color: string;
}

export interface ItemSize {
  id: string;
  name: string;
  subtitle: string;
  price_diff: number;
}

export interface ItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  featured: boolean;
  sort_order: number;
  tags: MenuTag[];
  sizes: ItemSize[] | null;
  removable_ingredients: string[];
  addons: ItemAddon[];
}

export interface MenuCategory {
  id: string;
  name: string;
  sort_order: number;
  items: MenuItem[];
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const menuKeys = {
  categories: ['menu', 'categories'] as const,
  items: (categoryId?: string) => ['menu', 'items', categoryId ?? 'all'] as const,
  tags: ['menu', 'tags'] as const,
  featured: ['menu', 'featured'] as const,
};

// ─── Customer Hooks ───────────────────────────────────────────────────────────

export function useMenuCategories() {
  return useQuery({
    queryKey: menuKeys.categories,
    queryFn: async () => {
      const res = await fetch('/api/menu/categories');
      if (!res.ok) throw new Error('Failed to load menu');
      const data = await res.json();
      return data.categories as MenuCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMenuItems(categoryId?: string) {
  return useQuery({
    queryKey: menuKeys.items(categoryId),
    queryFn: async () => {
      const url = categoryId
        ? `/api/menu/items?category_id=${categoryId}`
        : '/api/menu/items';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load items');
      const data = await res.json();
      return data.items as MenuItem[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: menuKeys.tags,
    queryFn: async () => {
      const res = await fetch('/api/menu/tags');
      if (!res.ok) throw new Error('Failed to load tags');
      const data = await res.json();
      return data.tags as MenuTag[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export interface FeaturedItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
}

export function useFeaturedItems() {
  return useQuery({
    queryKey: menuKeys.featured,
    queryFn: async () => {
      const res = await fetch('/api/menu/featured');
      if (!res.ok) throw new Error('Failed to load featured items');
      const data = await res.json();
      return data.items as FeaturedItem[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Admin Hooks ──────────────────────────────────────────────────────────────

export function useAdminCategories() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: async (body: { name: string; sort_order?: number }) => {
      const res = await fetch('/api/admin/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.categories }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name?: string; sort_order?: number }) => {
      const res = await fetch(`/api/admin/menu/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.categories }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/menu/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.categories }),
  });

  return { create, update, remove };
}

export function useAdminItems() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['menu', 'categories'] });
    qc.invalidateQueries({ queryKey: ['menu', 'items'] });
  };

  const create = useMutation({
    mutationFn: async (body: Partial<MenuItem> & { category_id: string; name: string; price: number }) => {
      const res = await fetch('/api/admin/menu/items', {
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
    mutationFn: async ({ id, ...body }: Partial<MenuItem> & { id: string }) => {
      const res = await fetch(`/api/admin/menu/items/${id}`, {
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
      const res = await fetch(`/api/admin/menu/items/${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const res = await fetch(`/api/admin/menu/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: invalidate,
  });

  return { create, update, remove, toggleAvailability };
}

export function useAdminTags() {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: async (body: { name: string; color?: string }) => {
      const res = await fetch('/api/admin/menu/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: menuKeys.tags }),
  });

  return { create };
}

export function useAdminItemTags(itemId: string) {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['menu', 'categories'] });
    qc.invalidateQueries({ queryKey: ['menu', 'items'] });
  };

  const assign = useMutation({
    mutationFn: async (tag_id: string) => {
      const res = await fetch(`/api/admin/menu/items/${itemId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_id }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (tagId: string) => {
      const res = await fetch(`/api/admin/menu/items/${itemId}/tags/${tagId}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json();
    },
    onSuccess: invalidate,
  });

  return { assign, remove };
}
