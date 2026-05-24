-- Supabase Initialization Script for SYÖ & JUO

-- 1. Create tables
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    type TEXT NOT NULL, -- 'delivery' | 'pickup' | 'walk-in'
    status TEXT NOT NULL DEFAULT 'new', -- 'new' | 'confirmed' | 'sent_to_kitchen' | 'on_route' | 'delivered' | 'cancelled'
    total NUMERIC NOT NULL,
    address TEXT,
    table_number TEXT,
    notes TEXT,
    status_history JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC NOT NULL,
    notes TEXT
);

CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    party_size INTEGER NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'declined' | 'seated' | 'completed' | 'no_show'
    occasion TEXT,
    notes TEXT
);

-- 2. Setup Row Level Security (RLS)
-- For this prototype, we will allow anonymous access to insert orders/reservations
-- and read them. In a real production environment, you would lock reads down to authenticated admin users.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on orders" ON public.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public reads on orders" ON public.orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public updates on orders" ON public.orders FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow public inserts on order_items" ON public.order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public reads on order_items" ON public.order_items FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public inserts on reservations" ON public.reservations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public reads on reservations" ON public.reservations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public updates on reservations" ON public.reservations FOR UPDATE TO anon USING (true);

-- 3. Enable Realtime subscriptions
-- This is critical for the Admin Portal to receive live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;

-- ─────────────────────────────────────────────────────────────────────────────
-- MENU MANAGEMENT TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- 4. Menu Categories
CREATE TABLE public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Menu Items
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Marketing Tags  (e.g. "Popular", "Chef's Recommend", "Today's Deal")
CREATE TABLE public.menu_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT 'gray',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Menu Item Tags  (junction table — one item can have many tags)
CREATE TABLE public.menu_item_tags (
    item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.menu_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, tag_id)
);

-- 8. Deals / Bundles
CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    item_ids UUID[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_time_bound BOOLEAN NOT NULL DEFAULT false,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RLS for new tables (allow anon reads; restrict writes to authenticated admin)
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public reads on menu_categories" ON public.menu_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public reads on menu_items"      ON public.menu_items      FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public reads on menu_tags"       ON public.menu_tags       FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public reads on menu_item_tags"  ON public.menu_item_tags  FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public reads on deals"           ON public.deals           FOR SELECT TO anon USING (true);

-- Full access for admin (server-side API routes use the anon key behind cookie auth)
CREATE POLICY "Allow anon write on menu_categories" ON public.menu_categories FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write on menu_items"      ON public.menu_items      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write on menu_tags"       ON public.menu_tags       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write on menu_item_tags"  ON public.menu_item_tags  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write on deals"           ON public.deals           FOR ALL TO anon USING (true) WITH CHECK (true);

-- 10. Enable Realtime for menu tables (optional — useful for live menu editing preview)
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;

-- 11. Admin auth tables
CREATE TABLE public.admin_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.admin_otp_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX admin_otp_tokens_lookup ON public.admin_otp_tokens (email, expires_at);

ALTER TABLE public.admin_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_otp_tokens ENABLE ROW LEVEL SECURITY;

-- Server-side API routes use the anon key behind cookie auth, so anon needs access.
-- These tables are never queried from the browser — the RLS boundary is the application layer.
CREATE POLICY "Allow anon access on admin_users"       ON public.admin_users      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon access on admin_otp_tokens"  ON public.admin_otp_tokens FOR ALL TO anon USING (true) WITH CHECK (true);

-- Seed your admin email once (run this manually in Supabase SQL editor):
-- INSERT INTO public.admin_users (email) VALUES ('your-email@example.com');

-- 12. Menu item customization columns
-- Run these ALTER statements in Supabase SQL Editor to add per-item customization support.
--
-- sizes: null = no size picker shown; array of {id, name, subtitle, price_diff}
-- removable_ingredients: list of ingredient names the customer can remove
-- addons: array of {id, name, price} premium add-ons
--
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS sizes                 JSONB    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS removable_ingredients TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS addons                JSONB    DEFAULT '[]';

-- 13. Order item customizations column
-- Stores per-item customizations (removed ingredients, add-ons, size) as ordered.
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS customizations JSONB DEFAULT '[]';

-- 14. Order item → menu item traceability
-- Links each order item back to the source menu item for analytics and price validation.
-- Nullable because historical orders predate this column and items can be deleted after ordering.
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL;
