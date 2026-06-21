# Database Schema

Generated from `/blueprint/app-plan.md`. Structural guide: `database-spec-template.md`.

All tables live in Supabase (PostgreSQL). There is no Supabase Auth — `users` is a fully custom table (see `/specs/auth.md`).

---

**`users`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK, `gen_random_uuid()` |
| `email` | TEXT | Unique, not null — login identifier |
| `password_hash` | TEXT | Not null — bcryptjs, 12 rounds |
| `display_name` | TEXT | Not null — from signup |
| `zip_code` | TEXT | Optional, 5-digit US zip |
| `favourite_stores` | TEXT[] | Subset of `['target','walmart','cvs','macys','bestbuy','wholefoods','jcpenney']` |
| `notification_prefs` | JSONB | `{ dealAlerts: bool, expiryReminders: bool }` |
| `created_at` | TIMESTAMPTZ | `now()` |

**`user_photos`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `users.id`, cascade delete; one active photo per user (unique) |
| `storage_url` | TEXT | Supabase Storage signed URL path, bucket `user-photos` |
| `uploaded_at` | TIMESTAMPTZ | `now()` |

**`offers`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `store` | TEXT | `'target'` \| `'walmart'` \| `'cvs'` \| `'macys'` \| `'bestbuy'` \| `'wholefoods'` \| `'jcpenney'` |
| `type` | TEXT | `'online'` \| `'offline'` |
| `headline` | TEXT | Offer title from Rakuten feed |
| `discount_value` | TEXT | e.g. `"20% off"`, `"$5 off"` |
| `category` | TEXT | Grocery \| Electronics \| Health \| Beauty \| Home \| Apparel |
| `coupon_code` | TEXT | For online offers |
| `qr_value` | TEXT | URL or identifier for QR rendering |
| `retailer_url` | TEXT | Deep link for "Shop Now" |
| `expires_at` | TIMESTAMPTZ | — |
| `created_at` | TIMESTAMPTZ | `now()` |
| `is_active` | BOOLEAN | TTL invalidation flag (offer cache, ≤4h staleness) |

**`saved_offers`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `users.id`, cascade delete |
| `offer_id` | UUID | FK → `offers.id`, cascade delete |
| `saved_at` | TIMESTAMPTZ | `now()` |

Unique constraint: `(user_id, offer_id)`.

**`redemptions`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `users.id`, cascade delete |
| `offer_id` | UUID | FK → `offers.id`, cascade delete |
| `channel` | TEXT | `'online'` \| `'offline'` |
| `savings_amount` | NUMERIC | Parsed from `discount_value` |
| `redeemed_at` | TIMESTAMPTZ | `now()` |

**`posters`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `users.id`, cascade delete |
| `offer_id` | UUID | FK → `offers.id`, cascade delete |
| `storage_url` | TEXT | Supabase Storage path, bucket `generated-posters` |
| `generated_at` | TIMESTAMPTZ | `now()` |

**`hashtag_sets`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `users.id`, cascade delete |
| `offer_id` | UUID | FK → `offers.id`, cascade delete |
| `hashtags` | TEXT[] | Array of 15–20 hashtag strings |
| `generated_at` | TIMESTAMPTZ | `now()` |
| `copied_at` | TIMESTAMPTZ | Null until user copies |

**`download_events`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `users.id`, cascade delete |
| `offer_id` | UUID | FK → `offers.id`, cascade delete |
| `downloaded_at` | TIMESTAMPTZ | `now()` |

**`hashtag_copy_events`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `users.id`, cascade delete |
| `hashtag_set_id` | UUID | FK → `hashtag_sets.id`, cascade delete |
| `copied_at` | TIMESTAMPTZ | `now()` |

---

## SQL Schema

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";

create table users (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,
  password_hash       text not null,
  display_name        text not null,
  zip_code            text,
  favourite_stores    text[] default '{}',
  notification_prefs  jsonb default '{"dealAlerts": true, "expiryReminders": true}',
  created_at          timestamptz not null default now()
);

create table user_photos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  storage_url   text not null,
  uploaded_at   timestamptz not null default now(),
  unique (user_id)
);

create table offers (
  id              uuid primary key default gen_random_uuid(),
  store           text not null check (store in ('target', 'walmart', 'cvs', 'macys', 'bestbuy', 'wholefoods', 'jcpenney')),
  type            text not null check (type in ('online', 'offline')),
  headline        text not null,
  discount_value  text not null,
  category        text not null check (category in ('Grocery', 'Electronics', 'Health', 'Beauty', 'Home', 'Apparel')),
  coupon_code     text,
  qr_value        text,
  retailer_url    text,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  is_active       boolean not null default true
);

