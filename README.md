# SYÖ & JUO

A full-stack restaurant web application built with Next.js 15 and Supabase. Supports delivery, pickup, and dine-in ordering, table reservations, a live admin portal, and a full menu management system.

---
a
## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Email | Resend |
| State | Zustand + TanStack React Query |

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier is enough)
- A [Resend](https://resend.com) account (optional — emails fall back to console logs)

---

## 1. Supabase Project Setup

### Create a project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**, give it a name, choose a region, set a database password
3. Wait for the project to finish provisioning (~1 minute)

### Run the schema

1. In your Supabase dashboard, open **SQL Editor**
2. Click **New query**
3. Paste the entire contents of [`supabase-schema.sql`](./supabase-schema.sql) and click **Run**

This creates all tables, indexes, RLS policies, and enables Realtime in one shot.

### Seed your admin user

Still in the SQL Editor, run this with your own email:

```sql
INSERT INTO public.admin_users (email) VALUES ('your-email@example.com');
```

This is the email address the OTP login code will be sent to when you access `/hq`.

### Set up Storage

1. In your Supabase dashboard, open **Storage**
2. Click **New bucket**
3. Name it exactly `menu-images`
4. Toggle **Public bucket** to ON
5. Click **Save**

> The bucket must be public so uploaded image URLs render correctly in the browser.

### Get your API keys

Go to **Project Settings → API** and copy:

| Key | Where to find it |
|---|---|
| Project URL | Settings → API → Project URL |
| Publishable (anon) key | Settings → API → Project API keys → `anon / public` |
| Service role key | Settings → API → Secret keys (or `service_role`) |

---

## 2. Local Setup

### Clone and install

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

### Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Server-side only — never prefix with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin session — generate with: openssl rand -hex 32
ADMIN_SESSION_SECRET=your-long-random-secret
ADMIN_SESSION_MAX_AGE=28800

# Optional — leave blank to print emails to the console instead
RESEND_API_KEY=
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 3. How the App Communicates with Supabase

The app uses two separate Supabase clients defined in `src/lib/supabase.ts`:

```
┌────────────────────────────────────────────────────────────┐
│                        Browser                             │
│                                                            │
│  Customer pages  ──► supabase (anon key)                   │
│  Cart / Checkout ──► POST /api/orders  ──► supabaseAdmin   │
└───────────────────────────────┬────────────────────────────┘
                                │ HTTP
┌────────��──────────────────────▼────────���───────────────────┐
│                    Next.js API Routes                       │
│                                                            │
│  /api/menu/*         ──► supabase (anon key, read-only)    │
│  /api/orders/*       ──► supabaseAdmin (service role)      │
��  /api/admin/**       ──► supabaseAdmin (service role)      │
└───────────────────────────────┬──────────────��─────────────┘
                                │ Supabase JS SDK
┌─────���─────────────────────────▼────────────────────────────┐
│                       Supabase                             │
│                                                            │
│  PostgreSQL  ·  Storage  ·  Realtime  ·  Auth (OTP only)  │
└────────────────────────────────────────────────────────────┘
```

### Anon key (`supabase`)

- Used in public API routes (`/api/menu/*`, `/api/fulfillment/*`)
- Safe to use — limited to SELECT on public tables via RLS
- Also used directly from the browser for reservation inserts (`/reserve` page)

### Service role key (`supabaseAdmin`)

- Used only in server-side API routes (never imported in client components)
- Bypasses RLS entirely — can read, write, and delete anything
- Required for all admin operations and order creation
- Never exposed to the browser

### Realtime

The admin portal (`/hq/orders`, `/hq/reservations`) subscribes to Postgres changes via Supabase Realtime. New orders and reservation updates appear live without page refreshes. This works because the schema enables Realtime on `orders` and `reservations` tables.

---

## 4. Database Schema Overview

```
menu_categories
    └── menu_items ──────────────── menu_item_tags ── menu_tags
            │
            └── (referenced by) order_items
                                        └── orders

reservations

deals

admin_users
admin_otp_tokens
```

| Table | Purpose |
|---|---|
| `orders` | Customer orders with status, totals, and status history |
| `order_items` | Individual line items — stores name/price snapshot + customizations |
| `reservations` | Table reservation requests from the `/reserve` page |
| `menu_categories` | Top-level groupings shown in the menu nav |
| `menu_items` | Individual dishes with sizes, removable ingredients, and add-ons |
| `menu_tags` | Marketing labels (Popular, Chef's Pick, etc.) |
| `menu_item_tags` | Junction table linking items to tags |
| `deals` | Promotional bundles shown on the landing page |
| `admin_users` | Whitelisted admin email addresses |
| `admin_otp_tokens` | One-time login codes (SHA-256 hashed, 10-minute expiry) |

---

## 5. Admin Portal

Access the admin portal at `/hq`. On first visit you will be asked for your email. A 6-digit OTP is sent to it (or printed to the server console if `RESEND_API_KEY` is not set).

| Section | URL | What it does |
|---|---|---|
| Orders | `/hq/orders` | Live order feed, advance status, view customizations |
| Reservations | `/hq/reservations` | Confirm, decline, seat, or mark no-show |
| Menu | `/hq/menu` | Manage categories, items, tags, images |
| Deals | `/hq/deals` | Create and toggle promotional bundles |

---

## 6. Key Directories

```
src/
├── app/
│   ├── api/              # All API route handlers
│   │   ├── menu/         # Public menu endpoints
│   │   ├── orders/       # Place + track orders
│   │   ├── fulfillment/  # Wait time estimates
│   │   └── admin/        # Admin-only endpoints (auth-gated)
│   ��── hq/               # Admin portal pages
│   ├── menu/             # Customer menu page
│   ├── checkout/         # Checkout page
│   └── order/[id]/       # Order tracking page
├── components/           # Shared UI components
├── hooks/                # React Query data hooks
├── lib/
│   ├── supabase.ts       # Supabase client instances
│   ├── admin-auth.ts     # OTP session verification
│   ├── logger.ts         # Structured dev logger
│   └── fees.ts           # Delivery + service fee constants
└── store/                # Zustand stores (cart, order mode)
```
