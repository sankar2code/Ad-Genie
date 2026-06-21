# Dashboard Spec

Generated from `/blueprint/app-plan.md` and `PRD.md` §3.6/§5. Structural guide: `dashboard-spec-template.md`.

---

## Feature Name
Dashboard (`/dashboard`)

---

## Description
- Authenticated page summarizing the user's savings activity: a 12-card KPI grid, a 30-day savings line chart, an activity feed, and a saved-offers quick-access list.
- All KPI and activity data is **derived from existing Supabase tables on read** — there is no separate analytics/aggregation table in MVP (PRD §"Assumptions"). Every value is computed from `redemptions`, `posters`, `download_events`, `hashtag_sets`, `saved_offers`.
- On mount, the page queries these tables for the current user, computes KPI values **client-side** from the query results, and renders the chart and feed from the same data.
- Default view = the only view; there is no list→detail transition on this page (unlike a typical sidebar/detail dashboard).

---

## Layout

```
┌──────────────────────────────────────────────────────────┐
│  <Nav /> 72px  │  KPIGrid (12 cards, 4×3 or 3×4)          │
│                │  SavingsChart (with store toggle)         │
│                │  SavedOffersList                           │
│                │  ActivityFeed (50 events, Load more)       │
└──────────────────────────────────────────────────────────┘
```
Single scrollable column within the main content area (no separate right panel — this page IS the detail view).

---

## State Architecture

The `/dashboard` page component owns:
| State | Type | Why it must live at the page level |
|---|---|---|
| `redemptions` | array | Source for KPIs (total savings, online/offline counts, favourite store, top category, avg saving, streak) and the savings chart |
| `posters` | array | Source for "AI posters generated" KPI and activity feed entries |
| `downloadEvents` | array | Source for "Posters downloaded" KPI and activity feed entries |
| `hashtagSets` | array | Source for hashtag-copy activity feed entries |
| `savedOffers` | array | Source for "Active offers" / "Offers expiring today" KPIs and `SavedOffersList` |
| `chartStoreFilter` | `'all' \| 'target' \| 'walmart' \| 'cvs'` | Read by `SavingsChart` toggle, filters the same `redemptions` data without refetching |
| `activityLimit` | number, starts at 50 | Controls how many feed rows render; "Load more" increments by 50 |
| `isLoading` | boolean | Shown while the initial batch of queries is in flight |

All 12 KPI values and the chart series are **derived** (e.g. `useMemo`) from the five arrays above — none are fetched as pre-aggregated values from a dedicated endpoint, per the "no separate analytics table" assumption.

---

## Home / Default View

This page has no alternate "nothing selected" state distinct from its default — it always shows the full KPI grid, chart, and feed, with empty-state treatment inside the feed/saved-offers sections if the user has no activity yet.

### KPI / Metric Cards

| KPI | Description | Source | Update cadence |
|---|---|---|---|
| Total savings (all-time) | Sum of `savings_amount` across all `redemptions` | `redemptions` | On session load |
| Savings this month | Sum of `savings_amount` where `redeemed_at` is in the current calendar month | `redemptions` | On session load |
| Online coupons used | Count of `redemptions` where `channel = 'online'` | `redemptions` | On session load |
| Offline coupons used | Count of `redemptions` where `channel = 'offline'` | `redemptions` | On session load |
| Active offers | Count of `saved_offers` not yet redeemed (no matching `redemptions` row for that `offer_id` + `user_id`) | `saved_offers`, `redemptions` | Real-time (client-derived on every load) |
| Offers expiring today | Count of `saved_offers` whose joined `offers.expires_at` is within 24h | `saved_offers` + `offers` | On session load |
| Favourite store | `store` value with the highest count of `redemptions` | `redemptions` | On session load |
| AI posters generated | Total count of `posters` rows | `posters` | On session load |
| Posters downloaded | Total count of `download_events` rows | `download_events` | On session load |
| Savings streak | Current count of consecutive calendar days with ≥1 `redemptions` row, counting back from today | `redemptions` | On session load |
| Top category | `offers.category` (joined via `offer_id`) with the highest cumulative `savings_amount` | `redemptions` + `offers` | On session load |
| Average saving per coupon | Mean `savings_amount` across all `redemptions` | `redemptions` | On session load |

- Single batch of Supabase queries on mount (one query per table, not per KPI) — all 12 values are computed from that one batch, avoiding 12 separate round trips.
- **Loading state:** skeleton placeholder matching the value's dimensions (e.g. a shimmering block where the Cinzel value will render).
- **Error state:** show `--` as the value with a muted sub-label (e.g. "Couldn't load") if any underlying query fails — do not block the rest of the grid if one query fails.
- **Layout:** 12-card grid, responsive — 4 columns desktop, 2 columns tablet, 1 column mobile.
- **Card anatomy** (per `KPICard` component spec in app-plan.md / design system): icon (24px, gold or teal by category), Cinzel value (`text-display`, 28px/600), `text-caption` label, optional trend arrow (`ag-success`/`ag-error`).

