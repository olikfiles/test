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
