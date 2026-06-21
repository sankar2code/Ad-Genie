# Offers Feed Spec

Generated from `/blueprint/app-plan.md`. Structural guide: `dashboard-spec-template.md` (adapted for a filterable deal-discovery grid rather than a list/detail dashboard).

---

## Feature Name
Offers Feed (`/offers`)

---

## Description
- Authenticated page showing location-aware deals across Target, Walmart, CVS, Macy's, Best Buy, Whole Foods, and JCPenney.
- Offer data is sourced from the **Rakuten MerchandiseSearch API**, fetched server-side via `GET /api/offers` and cached in the `offers` table (≤4h staleness acceptable, per `/specs/database.md` "Offer Cache TTL").
- Store detection: **browser Geolocation API** captures coordinates → **Google Maps Places API** finds the nearest of each of the 7 retailers within 10 miles. If geolocation is denied, a zip code entry modal is shown (falling back to the user's profile `zip_code` if already set).
- Offers render as a responsive grid of `<OfferCard />`. Online/Offline tab, store filter chips, and search are all **client-side filters** over the already-loaded offer set — no additional API calls per filter change.
- Clicking a card navigates to `/offers/[id]`.

---

## Layout

```
┌──────────────────────────────────────────────────────────┐
│  <Nav /> 72px  │  Header (56px): logo, location, search   │
│                │  StoreFilterChips (sticky)                │
│                │  OnlineOfflineTab                          │
│                │  OfferGrid (2-col desktop / 1-col mobile)  │
└──────────────────────────────────────────────────────────┘
```
No persistent right panel on this page — clicking a card navigates to the full `/offers/[id]` route rather than opening an inline detail panel.

---

## State Architecture

The `/offers` page component owns:
| State | Type | Why it must live at the page level |
|---|---|---|
| `coordinates` | `{ lat, lng } \| null` | Needed by both the Google Places lookup and the zip fallback modal |
| `nearbyStores` | array of matched stores | Drives `StoreFilterChips` options and the Rakuten query |
| `offers` | array (raw, unfiltered) | Single source of truth; all filters derive from this without refetching |
| `activeStoreFilter` | `'all' \| 'target' \| 'walmart' \| 'cvs'` | Read by `StoreFilterChips` (active state) and the filter logic |
| `activeTab` | `'online' \| 'offline'` | Read by `OnlineOfflineTab` and the filter logic |
| `searchQuery` | string | Read by `SearchInput` and the filter logic |
| `zipFallbackOpen` | boolean | Controls `ZipFallbackModal` visibility |
| `isLoading` | boolean | Shown while the initial Rakuten fetch is in flight |

Callbacks passed down: `onStoreFilterChange`, `onTabChange`, `onSearchChange`, `onZipSubmit`. Each updates the corresponding piece of parent state; the filtered list shown in `OfferGrid` is derived (e.g. via `useMemo`) from `offers` + the three filter values — not stored separately.

---

## Home / Default View

On load:
1. Browser geolocation prompt fires.
2. **Granted:** coordinates captured → Google Maps Places API call finds the nearest of each retailer within 10 miles → `nearbyStores` set.
3. **Denied:** `ZipFallbackModal` opens. If `profile.zip_code` is already set, pre-fill it and skip the prompt; otherwise require manual entry.
4. Once a location is resolved (coordinates or zip), `GET /api/offers` is called with the store filter + location context.
5. Offers render in `OfferGrid`. Default `activeTab = 'online'`, default `activeStoreFilter = 'all'`.

### KPI / Metric Cards
Not applicable on this page (KPIs live on `/dashboard` — see `/specs/dashboard.md`).

### Activity Feed
Not applicable on this page.

---

## Filter Chips — `StoreFilterChips`
| Chip | Filter logic |
|---|---|
| All | No store filter applied |
| Target | `offer.store === 'target'` |
| Walmart | `offer.store === 'walmart'` |
| CVS | `offer.store === 'cvs'` |
| Macy's | `offer.store === 'macys'` |
| Best Buy | `offer.store === 'bestbuy'` |
| Whole Foods | `offer.store === 'wholefoods'` |
| JCPenney | `offer.store === 'jcpenney'` |

- Only stores actually matched within 10 miles appear as enabled chips (per app-plan.md's "Matched stores shown as filter chips"); unmatched retailers are omitted or shown disabled — implementation choice, default to omitting.
- Default active: **All**.
- Active style: gold pill background; inactive: `ag-bg-surface` with `ag-border-base`.
- Composes with `OnlineOfflineTab` and `SearchInput` — all three apply simultaneously (AND logic).

## Tab Toggle — `OnlineOfflineTab`
| Tab | Filter logic |
|---|---|
| Online | `offer.type === 'online'` |
| Offline | `offer.type === 'offline'` |

Default active: **Online**.

## Search — `SearchInput`
- Client-side text filter, matched against `offer.headline` and `offer.category` (case-insensitive substring match).
- Composes with the store filter and tab — applied on top of both.
- Icon: Lucide `MapPin` per the design system's `SearchInput` spec (despite the icon name, it's used as the search field's leading icon here, not a location picker).

## Offer Grid — `OfferGrid`
- 2-column grid on desktop, 1-column on mobile.
- Each item renders `<OfferCard />`: store logo (32px circle, top-left), discount badge (gold pill, top-right), headline (2-line clamp), category tag (bottom-left, `ag-genie` color), expiry (bottom-right, `ag-fg-muted`), chevron CTA.
- Empty result set (after filters) → `EmptyState`: "The Cave of Wonders is quiet…" / "Try a different location or check back soon." per the design system's Illustrations & Empty States table.

## Zip Fallback Modal — `ZipFallbackModal`
- Shown when geolocation is denied.
- Pre-filled with `profile.zip_code` if set.
- On submit, the entered/confirmed zip becomes the location context for the `GET /api/offers` call (in place of lat/lng).

---

## Database Changes Required
None beyond what's already defined in `/specs/database.md` (`offers` table serves as both the Rakuten cache and the read source for this page).

---

## API Routes

### `GET /api/offers`
**Auth:** Yes (requires `userId`)
**Params:** `store` (optional store filter for the server-side Rakuten query), `lat`/`lng` or `zip` (location context)
**Behavior:**
1. Check `offers` table for rows matching the store/location context where `is_active = true` and `created_at` is within the last 4 hours.
2. If stale or missing, call the Rakuten MerchandiseSearch API, upsert results into `offers` (marking superseded rows `is_active = false`), then serve from the table.
**Response:** `{ offers: Offer[] }` — full offer objects per the `offers` schema in `/specs/database.md`.

### `GET /api/offers/[id]`
**Auth:** Yes
**Response:** `{ offer: Offer }` — single offer by ID. Used by `/offers/[id]` (see `/specs/offer-detail.md`).

### `POST /api/offers/save`
**Auth:** Yes
**Request body:** `{ userId, offerId }`
**Behavior:** Insert into `saved_offers`. Unique `(user_id, offer_id)` constraint — a duplicate save should be treated as a no-op success (upsert or catch-and-ignore the conflict), not an error.
**Response:** `{ success: true }`

### `DELETE /api/offers/save/[id]`
**Auth:** Yes
**Behavior:** Delete the `saved_offers` row matching `user_id` + the given offer id.
**Response:** `{ success: true }`

---

## Components

| Component | File | Responsibility | Key props |
|---|---|---|---|
| `StoreFilterChips` | `components/StoreFilterChips.jsx` | Renders store chip row | `stores`, `active`, `onChange` |
| `OnlineOfflineTab` | `components/OnlineOfflineTab.jsx` | Online/Offline toggle | `active`, `onChange` |
| `OfferGrid` | `components/OfferGrid.jsx` | Renders filtered `<OfferCard />` grid | `offers` |
| `OfferCard` | `components/OfferCard.jsx` | Single deal card | `offer`, `onClick` |
| `SearchInput` | `components/SearchInput.jsx` | Text filter input | `value`, `onChange` |
| `ZipFallbackModal` | `components/ZipFallbackModal.jsx` | Zip entry when geolocation denied | `defaultZip`, `onSubmit`, `onClose` |
| `EmptyState` | `components/EmptyState.jsx` | "Cave of Wonders is quiet" empty state | `headline`, `subtext` |

---

## Edge Cases

- **No offers near the user at all** (not just filtered-to-zero): `EmptyState` shown with the location-specific copy above.
- **Filter/search combination yields zero results** while offers do exist: same `EmptyState`, but consider distinguishing copy ("Try a different location" vs. "Try a different filter") — implementation detail, default to the single shared empty state if not distinguished.
- **Geolocation denied AND no profile zip set:** `ZipFallbackModal` requires manual entry before any offers load; the page does not call `GET /api/offers` until a location context exists.
- **Rakuten API failure:** serve the most recent cached `offers` rows even if older than 4h, and surface a non-blocking "offers may be outdated" notice — never block the page on a Rakuten outage.
- **User has no nearby stores within 10 miles for any retailer:** show `EmptyState`; do not silently expand the radius without telling the user.
- **Rapid filter toggling:** all filtering is client-side and synchronous — no debounce needed except on the `SearchInput` text field (recommended ~150–250ms debounce to avoid excessive re-renders on fast typing).
