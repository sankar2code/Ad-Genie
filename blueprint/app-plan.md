# Ad-Genie — App Plan

> **Source of truth for all specs and implementation.**
> Generated from: PRD v1.0 (June 20, 2026) + Design System (Arabian Nights)

---

## App Overview

**Ad-Genie** is a web-based AI-powered advertising and deals platform for value-conscious everyday shoppers aged 22–45 who shop at Target, Walmart, CVS, Macy's, Best Buy, Whole Foods, and JCPenney.

The app solves two problems simultaneously:
1. **Deal discovery friction** — surfaces location-aware offers in the correct redemption format (online coupon code vs. in-store QR code) without the user hunting across multiple apps.
2. **Social content creation friction** — lets users instantly generate a personalised AI ad poster (with their face) and a copyable hashtag set from any deal, ready to share on social media manually.

**Platform:** Web application only (Next.js on Vercel). No native mobile app. No Instagram integration.

**Launch scope:** US-only. Seven retailers: Target, Walmart, CVS, Macy's, Best Buy, Whole Foods, JCPenney. Offer data via Rakuten affiliate API.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | File-based routing, React Server Components, API routes |
| Language | JavaScript (JSX) | jsconfig.json with `@/*` alias pointing to project root |
| Styling | Tailwind CSS 3.x + CSS variables | `ag-` token prefix; dark mode default, light mode for auth |
| UI Icons | lucide-react 0.383.0 | Stroke-only, 1.5px, never filled |
| Fonts | Cinzel (display), Poppins (body), JetBrains Mono (coupon codes) | Google Fonts, loaded in globals.css |
| Database | Supabase (PostgreSQL) | Custom users table — no Supabase Auth |
| Auth | bcryptjs (12 rounds) | Custom signup/login; session stored in localStorage |
| File storage | Supabase Storage | Private bucket for user photos + generated posters |
| Text AI | OpenAI GPT-4o | Hashtag generation via server route |
| Image AI | OpenAI gpt-image-1 | AI poster generation via server route |
| QR codes | qrcode (npm) | Offline offer detail pages; SVG output, ≥240×240px |
| Charts | Recharts | Dashboard savings line chart |
| Location | Browser Geolocation API | Coordinates matched to nearest stores |
| Store matching | Google Maps Places API | Find nearest Target/Walmart/CVS/Macy's/Best Buy/Whole Foods/JCPenney within 10 miles |
| Offer data | Rakuten MerchandiseSearch API | Structured deal feeds; up to 4h staleness acceptable |
| Hosting | Vercel | Edge Functions, autoscaling |
| Monitoring | Sentry | Error tracking |

---

## Pages

| Route | Page | Auth Required | Purpose |
|---|---|---|---|
| `/` | Landing | No | Marketing page: hero, features, retailer strip, auth CTAs |
| `/signup` | Sign Up | No | Create account with name, email, password |
| `/login` | Log In | No | Email/password login |
| `/offers` | Offers Feed | Yes | Location-aware deal discovery; online/offline tabs |
| `/offers/[id]` | Offer Detail | Yes | Coupon code or QR code; AI poster; hashtag generator |
| `/dashboard` | Dashboard | Yes | 12 KPI cards, savings line chart, activity feed |
| `/profile` | Profile | Yes | Photo upload, preferences, favourite stores |

### Route Groups
- `app/(auth)/` — login, signup; applies `data-theme="light"` (desert sand)
- `app/(app)/` — offers, dashboard, profile; requires auth; renders `<Nav />` rail

---

## User Flows

### Signup Flow
1. User lands on `/` → clicks "Get started"
2. Routed to `/signup`
3. Enters display name, email, password (min 8 chars)
4. Client POSTs to `POST /api/auth/signup`
5. Server: checks if email exists in `users` table → if yes, returns 400 "Email already registered"
6. Server: hashes password with bcryptjs (12 rounds) → inserts row into `users` table
7. Returns `{ userId, userEmail }` → stored in `localStorage`
8. Redirects to `/offers`

