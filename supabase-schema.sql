-- ─────────────────────────────────────────────────────────────────────────────
-- SYÖ & JUO — Supabase Schema
-- Run this entire file once in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Orders ────────────────────────────────────────────────────────────────

CREATE TABLE public.orders (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    customer_name  TEXT        NOT NULL,
    customer_phone TEXT        NOT NULL,
    type           TEXT        NOT NULL,  -- 'delivery' | 'pickup' | 'walk-in'
    status         TEXT        NOT NULL DEFAULT 'new',
    -- 'new' | 'confirmed' | 'sent_to_kitchen' | 'on_route' | 'delivered' | 'cancelled'
    total          NUMERIC     NOT NULL,
    address        TEXT,
    table_number   TEXT,
    notes          TEXT,
    status_history JSONB       DEFAULT '[]'::jsonb
);

CREATE TABLE public.order_items (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id       UUID        REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id   UUID,       -- FK added after menu_items table exists (see below)
    name           TEXT        NOT NULL,  -- snapshot of item name at order time
    quantity       INTEGER     NOT NULL,
    price          NUMERIC     NOT NULL,  -- DB base price + customization upcharges
    customizations JSONB       DEFAULT '[]',
    -- [{ "name": "Large", "price": 6 }, { "name": "+ Truffle Oil", "price": 4 }]
    notes          TEXT
);


-- ── 2. Reservations ──────────────────────────────────────────────────────────

CREATE TABLE public.reservations (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    guest_name  TEXT        NOT NULL,
    guest_email TEXT        NOT NULL,
    guest_phone TEXT        NOT NULL,
    party_size  INTEGER     NOT NULL,
    date        DATE        NOT NULL,
    time        TEXT        NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'pending',
    -- 'pending' | 'confirmed' | 'declined' | 'seated' | 'completed' | 'no_show'
    occasion    TEXT,
    notes       TEXT
);


-- ── 3. Menu ──────────────────────────────────────────────────────────────────

CREATE TABLE public.menu_categories (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    sort_order INTEGER     NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.menu_items (
    id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id            UUID        REFERENCES public.menu_categories(id) ON DELETE CASCADE,
    name                   TEXT        NOT NULL,
    description            TEXT,
    price                  NUMERIC     NOT NULL,
    image_url              TEXT,
    is_available           BOOLEAN     NOT NULL DEFAULT true,
    featured               BOOLEAN     NOT NULL DEFAULT false,
    sort_order             INTEGER     NOT NULL DEFAULT 0,
    -- Customization fields — control what appears in the item modal
    sizes                  JSONB       DEFAULT NULL,
    -- null = no size picker | [{ "id", "name", "subtitle", "price_diff" }]
    removable_ingredients  TEXT[]      DEFAULT '{}',
    -- [] = section hidden | ["Tomato Sauce", "Mozzarella"]
    addons                 JSONB       DEFAULT '[]',
    -- [] = section hidden | [{ "id", "name", "price" }]
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Now that menu_items exists, add the FK on order_items
ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_menu_item_id_fkey
    FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE SET NULL;

CREATE TABLE public.menu_tags (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL UNIQUE,
    color      TEXT        NOT NULL DEFAULT 'gray',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.menu_item_tags (
    item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    tag_id  UUID REFERENCES public.menu_tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (item_id, tag_id)
);


-- ── 4. Deals / Bundles ───────────────────────────────────────────────────────

CREATE TABLE public.deals (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT        NOT NULL,
    description  TEXT,
    price        NUMERIC     NOT NULL,
    item_ids     UUID[]      NOT NULL DEFAULT '{}',
    is_active    BOOLEAN     NOT NULL DEFAULT true,
    is_time_bound BOOLEAN    NOT NULL DEFAULT false,
    start_date   DATE,
    end_date     DATE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ── 5. Admin Auth ────────────────────────────────────────────────────────────

CREATE TABLE public.admin_users (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT        UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.admin_otp_tokens (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT        NOT NULL,
    token_hash TEXT        NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN     DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX admin_otp_tokens_lookup ON public.admin_otp_tokens (email, expires_at);


-- ── 6. Row Level Security ────────────────────────────────────────────────────

ALTER TABLE public.orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_tags   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_otp_tokens ENABLE ROW LEVEL SECURITY;

-- Customer-facing tables: public reads + inserts
CREATE POLICY "anon: read orders"        ON public.orders       FOR SELECT TO anon USING (true);
CREATE POLICY "anon: insert orders"      ON public.orders       FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon: update orders"      ON public.orders       FOR UPDATE TO anon USING (true);

CREATE POLICY "anon: read order_items"   ON public.order_items  FOR SELECT TO anon USING (true);
CREATE POLICY "anon: insert order_items" ON public.order_items  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon: read reservations"  ON public.reservations FOR SELECT TO anon USING (true);
CREATE POLICY "anon: insert reservations" ON public.reservations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon: update reservations" ON public.reservations FOR UPDATE TO anon USING (true);

-- Menu tables: public reads; admin writes via service role (bypasses RLS)
CREATE POLICY "anon: read menu_categories" ON public.menu_categories FOR SELECT TO anon USING (true);
CREATE POLICY "anon: read menu_items"      ON public.menu_items      FOR SELECT TO anon USING (true);
CREATE POLICY "anon: read menu_tags"       ON public.menu_tags       FOR SELECT TO anon USING (true);
CREATE POLICY "anon: read menu_item_tags"  ON public.menu_item_tags  FOR SELECT TO anon USING (true);
CREATE POLICY "anon: read deals"           ON public.deals           FOR SELECT TO anon USING (true);

-- Admin API routes use the anon key with session-cookie auth, so anon needs write access.
-- The service role key used in admin routes bypasses RLS entirely anyway.
CREATE POLICY "anon: write menu_categories" ON public.menu_categories FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon: write menu_items"      ON public.menu_items      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon: write menu_tags"       ON public.menu_tags       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon: write menu_item_tags"  ON public.menu_item_tags  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon: write deals"           ON public.deals           FOR ALL TO anon USING (true) WITH CHECK (true);

-- Admin auth tables: anon access (never queried from the browser — app layer enforces auth)
CREATE POLICY "anon: access admin_users"      ON public.admin_users      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon: access admin_otp_tokens" ON public.admin_otp_tokens FOR ALL TO anon USING (true) WITH CHECK (true);


-- ── 7. Realtime ──────────────────────────────────────────────────────────────
-- Admin portal receives live order/reservation updates without polling

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;


-- ── 8. Seed admin user ───────────────────────────────────────────────────────
-- Replace with your actual admin email, then run this line separately

-- INSERT INTO public.admin_users (email) VALUES ('your-email@example.com');