create index idx_offers_store_type_active on offers (store, type, is_active);
create index idx_offers_expires_at on offers (expires_at);

create table saved_offers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  offer_id    uuid not null references offers(id) on delete cascade,
  saved_at    timestamptz not null default now(),
  unique (user_id, offer_id)
);

create table redemptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  offer_id        uuid not null references offers(id) on delete cascade,
  channel         text not null check (channel in ('online', 'offline')),
  savings_amount  numeric,
  redeemed_at     timestamptz not null default now()
);

create index idx_redemptions_user_id on redemptions (user_id);

create table posters (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  offer_id      uuid not null references offers(id) on delete cascade,
  storage_url   text not null,
  generated_at  timestamptz not null default now()
);

create index idx_posters_user_id on posters (user_id);

create table hashtag_sets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  offer_id      uuid not null references offers(id) on delete cascade,
  hashtags      text[] not null,
  generated_at  timestamptz not null default now(),
  copied_at     timestamptz
);

create index idx_hashtag_sets_user_id on hashtag_sets (user_id);

create table download_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  offer_id        uuid not null references offers(id) on delete cascade,
  downloaded_at   timestamptz not null default now()
);

create index idx_download_events_user_id on download_events (user_id);

create table hashtag_copy_events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  hashtag_set_id    uuid not null references hashtag_sets(id) on delete cascade,
  copied_at         timestamptz not null default now()
);

create index idx_hashtag_copy_events_user_id on hashtag_copy_events (user_id);
```

---

## Row-Level Security

Per app-plan.md Phase 9: enable RLS on every table so a user can only read/write their own rows.

**Important caveat:** because auth is custom (no Supabase Auth, no JWT, no `auth.uid()`), standard Supabase RLS policies that key off `auth.uid()` do **not** apply directly. Two valid approaches:
1. **Service-role key on the server, app-level checks** (recommended for this stack) — all reads/writes go through Next.js API routes using the Supabase **service role key**, which bypasses RLS. The API route itself enforces that the `user_id` on the row matches the `userId` passed from the authenticated client. RLS stays enabled on every table with a default-deny policy as defense-in-depth (blocks any direct anon-key access from the browser).
2. **Custom JWT claim** — mint a Supabase-compatible JWT containing the custom `user_id` after login and set `request.jwt.claims` so `auth.uid()`-style policies can be written. Not required for launch scope; only revisit if direct client-to-Supabase queries (bypassing API routes) are introduced.

Default-deny baseline (apply to every table):
```sql
alter table users enable row level security;
alter table user_photos enable row level security;
alter table offers enable row level security;
alter table saved_offers enable row level security;
alter table redemptions enable row level security;
alter table posters enable row level security;
alter table hashtag_sets enable row level security;
alter table download_events enable row level security;
alter table hashtag_copy_events enable row level security;

-- No policies created = no access via the anon key.
-- All app reads/writes use the Supabase service-role key from within API routes.
```

`offers` is the one exception — the dashboard's client-side Supabase JS SDK queries (per app-plan.md "Dashboard Flow") read `redemptions`, `posters`, `hashtag_sets`, `download_events`, `saved_offers` directly. If those client-side reads are kept (rather than moved behind `GET /api/dashboard`), each of those tables needs a policy scoped to the requesting user's `user_id` instead of a hard default-deny. Flagged here as a decision point for implementation — app-plan.md's API Routes table already includes `GET /api/dashboard`, so the recommended path is to route dashboard reads through that API instead of direct client-side Supabase queries.

---

## Storage Buckets

| Bucket | Visibility | Used by |
|---|---|---|
| `user-photos` | Private | `user_photos.storage_url` — profile photo uploads, read via signed URL |
| `generated-posters` | Private | `posters.storage_url` — AI-generated poster images |

Both buckets are created in Supabase Storage per app-plan.md Phase 9. Access is via signed URLs generated server-side in API routes — never expose a public bucket URL directly to the client.

---

## Offer Cache TTL

`offers.is_active` + `offers.created_at`/`expires_at` implement the ≤4h staleness tolerance noted in app-plan.md's Tech Stack table for the Rakuten feed. Implementation note for `GET /api/offers`: on each call, check whether the most recent `offers` row for the requested store is older than 4 hours; if so, re-fetch from Rakuten and upsert, then serve from the table either way (the table is the cache, Rakuten is the origin).