### Login Flow
1. User visits `/login`
2. Enters email, password
3. Client POSTs to `POST /api/auth/login`
4. Server: fetches user by email → bcrypt.compare password hash
5. If mismatch: returns 401 with generic "Invalid credentials" (no field enumeration)
6. If match: returns `{ userId, userEmail }` → stored in `localStorage`
7. Redirects to `/offers`

### Logout Flow
1. User clicks logout in `<Nav />`
2. `localStorage.removeItem('userId')` + `localStorage.removeItem('userEmail')`
3. Redirects to `/login`

### Auth Guard
- `app/(app)/layout.jsx` checks `localStorage` for `userId` on mount
- If missing → redirects to `/login`

### Offer Discovery Flow (Primary)
1. User arrives at `/offers` (post-login)
2. Browser geolocation prompt fires → coordinates captured
3. Google Maps Places API called: find nearest Target/Walmart/CVS/Macy's/Best Buy/Whole Foods/JCPenney within 10 miles
4. Matched stores shown as filter chips: All / Target / Walmart / CVS / Macy's / Best Buy / Whole Foods / JCPenney
5. Rakuten API called with store filter + location context → offers loaded
6. Offers rendered as `<OfferCard />` grid in 2 columns (desktop)
7. User toggles Online / Offline tab → client-side filter
8. User applies store filter chip → client-side filter
9. User searches → client-side text filter on headline + category
10. User clicks offer card → navigates to `/offers/[id]`
11. Fallback: if geolocation denied → zip code entry modal shown; profile home zip used if set

### Online Coupon Flow
1. User on `/offers/[id]` (online type)
2. Coupon code displayed in `<CouponCodeBlock />` (JetBrains Mono, gold, dashed border)
3. User clicks "Copy Code" → `navigator.clipboard.writeText(code)`
4. Toast: "✨ Code copied! Head to checkout." (2s, genie teal)
5. Redemption event logged: `POST /api/redemptions` → inserts row to `redemptions` table (channel: "online")
6. "Shop Now" button → opens retailer URL in new tab (plain link, no affiliate tracking)

### Offline QR Code Flow
1. User on `/offers/[id]` (offline type)
2. QR code rendered via `qrcode` library (240×240px, white background, dark foreground)
3. Brightness tip shown below QR
4. Redemption event logged: `POST /api/redemptions` (channel: "offline")

### AI Poster Generation Flow
1. User on `/offers/[id]` → clicks "Generate My Ad Poster"
2. If no profile photo: inline prompt to upload one (non-blocking — can skip)
3. Sparkle pulse loader shown ("The Genie is at work…")
4. Client POSTs `{ offer, userPhotoBase64 }` to `POST /api/poster`
5. Server calls OpenAI gpt-image-1 with structured prompt + photo
6. Returns `{ imageUrl }` → poster previewed in browser (1:1 aspect ratio, gold border glow)
7. "Not quite right? Try again (2 left)" — regeneration counter, max 3 per offer
8. User clicks "Download" → `<a download>` on Blob URL → PNG saved to device
9. Download event logged: `POST /api/events/download`

### Hashtag Generation Flow
1. User on `/offers/[id]` → clicks "Generate Hashtags"
2. Confirmation prompt: "Want hashtags for this offer?" → user clicks Confirm
3. Client POSTs `{ offer }` to `POST /api/hashtags`
4. Server calls GPT-4o with offer metadata → returns array of 15–20 hashtags
5. Hashtags rendered as pill chips (`<HashtagChipList />`)
6. Individual chips: click → copies single hashtag to clipboard
7. "Copy all hashtags" button → copies full set → logs event: `POST /api/events/hashtag-copy`

