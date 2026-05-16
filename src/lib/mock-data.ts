// ─── Typed Mock Data ──────────────────────────────────────────────────────────
// All data here mirrors the intended Supabase schema.
// Swap these arrays for Supabase client queries when the DB is ready.

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'sent_to_kitchen'
  | 'on_route'
  | 'delivered'
  | 'cancelled';

export type OrderType = 'delivery' | 'pickup' | 'walk-in';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'seated'
  | 'completed'
  | 'no_show';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  address?: string;
  table_number?: string;
  notes?: string;
  status_history: { status: OrderStatus; at: string }[];
}

export interface Reservation {
  id: string;
  created_at: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  party_size: number;
  date: string;
  time: string;
  status: ReservationStatus;
  occasion?: string;
  notes?: string;
}

// ─── Mock Orders ──────────────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    customer_name: 'Aino Mäkinen',
    customer_phone: '+358 40 111 2233',
    type: 'delivery',
    status: 'new',
    items: [
      { name: 'Nordic Margherita', quantity: 1, price: 18 },
      { name: 'Truffle Forager', quantity: 1, price: 24 },
    ],
    total: 42,
    address: 'Mannerheimintie 12, 00100 Helsinki',
    status_history: [{ status: 'new', at: new Date(Date.now() - 1000 * 60 * 4).toISOString() }],
  },
  {
    id: 'ORD-002',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    customer_name: 'Mikael Lehtonen',
    customer_phone: '+358 40 222 3344',
    type: 'pickup',
    status: 'confirmed',
    items: [
      { name: 'Artisan Charcuterie', quantity: 2, price: 32, notes: 'No olives' },
    ],
    total: 64,
    status_history: [
      { status: 'new', at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { status: 'confirmed', at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
    ],
  },
  {
    id: 'ORD-003',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    customer_name: 'Sophia Virtanen',
    customer_phone: '+358 40 333 4455',
    type: 'walk-in',
    status: 'sent_to_kitchen',
    table_number: 'Table 7',
    items: [
      { name: 'Pan-Seared Sea Bass', quantity: 2, price: 42 },
      { name: 'Burrata & Heritage Tomato', quantity: 1, price: 18 },
    ],
    total: 102,
    status_history: [
      { status: 'new', at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { status: 'confirmed', at: new Date(Date.now() - 1000 * 60 * 28).toISOString() },
      { status: 'sent_to_kitchen', at: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
    ],
  },
  {
    id: 'ORD-004',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    customer_name: 'Lars Eriksson',
    customer_phone: '+358 40 444 5566',
    type: 'delivery',
    status: 'on_route',
    items: [
      { name: 'The Nordic Journey', quantity: 1, price: 120 },
    ],
    total: 120,
    address: 'Aleksanterinkatu 44, 00100 Helsinki',
    notes: 'Gate code: 1234',
    status_history: [
      { status: 'new', at: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
      { status: 'confirmed', at: new Date(Date.now() - 1000 * 60 * 48).toISOString() },
      { status: 'sent_to_kitchen', at: new Date(Date.now() - 1000 * 60 * 46).toISOString() },
      { status: 'on_route', at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    ],
  },
  {
    id: 'ORD-005',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    customer_name: 'Emma Korhonen',
    customer_phone: '+358 40 555 6677',
    type: 'delivery',
    status: 'delivered',
    items: [
      { name: 'Dry-Aged Ribeye', quantity: 1, price: 58 },
      { name: 'Tuna Tartare', quantity: 1, price: 24 },
    ],
    total: 82,
    address: 'Bulevardi 5, 00120 Helsinki',
    status_history: [
      { status: 'new', at: new Date(Date.now() - 1000 * 60 * 100).toISOString() },
      { status: 'confirmed', at: new Date(Date.now() - 1000 * 60 * 98).toISOString() },
      { status: 'sent_to_kitchen', at: new Date(Date.now() - 1000 * 60 * 95).toISOString() },
      { status: 'on_route', at: new Date(Date.now() - 1000 * 60 * 93).toISOString() },
      { status: 'delivered', at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    ],
  },
];

// ─── Mock Reservations ────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

export const mockReservations: Reservation[] = [
  {
    id: 'RES-001',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    guest_name: 'Paavo Leinonen',
    guest_email: 'paavo@example.fi',
    guest_phone: '+358 40 100 2000',
    party_size: 2,
    date: fmt(today),
    time: '19:00',
    status: 'confirmed',
    occasion: 'anniversary',
  },
  {
    id: 'RES-002',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    guest_name: 'Katariina Mäki',
    guest_email: 'kati@example.fi',
    guest_phone: '+358 40 200 3000',
    party_size: 4,
    date: fmt(today),
    time: '20:30',
    status: 'pending',
    notes: 'One guest is vegetarian',
  },
  {
    id: 'RES-003',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    guest_name: 'Jonas Bergström',
    guest_email: 'jonas@example.se',
    guest_phone: '+46 70 123 4567',
    party_size: 6,
    date: fmt(today),
    time: '21:00',
    status: 'pending',
    notes: 'Birthday dinner — please have a dessert plate ready',
    occasion: 'birthday',
  },
  {
    id: 'RES-004',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    guest_name: 'Maria Svensson',
    guest_email: 'maria@example.se',
    guest_phone: '+46 70 234 5678',
    party_size: 2,
    date: fmt(tomorrow),
    time: '18:30',
    status: 'confirmed',
  },
  {
    id: 'RES-005',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    guest_name: 'Thomas Nieminen',
    guest_email: 'thomas@example.fi',
    guest_phone: '+358 40 300 4000',
    party_size: 3,
    date: fmt(dayAfter),
    time: '20:00',
    status: 'pending',
  },
  {
    id: 'RES-006',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    guest_name: 'Liisa Hämäläinen',
    guest_email: 'liisa@example.fi',
    guest_phone: '+358 40 400 5000',
    party_size: 8,
    date: fmt(nextWeek),
    time: '19:30',
    status: 'confirmed',
    occasion: 'business',
    notes: 'Corporate event — please arrange for a private area if possible',
  },
];
