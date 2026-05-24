# SYÖ & JUO — API Reference

**Base URL:** `https://your-domain.com`  
**Stack:** Next.js 15 App Router · Supabase · TypeScript

All endpoints return `application/json`. Errors always return `{ "error": "message" }` with an appropriate HTTP status code.

Admin endpoints require a valid session cookie (`admin_session`) obtained through the OTP login flow. Requests without it return `401 Unauthorized`.

---

## Table of Contents

- [Customer APIs](#customer-apis)
  - [Menu — Categories](#get-apimenuategories)
  - [Menu — Items](#get-apimentuitems)
  - [Menu — Featured Items](#get-apimenufeatured)
  - [Menu — Tags](#get-apimenags)
  - [Menu — Deals](#get-apimenudeals)
  - [Orders — Place Order](#post-apiorders)
  - [Orders — Track Order](#get-apiordersid)
  - [Fulfillment — Wait Times](#get-apifulfillmentwait-times)
- [Admin APIs](#admin-apis)
  - [Auth — Request OTP](#post-apiadminauthrequest)
  - [Auth — Verify OTP](#post-apiadminauthverify)
  - [Auth — Logout](#post-apiadminlogout)
  - [Menu — Create Category](#post-apiadminmenucategories)
  - [Menu — Update Category](#put-apiadminmenucategoriesid)
  - [Menu — Delete Category](#delete-apiadminmenucategoriesid)
  - [Menu — Create Item](#post-apiadminmenuitems)
  - [Menu — Update Item](#put-apiadminmenuitemsid)
  - [Menu — Delete Item](#delete-apiadminmenuitemsid)
  - [Menu — Create Tag](#post-apiadminmenutags)
  - [Menu — Assign Tag to Item](#post-apiadminmenuitemsidtags)
  - [Menu — Remove Tag from Item](#delete-apiadminmenuitemsidtagstagid)
  - [Deals — Create Deal](#post-apiadmindeals)
  - [Deals — Update Deal](#put-apiadmindealsid)
  - [Deals — Delete Deal](#delete-apiadmindealsid)
  - [Orders — Advance Status](#post-apiadminordersadvance)
  - [Reservations — Take Action](#post-apiadminreservationsaction)
  - [Upload — Menu Image](#post-apiadminupload)

---

## Customer APIs

These endpoints are public — no authentication required.

---

### `GET /api/menu/categories`

Returns all menu categories with their available items and tags nested inside each category. This is the primary endpoint for rendering the full menu.

**Query params:** none

**Response `200`**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Pizzas",
      "sort_order": 0,
      "items": [
        {
          "id": "uuid",
          "category_id": "uuid",
          "name": "Nordic Margherita",
          "description": "Heritage tomatoes, fresh basil, burnt mozzarella",
          "price": 18.00,
          "image_url": "https://…/menu-images/pizza.avif",
          "is_available": true,
          "featured": true,
          "sort_order": 0,
          "sizes": [
            { "id": "regular", "name": "Regular", "subtitle": "Perfect for one", "price_diff": 0 },
            { "id": "large",   "name": "Large",   "subtitle": "To share",        "price_diff": 6 }
          ],
          "removable_ingredients": ["Tomato Sauce", "Mozzarella", "Fresh Basil"],
          "addons": [
            { "id": "truffle", "name": "Truffle Oil", "price": 4.00 }
          ],
          "tags": [
            { "id": "uuid", "name": "Popular", "color": "red" }
          ]
        }
      ]
    }
  ]
}
```

> Only items where `is_available = true` are included.

---

### `GET /api/menu/items`

Returns menu items, optionally filtered by category. Includes tags and parent category name on each item.

**Query params**

| Param | Type | Default | Description |
|---|---|---|---|
| `category_id` | `uuid` | — | Filter to a specific category |
| `available_only` | `boolean` | `true` | Pass `false` to include unavailable items |

**Response `200`**
```json
{
  "items": [
    {
      "id": "uuid",
      "category_id": "uuid",
      "name": "Nordic Margherita",
      "description": "Heritage tomatoes, fresh basil, burnt mozzarella",
      "price": 18.00,
      "image_url": "https://…/menu-images/pizza.avif",
      "is_available": true,
      "featured": true,
      "sort_order": 0,
      "sizes": [ { "id": "regular", "name": "Regular", "subtitle": "Perfect for one", "price_diff": 0 } ],
      "removable_ingredients": ["Tomato Sauce", "Mozzarella"],
      "addons": [ { "id": "truffle", "name": "Truffle Oil", "price": 4.00 } ],
      "tags": [ { "id": "uuid", "name": "Popular", "color": "red" } ],
      "category": { "id": "uuid", "name": "Pizzas" }
    }
  ]
}
```

---

### `GET /api/menu/featured`

Returns up to 6 items marked as featured (`featured = true` and `is_available = true`), ordered by `sort_order`. Used on the landing page Signature section.

**Response `200`**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Nordic Margherita",
      "description": "Heritage tomatoes, fresh basil, burnt mozzarella",
      "price": 18.00,
      "image_url": "https://…/menu-images/pizza.avif"
    }
  ]
}
```

---

### `GET /api/menu/tags`

Returns all marketing tags (e.g. Popular, Chef's Recommend) sorted alphabetically.

**Response `200`**
```json
{
  "tags": [
    { "id": "uuid", "name": "Popular", "color": "red" },
    { "id": "uuid", "name": "New",     "color": "green" }
  ]
}
```

---

### `GET /api/menu/deals`

Returns currently active deals. Time-bound deals are only returned when today's date falls within their `start_date`–`end_date` window. Used on the landing page and deals section.

**Response `200`**
```json
{
  "deals": [
    {
      "id": "uuid",
      "name": "Weekend Feast",
      "description": "Pizza + Tiramisu bundle",
      "price": 28.00,
      "item_ids": ["uuid", "uuid"],
      "is_active": true,
      "is_time_bound": true,
      "start_date": "2026-05-24",
      "end_date": "2026-05-25",
      "created_at": "2026-05-20T10:00:00Z"
    }
  ]
}
```

---

### `POST /api/orders`

Places a new customer order. Validates every item against the database (existence + availability), calculates totals server-side using DB prices, and stores a full customization snapshot per item.

**Request body**
```json
{
  "customer_name": "Aino Virtanen",
  "customer_phone": "+358 40 123 4567",
  "type": "delivery",
  "address": "Mannerheimintie 12, Helsinki",
  "notes": "Leave at the door",
  "items": [
    {
      "menu_item_id": "uuid",
      "name": "Nordic Margherita (Large)",
      "price": 24.00,
      "quantity": 2,
      "customizations": [
        { "name": "Large", "price": 6.00 },
        { "name": "+ Truffle Oil", "price": 4.00 },
        { "name": "- No Tomato Sauce", "price": 0 }
      ],
      "notes": "Extra crispy please"
    }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `customer_name` | Yes | |
| `customer_phone` | Yes | |
| `type` | Yes | `"delivery"` \| `"pickup"` \| `"walk-in"` |
| `address` | Yes for delivery | Required when `type = "delivery"` |
| `notes` | No | Order-level note shown to kitchen |
| `items[].menu_item_id` | Yes | Must reference an existing, available menu item — returns `404` if not found, `400` if unavailable |
| `items[].name` | Yes | Snapshot of the item name (including size variant) |
| `items[].price` | Yes | Client-provided price — **ignored server-side**; actual price is taken from the database |
| `items[].quantity` | Yes | |
| `items[].customizations` | No | Array of `{ name, price }` — prices are added on top of the DB base price |
| `items[].notes` | No | Per-item instruction shown in admin order detail |

> **Price integrity:** The `price` field in each item is ignored. The server fetches the base price from `menu_items` and adds only the `customizations[].price` values on top. This prevents any client-side price manipulation.

**Response `201`**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "status": "new",
    "type": "delivery",
    "total": 62.40,
    "subtotal": 56.00,
    "delivery_fee": 4.90,
    "service_fee": 1.50,
    "created_at": "2026-05-24T12:00:00Z"
  }
}
```

> Delivery fee: €4.90 · Service fee: €1.50 (applied only to delivery orders, defined in `src/lib/fees.ts`)

---

### `GET /api/orders/:id`

Returns the current status and details of an order. Used for the customer order-tracking page, which polls this endpoint every 5 seconds until the order reaches a terminal state.

**Response `200`**
```json
{
  "id": "uuid",
  "status": "confirmed",
  "type": "delivery",
  "customer_name": "Aino Virtanen",
  "total": 62.40,
  "items": [
    {
      "id": "uuid",
      "order_id": "uuid",
      "name": "Nordic Margherita (Large)",
      "quantity": 2,
      "price": 24.00,
      "customizations": [
        { "name": "Large", "price": 6.00 },
        { "name": "+ Truffle Oil", "price": 4.00 }
      ],
      "notes": "Extra crispy please"
    }
  ],
  "status_history": [
    { "status": "new",       "at": "2026-05-24T12:00:00Z" },
    { "status": "confirmed", "at": "2026-05-24T12:02:00Z" }
  ],
  "created_at": "2026-05-24T12:00:00Z",
  "timer": {
    "remaining_seconds": 1980,
    "estimated_minutes": 35,
    "progress_percent": 8
  }
}
```

> `timer` is `null` until the order is confirmed. Estimated times: delivery 35 min · pickup 20 min · walk-in 25 min.

**Response `404`** — order not found

---

### `GET /api/fulfillment/wait-times`

Returns dynamic estimated wait times based on how many orders are currently active in the kitchen. Each queued order adds 3 minutes to the base time. Used to show live wait estimates on the landing page before checkout.

**Response `200`**
```json
{
  "wait_times": {
    "delivery": { "min": 41, "max": 51, "label": "41–51 min" },
    "pickup":   { "min": 26, "max": 36, "label": "26–36 min" }
  },
  "queue_length": 2
}
```

> Returns default times (`delivery: 35–45`, `pickup: 20–30`) if the database is unreachable.

---

## Admin APIs

All admin endpoints require a valid `admin_session` cookie. They use the Supabase service role key server-side, which bypasses RLS.

---

### `POST /api/admin/auth/request`

Sends a 6-digit OTP to the given email address if it exists in the `admin_users` table. Always returns `{ ok: true }` regardless of whether the email is registered, to prevent email enumeration.

If `RESEND_API_KEY` is not set, the OTP is printed to the server console instead of being emailed.

**Request body**
```json
{ "email": "admin@syojuo.fi" }
```

**Response `200`**
```json
{ "ok": true }
```

> Invalidates any previous unused OTP for this email before generating a new one. Codes expire after 10 minutes.

---

### `POST /api/admin/auth/verify`

Verifies a 6-digit OTP against the stored SHA-256 hash. On success, sets a signed HMAC-SHA256 `admin_session` cookie and marks the token as used so it cannot be replayed.

**Request body**
```json
{
  "email": "admin@syojuo.fi",
  "otp": "483921"
}
```

**Response `200`** — sets `admin_session` cookie
```json
{ "ok": true }
```

**Response `401`** — code is wrong, expired, or already used
```json
{ "error": "Invalid or expired code" }
```

---

### `POST /api/admin/logout`

Clears the `admin_session` cookie by overwriting it with an empty value and `maxAge: 0`.

**Request body:** none

**Response `200`**
```json
{ "ok": true }
```

---

### `POST /api/admin/menu/categories`

Creates a new menu category. `sort_order` defaults to the end of the list if not provided.

**Request body**
```json
{
  "name": "Desserts",
  "sort_order": 4
}
```

| Field | Required |
|---|---|
| `name` | Yes |
| `sort_order` | No — defaults to last position |

**Response `201`**
```json
{
  "category": {
    "id": "uuid",
    "name": "Desserts",
    "sort_order": 4
  }
}
```

---

### `PUT /api/admin/menu/categories/:id`

Renames a category or changes its display order. Send only the fields you want to change.

**Request body**
```json
{
  "name": "Starters",
  "sort_order": 0
}
```

**Response `200`**
```json
{
  "category": { "id": "uuid", "name": "Starters", "sort_order": 0 }
}
```

**Response `404`** — category not found

---

### `DELETE /api/admin/menu/categories/:id`

Permanently deletes a category. All items in that category are also deleted (cascade).

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — category not found

---

### `POST /api/admin/menu/items`

Creates a new menu item. `sort_order` defaults to the end of the category's item list. The three customization fields control what the customer sees in the item modal.

**Request body**
```json
{
  "category_id": "uuid",
  "name": "Nordic Margherita",
  "description": "Heritage tomatoes, fresh basil, burnt mozzarella",
  "price": 18.00,
  "image_url": "https://…/menu-images/pizza.avif",
  "is_available": true,
  "featured": false,
  "sort_order": 0,
  "sizes": [
    { "id": "regular", "name": "Regular", "subtitle": "Perfect for one", "price_diff": 0 },
    { "id": "large",   "name": "Large",   "subtitle": "To share",        "price_diff": 6 }
  ],
  "removable_ingredients": ["Tomato Sauce", "Mozzarella", "Fresh Basil", "Olive Oil"],
  "addons": [
    { "id": "truffle",    "name": "Truffle Oil",        "price": 4.00 },
    { "id": "burrata",    "name": "Extra Burrata",      "price": 6.50 },
    { "id": "prosciutto", "name": "Prosciutto di Parma","price": 5.00 }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `category_id` | Yes | Must be an existing category UUID — returns `404` if not found |
| `name` | Yes | |
| `price` | Yes | Must be ≥ 0 |
| `description` | No | |
| `image_url` | No | Use `/api/admin/upload` to get a URL first |
| `is_available` | No | Defaults to `true` |
| `featured` | No | Defaults to `false` — appears on landing page when `true` |
| `sort_order` | No | Defaults to end of category |
| `sizes` | No | `null` hides the size picker in the customer modal |
| `removable_ingredients` | No | Empty array `[]` hides the ingredients section |
| `addons` | No | Empty array `[]` hides the add-ons section |

**Response `201`**
```json
{
  "item": {
    "id": "uuid",
    "category_id": "uuid",
    "name": "Nordic Margherita",
    "description": "Heritage tomatoes, fresh basil, burnt mozzarella",
    "price": 18.00,
    "image_url": "https://…",
    "is_available": true,
    "featured": false,
    "sort_order": 0,
    "sizes": [ … ],
    "removable_ingredients": [ … ],
    "addons": [ … ]
  }
}
```

---

### `PUT /api/admin/menu/items/:id`

Updates one or more fields on an existing menu item. Only send fields you want to change — all others are left untouched.

**Request body** — all fields optional, send only what changes
```json
{
  "name": "Updated Name",
  "price": 20.00,
  "is_available": false,
  "featured": true,
  "sizes": null,
  "removable_ingredients": [],
  "addons": []
}
```

Updatable fields: `category_id`, `name`, `description`, `price`, `image_url`, `is_available`, `featured`, `sort_order`, `sizes`, `removable_ingredients`, `addons`

> `category_id`, if provided, must reference an existing category — returns `404` if not found.

**Response `200`**
```json
{
  "item": { "id": "uuid", "name": "Updated Name", "price": 20.00, "…": "…" }
}
```

**Response `404`** — item not found

---

### `DELETE /api/admin/menu/items/:id`

Permanently deletes a menu item and all its tag assignments.

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — item not found

---

### `POST /api/admin/menu/tags`

Creates a new marketing tag that can be assigned to menu items.

**Request body**
```json
{
  "name": "Chef's Pick",
  "color": "amber"
}
```

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Must be unique |
| `color` | No | Defaults to `"gray"`. Used to pick a Tailwind color class in the menu UI |

**Response `201`**
```json
{
  "tag": { "id": "uuid", "name": "Chef's Pick", "color": "amber" }
}
```

**Response `409`** — tag name already exists

---

### `POST /api/admin/menu/items/:id/tags`

Assigns an existing tag to a menu item.

**Request body**
```json
{ "tag_id": "uuid" }
```

**Response `201`**
```json
{ "success": true }
```

**Response `404`** — item not found or tag not found  
**Response `409`** — tag already assigned to this item

---

### `DELETE /api/admin/menu/items/:id/tags/:tagId`

Removes a tag from a menu item.

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — tag assignment not found (item/tag combination does not exist)

---

### `POST /api/admin/deals`

Creates a new deal or bundle. A deal can be either permanent (`is_time_bound: false`) or limited to a date window.

**Request body**
```json
{
  "name": "Weekend Feast",
  "description": "Pizza + Tiramisu bundle for two",
  "price": 28.00,
  "item_ids": ["uuid-pizza", "uuid-tiramisu"],
  "is_time_bound": true,
  "start_date": "2026-05-24",
  "end_date": "2026-05-25"
}
```

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | |
| `price` | Yes | Must be ≥ 0 |
| `item_ids` | Yes | Non-empty array of menu item UUIDs — all must exist, returns `404` listing any missing IDs |
| `description` | No | |
| `is_time_bound` | No | Defaults to `false` |
| `start_date` | Yes if `is_time_bound` | Format: `YYYY-MM-DD` |
| `end_date` | Yes if `is_time_bound` | Format: `YYYY-MM-DD` |

**Response `201`**
```json
{
  "deal": {
    "id": "uuid",
    "name": "Weekend Feast",
    "description": "Pizza + Tiramisu bundle for two",
    "price": 28.00,
    "item_ids": ["uuid", "uuid"],
    "is_active": true,
    "is_time_bound": true,
    "start_date": "2026-05-24",
    "end_date": "2026-05-25",
    "created_at": "2026-05-24T10:00:00Z"
  }
}
```

---

### `PUT /api/admin/deals/:id`

Updates any field on a deal, including toggling it active/inactive or changing its date window.

**Request body** — send only changed fields
```json
{
  "is_active": false,
  "price": 24.00,
  "end_date": "2026-05-26"
}
```

Updatable fields: `name`, `description`, `price`, `item_ids`, `is_active`, `is_time_bound`, `start_date`, `end_date`

> `item_ids`, if provided, must be a non-empty array and all IDs must exist — returns `404` listing any missing IDs.

**Response `200`**
```json
{
  "deal": { "id": "uuid", "is_active": false, "price": 24.00, "…": "…" }
}
```

**Response `404`** — deal not found, or one or more `item_ids` not found

---

### `DELETE /api/admin/deals/:id`

Permanently deletes a deal.

**Response `200`**
```json
{ "success": true }
```

**Response `404`** — deal not found

---

### `POST /api/admin/orders/advance`

Advances an order to the next status. When advancing to `confirmed`, sends a confirmation email to the customer (requires `RESEND_API_KEY`).

**Status flow:** `new` → `confirmed` → `sent_to_kitchen` → `on_route` → `delivered`  
`cancelled` is a valid target from any state.

**Request body**
```json
{
  "id": "uuid",
  "status": "confirmed",
  "currentHistory": [
    { "status": "new", "at": "2026-05-24T12:00:00Z" }
  ]
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | Yes | Order UUID |
| `status` | Yes | Must be one of: `confirmed`, `sent_to_kitchen`, `on_route`, `delivered`, `cancelled` |
| `currentHistory` | No | Existing `status_history` array — the new entry is appended |

**Response `200`**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "status": "confirmed",
    "customer_name": "Aino Virtanen",
    "total": 62.40,
    "order_items": [ { "name": "Nordic Margherita", "quantity": 2, "price": 24.00, "customizations": [ "…" ], "notes": "Extra crispy" } ],
    "status_history": [
      { "status": "new",       "at": "2026-05-24T12:00:00Z" },
      { "status": "confirmed", "at": "2026-05-24T12:02:00Z" }
    ]
  }
}
```

**Response `400`** — missing `id`/`status`, or `status` is not a recognised value  
**Response `404`** — order not found

---

### `POST /api/admin/reservations/action`

Confirms, declines, seats, or marks a reservation as no-show. Sends a confirmation email to the guest when action is `confirm` (requires `RESEND_API_KEY`).

**Action → status mapping**

| Action | Resulting status |
|---|---|
| `confirm` | `confirmed` |
| `decline` | `declined` |
| `seat` | `seated` |
| `no_show` | `no_show` |

**Request body**
```json
{
  "id": "uuid",
  "action": "confirm",
  "reason": "Fully booked that evening"
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | Yes | Reservation UUID |
| `action` | Yes | Must be one of: `confirm`, `decline`, `seat`, `no_show` |
| `reason` | No | Only used when `action = "decline"` — prepended to `notes` as `DECLINED REASON: …` |

**Response `200`**
```json
{
  "success": true,
  "reservation": {
    "id": "uuid",
    "guest_name": "Aino Virtanen",
    "guest_email": "aino@example.com",
    "date": "2026-05-25",
    "time": "19:00",
    "party_size": 4,
    "occasion": "Birthday",
    "status": "confirmed",
    "notes": null
  }
}
```

**Response `400`** — missing `id`/`action`, or `action` is not a recognised value  
**Response `404`** — reservation not found

---

### `POST /api/admin/upload`

Uploads a menu item image to Supabase Storage (`menu-images` bucket) and returns the public URL. The bucket must exist and be set to **Public** in the Supabase dashboard.

**Request:** `multipart/form-data`

| Field | Required | Notes |
|---|---|---|
| `file` | Yes | The image file |

**Constraints**
- Max size: **5 MB**
- Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`

**Response `201`**
```json
{
  "url": "https://wsig…supabase.co/storage/v1/object/public/menu-images/1748123456-abc123.avif"
}
```

Pass the returned `url` as `image_url` when calling `POST /api/admin/menu/items` or `PUT /api/admin/menu/items/:id`.

**Response `400`** — file missing, wrong type, or over size limit  
**Response `401`** — not authenticated

---

## Notes

### Reservation Submission
Guest reservations are submitted **directly to Supabase** from the `/reserve` page using the anon key (no API route). The anon key has INSERT permission on the `reservations` table via RLS. Admins review and action reservations through the `/hq/reservations` panel, which calls `POST /api/admin/reservations/action`.

### Development Logs
In development (`NODE_ENV=development`) a structured log buffer is accessible at `GET /api/dev/logs` and viewable in the browser at `/dev/logs`. Both endpoints return `404` in production.

### Security Model
- **Anon key** — browser-safe, SELECT-only on public tables via RLS
- **Service role key** — server-only, used in all admin routes, bypasses RLS entirely
- **Session cookies** — HMAC-SHA256 signed, `httpOnly`, `SameSite=lax`, `Secure` in production
- **OTP codes** — SHA-256 hashed in the database, single-use, 10-minute expiry