### Dashboard Flow
1. User navigates to `/dashboard`
2. On mount: Supabase JS SDK queries `redemptions`, `posters`, `hashtag_sets`, `download_events`, `saved_offers` for current user
3. KPI values computed client-side from query results
4. Recharts `LineChart` renders daily savings for last 30 days
5. Store toggle (All / Target / Walmart / CVS / Macy's / Best Buy / Whole Foods / JCPenney) filters the chart data client-side
6. Activity feed: most recent 50 events, chronological, "Load more" fetches next 50

### Profile Flow
1. User navigates to `/profile`
2. Current profile loaded from `users` + `user_photos` tables
3. Photo upload: file picker (JPEG/PNG, max 5MB) → circular crop preview → uploads to Supabase Storage private bucket → updates `user_photos` row
4. Fields: display name, email (read-only), home zip, favourite stores (toggle chips), notification prefs
5. "Save changes" → `PATCH /api/profile`
6. "Delete photo" → removes from Supabase Storage + clears `user_photos` row

---

## Database Tables

All tables in Supabase (PostgreSQL). No Supabase Auth — custom `users` table only.

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Default: gen_random_uuid() |
| `email` | text UNIQUE NOT NULL | Login identifier |
| `password_hash` | text NOT NULL | bcryptjs, 12 rounds |
| `display_name` | text NOT NULL | From signup |
| `zip_code` | text | 5-digit US zip, optional |
| `favourite_stores` | text[] | ['target','walmart','cvs','macys','bestbuy','wholefoods','jcpenney'] subset |
| `notification_prefs` | jsonb | `{ dealAlerts: bool, expiryReminders: bool }` |
| `created_at` | timestamptz | Default: now() |

### `user_photos`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID FK → users.id | One active photo per user |
| `storage_url` | text | Supabase Storage signed URL path |
| `uploaded_at` | timestamptz | Default: now() |

### `offers`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `store` | text | 'target' \| 'walmart' \| 'cvs' \| 'macys' \| 'bestbuy' \| 'wholefoods' \| 'jcpenney' |
| `type` | text | 'online' \| 'offline' |
| `headline` | text | Offer title from Rakuten feed |
| `discount_value` | text | e.g. "20% off", "$5 off" |
| `category` | text | Grocery \| Electronics \| Health \| Beauty \| Home \| Apparel |
| `coupon_code` | text | For online offers |
| `qr_value` | text | URL or identifier for QR rendering |
| `retailer_url` | text | Deep link for "Shop Now" |
| `expires_at` | timestamptz | |
| `created_at` | timestamptz | Default: now() |
| `is_active` | boolean | TTL invalidation flag |

### `saved_offers`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID FK → users.id | |
| `offer_id` | UUID FK → offers.id | |
| `saved_at` | timestamptz | Default: now() |

Unique constraint: `(user_id, offer_id)`

### `redemptions`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID FK → users.id | |
| `offer_id` | UUID FK → offers.id | |
| `channel` | text | 'online' \| 'offline' |
| `savings_amount` | numeric | Parsed from discount_value |
| `redeemed_at` | timestamptz | Default: now() |

### `posters`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID FK → users.id | |
| `offer_id` | UUID FK → offers.id | |
| `storage_url` | text | Supabase Storage path for generated poster |
| `generated_at` | timestamptz | Default: now() |

### `hashtag_sets`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID FK → users.id | |
| `offer_id` | UUID FK → offers.id | |
| `hashtags` | text[] | Array of 15–20 hashtag strings |
| `generated_at` | timestamptz | Default: now() |
| `copied_at` | timestamptz | Null until user copies |

### `download_events`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID FK → users.id | |
| `offer_id` | UUID FK → offers.id | |
| `downloaded_at` | timestamptz | Default: now() |

### `hashtag_copy_events`
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `user_id` | UUID FK → users.id | |
| `hashtag_set_id` | UUID FK → hashtag_sets.id | |
| `copied_at` | timestamptz | Default: now() |

### SQL Schema

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

## API Routes

All routes are Next.js App Router API routes under `app/api/`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create user account; hash password; return userId |
| POST | `/api/auth/login` | No | Verify credentials; return userId + userEmail |
| GET | `/api/offers` | Yes | Fetch offers from Rakuten API filtered by store and type |
| GET | `/api/offers/[id]` | Yes | Fetch single offer by ID |
| POST | `/api/redemptions` | Yes | Log a coupon code copy or QR display event |
| POST | `/api/poster` | Yes | Generate AI poster via OpenAI gpt-image-1 |
| POST | `/api/hashtags` | Yes | Generate hashtags via GPT-4o |
| POST | `/api/events/download` | Yes | Log poster download event |
| POST | `/api/events/hashtag-copy` | Yes | Log hashtag copy-all event |
| GET | `/api/dashboard` | Yes | Aggregate KPI data from Supabase for current user |
| GET | `/api/profile` | Yes | Fetch user profile + photo URL |
| PATCH | `/api/profile` | Yes | Update display name, zip, favourite stores, notification prefs |
| POST | `/api/profile/photo` | Yes | Upload profile photo to Supabase Storage |
| DELETE | `/api/profile/photo` | Yes | Delete profile photo from Storage + clear user_photos row |
| POST | `/api/offers/save` | Yes | Bookmark an offer (insert to saved_offers) |
| DELETE | `/api/offers/save/[id]` | Yes | Remove bookmarked offer |

---

## Components

### Shared / Global
| Component | File | Purpose |
|---|---|---|
| `Nav` | `components/Nav.jsx` | 72px fixed left rail; lamp logo, nav items, logout |
| `OfferCard` | `components/OfferCard.jsx` | Deal card with store badge, discount pill, type badge, hover glow |
| `KPICard` | `components/KPICard.jsx` | Dashboard metric card with icon, Cinzel value, label |
| `Toast` | `components/Toast.jsx` | Timed notification (genie teal, 2s fade); used for copy confirmations |
| `Badge` | `components/Badge.jsx` | Status pill: Online / Offline / Expiring / Expired / Saved |
| `Button` | `components/Button.jsx` | Primary (gold), Genie (teal), Ghost, Danger variants |

### Landing Page (`/`)
| Component | Purpose |
|---|---|
| `HeroSection` | Gradient headline, gold glow orb, two CTAs |
| `FeaturesGrid` | 6 feature cards in 2×3 grid |
| `RetailerStrip` | Target / Walmart / CVS / Macy's / Best Buy / Whole Foods / JCPenney logo bar |
| `LandingNav` | Public nav with logo + Sign in / Get started links |
| `FooterSection` | Footer with links |

### Auth Pages
| Component | Purpose |
|---|---|
| `AuthCard` | Shared card shell (desert sand bg, gold border) |
| `LoginForm` | Email + password fields, submit, link to signup |
| `SignupForm` | Name + email + password fields, submit, link to login |

### Offers Feed (`/offers`)
| Component | Purpose |
|---|---|
| `StoreFilterChips` | Horizontal chip row: All / Target / Walmart / CVS / Macy's / Best Buy / Whole Foods / JCPenney |
| `OnlineOfflineTab` | Tab toggle bar (Online / Offline) |
| `OfferGrid` | Responsive 2-col grid of `<OfferCard />` |
| `SearchInput` | Text filter input with MapPin icon |
| `ZipFallbackModal` | Modal for zip code entry when geolocation denied |
| `EmptyState` | "The Cave of Wonders is quiet…" empty state |

### Offer Detail (`/offers/[id]`)
| Component | Purpose |
|---|---|
| `CouponCodeBlock` | JetBrains Mono code display + copy button + toast |
| `QRCodeBlock` | qrcode-rendered QR at 240×240px, white bg, brightness tip |
| `PosterPanel` | Generate button, sparkle loader, poster preview, regen counter, download |
| `HashtagPanel` | "Generate Hashtags" button, confirm prompt, chip list, copy-all |

### Dashboard (`/dashboard`)
| Component | Purpose |
|---|---|
| `KPIGrid` | 12-card grid layout of `<KPICard />` |
| `SavingsChart` | Recharts LineChart with store toggle chips |
| `ActivityFeed` | Chronological list of 50 events with "Load more" |
| `SavedOffersList` | Quick-access bookmarked offers with expiry countdown |

### Profile (`/profile`)
| Component | Purpose |
|---|---|
| `PhotoUploader` | File picker, circular crop preview, upload/replace/delete |
| `ProfileForm` | Display name, email (read-only), zip code fields |
| `FavouriteStoresSelector` | Toggle buttons for Target / Walmart / CVS / Macy's / Best Buy / Whole Foods / JCPenney |
| `NotificationToggles` | Deal alerts + expiry reminder switches |

---

## AI Integration

### Hashtag Generation (`POST /api/hashtags`)
- **Called from:** Client on offer detail page after user confirms
- **Input sent to server:** `{ offer: { store, headline, category, discount_value } }`
- **Model:** `gpt-4o`
- **System prompt:** Social media strategist for retail deals — see PRD §3.5
- **Response format:** `{ type: 'json_object' }` → `{ hashtags: string[] }`
- **Parsed output:** Array of 15–20 hashtag strings with `#` prefix
- **Return to client:** `{ hashtags: string[] }`
- **Cost target:** <$0.25 per call

### AI Poster Generation (`POST /api/poster`)
- **Called from:** Client after user clicks "Generate My Ad Poster"
- **Input sent to server:** `{ offer: { store, headline, discount_value }, userPhotoBase64: string | null }`
- **Model:** `gpt-image-1`
- **Prompt:** Includes retailer brand colours, "Made with Ad-Genie" watermark, photo placement instructions — see PRD §3.4
- **Output size:** `1024x1024`
- **Return to client:** `{ imageUrl: string }` (OpenAI hosted URL)
- **Download:** Client converts to Blob → `<a download>` for PNG save
- **Cost target:** <$1.00 per poster
- **Retry limit:** 3 per offer per session (tracked in React state)

---

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# OpenAI
OPENAI_API_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Rakuten Affiliate API
RAKUTEN_API_KEY=
RAKUTEN_PUBLISHER_ID=
```

All server-only keys (OpenAI, Rakuten) are never prefixed with `NEXT_PUBLIC_`. They are only accessed in API routes.

---

## Build Phases

### Phase 1 — Foundation (already complete)
- [x] Next.js 14 project scaffolded with App Router
- [x] Tailwind CSS configured with `ag-` design tokens
- [x] globals.css with CSS variables (dark + light mode), Google Fonts, animations
- [x] `app/layout.jsx` — root layout
- [x] `lib/supabase.js` — Supabase client
- [x] `lib/auth.js` — signUp / signIn with bcryptjs
- [x] `jsconfig.json` — `@/*` path alias
- [x] `.env.local` — placeholder keys
- [x] `package.json` — all dependencies declared

### Phase 2 — Auth (already complete)
- [x] `app/(auth)/layout.jsx` — light theme wrapper
- [x] `app/(auth)/signup/page.jsx` — signup form
- [x] `app/(auth)/login/page.jsx` — login form
- [x] `app/api/auth/signup/route.js`
- [x] `app/api/auth/login/route.js`
- [x] `app/(app)/layout.jsx` — auth guard + `<Nav />`
- [x] `components/Nav.jsx` — 72px rail with gold active states

### Phase 3 — Landing Page (already complete)
- [x] `app/page.jsx` — hero, features grid, retailer strip, CTAs, footer

### Phase 4 — Offers Feed (already complete, needs Rakuten wiring)
- [x] `app/(app)/offers/page.jsx` — filter chips, tab toggle, offer grid (mock data)
- [x] `components/OfferCard.jsx` — store badge, discount pill, hover glow
- [ ] **TODO:** Replace mock data with `GET /api/offers` calling Rakuten API
- [ ] **TODO:** `app/api/offers/route.js` — Rakuten MerchandiseSearch API client
- [ ] **TODO:** Google Maps Places API integration for store detection

### Phase 5 — Offer Detail (already complete, needs real QR)
- [x] `app/(app)/offers/[id]/page.jsx` — coupon code block, QR placeholder, poster panel, hashtag panel
- [ ] **TODO:** Wire real `qrcode` library render into `<QRCodeBlock />`
- [ ] **TODO:** Extract `<CouponCodeBlock />`, `<QRCodeBlock />`, `<PosterPanel />`, `<HashtagPanel />` into separate component files
- [ ] **TODO:** `app/api/redemptions/route.js` — log redemption events to Supabase

### Phase 6 — AI Features (already complete, needs real keys)
- [x] `app/api/poster/route.js` — OpenAI gpt-image-1 call
- [x] `app/api/hashtags/route.js` — GPT-4o hashtag generation
- [ ] **TODO:** Add OPENAI_API_KEY to `.env.local` with real key
- [ ] **TODO:** Test poster generation end-to-end with a real photo
- [ ] **TODO:** Test hashtag generation end-to-end

### Phase 7 — Dashboard (already complete, needs real data)
- [x] `app/(app)/dashboard/page.jsx` — 12 KPI cards, Recharts chart, activity feed (mock data)
- [x] `components/KPICard.jsx`
- [ ] **TODO:** `app/api/dashboard/route.js` — aggregate query from Supabase
- [ ] **TODO:** Wire dashboard page to real Supabase queries via `useEffect`
- [ ] **TODO:** `app/api/events/download/route.js`
- [ ] **TODO:** `app/api/events/hashtag-copy/route.js`

### Phase 8 — Profile (already complete, needs Supabase Storage)
- [x] `app/(app)/profile/page.jsx` — photo upload UI, profile fields, favourite stores
- [ ] **TODO:** `app/api/profile/route.js` — GET + PATCH
- [ ] **TODO:** `app/api/profile/photo/route.js` — POST + DELETE with Supabase Storage
- [ ] **TODO:** Wire photo upload to real Supabase Storage bucket
- [ ] **TODO:** Retrieve signed URL for photo and pass to poster generation

### Phase 9 — Supabase Schema
- [ ] Create all 8 tables in Supabase dashboard (users, user_photos, offers, saved_offers, redemptions, posters, hashtag_sets, download_events, hashtag_copy_events)
- [ ] Add Row-Level Security policies (user can only read/write their own rows)
- [ ] Create private Storage bucket: `user-photos`
- [ ] Create private Storage bucket: `generated-posters`
- [ ] Populate offers table with seed data or initial Rakuten API sync

### Phase 10 — API Wiring & Integration Test
- [ ] Fill in real API keys in `.env.local`
- [ ] End-to-end test: signup → login → view offers → copy coupon code → check dashboard
- [ ] End-to-end test: upload profile photo → generate AI poster → download PNG
- [ ] End-to-end test: generate hashtags → copy all → verify logged in Supabase
- [ ] Validate QR code renders and scans correctly at 240px

### Phase 11 — Polish & P1 Features
- [ ] Offer bookmarking (saved_offers table + save button on offer cards)
- [ ] Expiry countdown on dashboard saved offers section
- [ ] Savings streak calculation
- [ ] Offer filtering by category / expiry range / discount value
- [ ] Offer sorting by savings / expiry / distance
- [ ] Zip code fallback modal (when geolocation denied)
- [ ] Offer staleness indicator (if offer data is >4h old)
- [ ] "Report an issue" button on offer detail pages
- [ ] Toast component extracted as reusable `<Toast />`
- [ ] WCAG 2.1 AA accessibility audit

### Phase 12 — Performance, Security & Launch Readiness
- [ ] Implement offer caching in Supabase with TTL (≤4h)
- [ ] Add retry + exponential backoff on Rakuten API calls
- [ ] Rate-limit AI poster generation (3/day free tier)
- [ ] Ensure no credentials in client-side code
- [ ] TLS 1.3 enforced via Vercel
- [ ] Security pentest
- [ ] Sentry error monitoring setup
- [ ] Vercel deployment configuration
- [ ] Performance audit: offer feed <2s P95, poster <15s P95

---

## Immediate Next Steps

1. **Set up Supabase** — create database, add all tables from schema above, configure RLS policies and Storage buckets
2. **Add real API keys** to `.env.local` (Supabase, OpenAI, Google Maps, Rakuten)
3. **Build `GET /api/offers`** — Rakuten API client to replace mock offer data
4. **Wire dashboard** — replace mock data with real Supabase queries via `app/api/dashboard`
5. **Wire profile photo upload** — Supabase Storage integration

The foundation (Phases 1–3 fully done, Phases 4–8 scaffolded) is already running. The next sprint focuses on replacing all mock data and placeholder integrations with real APIs.