### Savings Chart
- Recharts `LineChart`, daily savings summed per day for the **last 30 days**, derived from `redemptions.savings_amount` grouped by `redeemed_at` date.
- Store toggle chips: All / Target / Walmart / CVS / Macy's / Best Buy / Whole Foods / JCPenney — filters the same loaded `redemptions` array client-side (no refetch), re-grouped by day for the selected store(s).
- Styling per design system: gold line (`ag-accent`, 2px stroke), 6px filled dot, grid lines `rgba(255,255,255,0.06)`, tooltip on `ag-bg-elevated`.

### Activity Feed
- Chronological list of the most recent 50 events, merged from four sources: offer redeemed (`redemptions`), poster generated (`posters`), offer saved (`saved_offers`), hashtag copied (`hashtag_copy_events`/`hashtag_sets.copied_at`).
- Each row: store icon, offer headline (joined via `offer_id`), savings amount (if applicable to that event type), relative timestamp.
- Sort: merged array sorted descending by event timestamp, sliced to `activityLimit`.
- "Load more" increments `activityLimit` by 50 and re-renders from already-fetched data if available, or triggers a paginated fetch for older events if the initial load was capped server-side (implementation choice — given the "no separate analytics table" approach, the simplest implementation fetches a generous window, e.g. last 200 events across all four tables, and paginates client-side from that; only re-query Supabase if the user scrolls past what was initially fetched).
- **Empty state:** "No activity yet — head to the offers feed to start saving." with a CTA into `/offers`.

---

## Sidebar
Not applicable — this page uses the shared `<Nav />` rail (see app-plan.md "Components: Shared/Global"), not a page-specific sidebar with search/filter/item-list, since there is no list of dashboard "items" to navigate between.

## Right Panel
Not applicable — no detail panel; the full page IS the detail view.

### Saved Offers List (`SavedOffersList`)
- Quick-access list of bookmarked offers (`saved_offers` joined with `offers`).
- Each row shows the offer headline, store, and an expiry countdown (derived from `offers.expires_at`).
- Clicking a row navigates to `/offers/[id]`.

---

## Database Changes Required
None beyond `/specs/database.md` — every KPI, chart series, and feed entry is derived from the existing tables (`redemptions`, `posters`, `download_events`, `hashtag_sets`, `saved_offers`, `offers`). No new columns, tables, triggers, or indexes are required specifically for this page; the indexes already specified on `user_id` for each event table (in `/specs/database.md`) are what keep these per-user queries fast.

---

## API Routes

### `GET /api/dashboard`
**Auth:** Yes
**Purpose:** Aggregate KPI data from Supabase for the current user — app-plan.md's API Routes table lists this as a dedicated endpoint. Recommended implementation: this route runs the same five queries server-side (using the service-role key, consistent with the RLS approach in `/specs/database.md`) and returns the raw arrays (or pre-computed KPI values) so the client never needs direct anon-key access to these tables.
**Response:** `{ redemptions, posters, downloadEvents, hashtagSets, savedOffers }` (raw arrays, with KPI computation staying client-side per the "derived on read" approach) — or, alternatively, `{ kpis: {...}, chartSeries: [...], activityFeed: [...] }` if computation is moved server-side. Either is consistent with app-plan.md; raw-arrays is simpler to implement first and matches the literal "On mount: Supabase JS SDK queries..." flow description, just proxied through this route instead of direct client-side Supabase calls (see the RLS note in `/specs/database.md` about preferring the API-route path over direct client Supabase queries).

---

## Components

| Component | File | Responsibility | Key props |
|---|---|---|---|
| `KPIGrid` | `components/KPIGrid.jsx` | 12-card grid layout | `kpis` |
| `KPICard` | `components/KPICard.jsx` | Single metric card | `icon`, `value`, `label`, `trend` |
| `SavingsChart` | `components/SavingsChart.jsx` | Recharts line chart + store toggle | `redemptions`, `storeFilter`, `onStoreFilterChange` |
| `ActivityFeed` | `components/ActivityFeed.jsx` | Chronological event list + Load more | `events`, `limit`, `onLoadMore` |
| `SavedOffersList` | `components/SavedOffersList.jsx` | Bookmarked offers with expiry countdown | `savedOffers` |

---

## Edge Cases

- **Brand-new user, zero activity:** all 12 KPIs render `0` or `--` (not blank); chart renders an empty/flat line or an empty-chart placeholder; `ActivityFeed` and `SavedOffersList` show their respective empty states.
- **One of the five underlying queries fails:** that section degrades gracefully (KPIs relying on it show `--`, chart/feed sections relying on it show an inline retry) — a single failed query must not blank the whole page.
- **Savings streak calculation when there's a gap then a redemption today:** streak counts only the unbroken run ending today; a gap resets the streak to start counting from the most recent unbroken run.
- **"Active offers" KPI when a saved offer has since expired:** still counts as "active" (not yet redeemed) unless explicitly excluded — app-plan.md does not specify excluding expired-but-unredeemed saves from this count; default to counting them, since "Offers expiring today" is the dedicated KPI for urgency.
- **Store toggle on the chart when the user has no redemptions for that store:** chart renders empty/flat for that filter rather than hiding the chart entirely.
- **Load more clicked with no further events available:** button disables or hides once the merged event list is exhausted.
