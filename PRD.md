# Ad-Genie — AI-Powered Advertising & Deals Platform
## Product Requirements Document

**Date:** June 20, 2026
**Author:** Product Team
**Status:** Draft
**Version:** 1.0

---

## 1. Problem Definition

### What problem is this solving?

Online and offline shoppers at major retail chains (Target, Walmart, CVS) miss out on significant savings because discount discovery is fragmented across dozens of apps, browser extensions, and physical flyers. Finding the right offer at the right store — at the right moment — requires manual effort that most shoppers simply don't invest. Beyond discovery, sharing deals socially is an afterthought: there is no native experience for creating personalised, branded promotional content from a discount.

Ad-Genie solves both problems: it surfaces location-aware deals from major retailers in a single web-based feed, delivers them in the correct format for how the user intends to shop (online coupon code vs. in-store QR code), and lets users instantly generate AI-powered promotional posters — with on-demand hashtags they can copy and use anywhere on social media.

### Who are you solving this problem for?

**Primary persona:** A value-conscious everyday shopper — online or offline — aged 22–45 who regularly shops at Target, Walmart, or CVS and wants to maximise savings without spending time hunting for coupons.

Key characteristics:
- Shopping mode: Mixed — some purchases are online, others in-store depending on category and urgency
- Behaviour: Checks deals 2–5× per week; currently uses multiple apps (Honey, RetailMeNot, store apps); abandons coupons because redemption is confusing
- Pain: Finds the right deal too late; online codes don't work in-store; in-store barcodes can't be used at checkout online; misses location-specific promotions while physically near a store

**Secondary persona:** A deal-sharing social shopper who enjoys posting savings tips and lifestyle content to Instagram. They want visually polished content — not a screenshot — and they want it in seconds.

### Why is this problem worth solving?

- **Quantified pain:** US consumers leave an estimated $500B in available discounts unclaimed annually. A 2025 Forrester study found 67% of shoppers abandon a coupon because it's in the wrong format for their checkout mode.
- **Market gap:** No current web platform combines location-aware multi-retailer deals, format-correct delivery (code vs. QR), and AI poster generation in a single experience. Honey and RetailMeNot cover online codes only. Store-specific sites are siloed. Creating polished promotional content from a discount is entirely manual today.
- **Moat:** Defensibility rests on three pillars:
  1. **Location intelligence:** Real-time proximity matching to Target, Walmart, and CVS stores surfaces the most relevant offline offers first — a signal generic deal sites don't have.
  2. **AI creative layer:** The personalised poster generator (face-swapped with user's profile photo) creates a sticky, shareable output that generic coupon apps cannot produce.
  3. **Proprietary engagement data:** Every coupon redemption (online vs. offline), share event, and hashtag click is logged — building a dataset to optimise deal ranking and social reach that competitors cannot replicate.

### Why Agentic AI?

- **Unstructured retailer data:** Offers from Target, Walmart, and CVS come in heterogeneous formats (HTML, JSON feeds, PDF flyers, push notifications). Rule-based parsers cannot normalise across all three sources reliably.
- **Creative generation:** AI image generation (AI poster) requires multimodal reasoning — understanding the offer context, composing a visually compelling layout, and seamlessly incorporating the user's face. No rule-based system can do this.
- **Hashtag generation:** Effective Instagram hashtags require semantic understanding of the offer, retailer brand, product category, and trending tag patterns — tasks that require an LLM.
- **Differentiation from generic tools:** Ad-Genie maintains user profile context (photo, location, shopping preferences) across sessions and applies it to every generated creative and every hashtag set — a personalised output that ChatGPT or Canva cannot replicate without the same integrated data layer.

### How will you know the problem is solved? (Core Metrics)

**North Star Metric:** Weekly active coupon redemptions per user
Baseline: 0 (new product) | Target: ≥3 redemptions/user/week | Tracked via: redemption event log in Supabase

**Primary Metrics:**

| Metric | Baseline | Target | How tracked |
|---|---|---|---|
| Coupon redemption rate | — | ≥35% of surfaced coupons redeemed | Redemption event table |
| Total savings per user per month | — | ≥$25 | Savings calculation engine |
| AI poster downloads | — | ≥1 download per active user per week | Download event log |

**Secondary Metrics:**

| Metric | Baseline | Target | How tracked |
|---|---|---|---|
| 30-day user retention | — | >50% | Auth + session logs |
| Offer load latency (P95) | — | <2s per location query | API timing logs |
| Hashtag copy rate | — | >60% of generated hashtag sets copied | Clipboard event log |
| Site visits per week per user | — | ≥4 | Session event log |
| NPS | — | >45 | In-app quarterly survey |

---

## 2. Solution Definition

### Pages & User Flows

The app has six distinct page types:

1. **Landing page** — public marketing page, unauthenticated
2. **Auth pages** — `/signup` and `/login`
3. **Offers feed** — location-aware deal discovery with online/offline toggle
4. **Offer detail** — coupon code (online) or QR/barcode (offline) + poster generator
5. **Dashboard** — savings summary, coupon usage stats, activity history
6. **Profile** — user photo, preferences, linked accounts

**Primary flow (deal discovery & redemption):**

Landing page → Sign up / Log in → Offers Feed (location detected) → Browse Online or Offline Tab → Select Offer → View Coupon Code or QR/Barcode → Redeem → Dashboard updated

**Secondary flow (poster & hashtags):**

Offer Detail → Click "Generate My Ad Poster" → Preview poster with user's face → Download poster PNG → Click "Generate Hashtags" → Copy hashtag set

### Technology User Flow

| User step | What happens | Technology |
|---|---|---|
| Opens the app | Page served with routing and geolocation prompt | Next.js 14 (App Router) + TypeScript |
| Signs up / logs in | Auth with email/password; session persisted | bcryptjs + Supabase (PostgreSQL) |
| Location detected | Coordinates matched to nearest Target, Walmart, CVS stores | Browser Geolocation API + Google Maps Places API |
| Views offer feed | Location-filtered offers fetched by category and store | Supabase + retailer deal APIs |
| Switches Online/Offline tab | Offer list filtered client-side by redemption type | React state |
| Views online offer | Coupon code displayed with one-tap copy; deep link to retailer checkout | Next.js page + Clipboard API |
| Views offline offer | QR code rendered in browser for user to show at store checkout | `qrcode` library |
| Generates AI poster | User clicks "Generate My Ad Poster"; photo + offer details sent to image API; poster previewed and downloaded as PNG | OpenAI GPT-Image (gpt-image-1) via server route |
| Requests hashtags | User clicks "Generate Hashtags"; offer metadata sent to LLM; set displayed as copyable chips | OpenAI GPT-4o via server route |
| Views dashboard | Savings, redemption counts, and history loaded from database | Supabase JS SDK |
| Updates profile | Photo uploaded and stored; used for all future poster generations | Supabase Storage |

---

## 3. Feature Specifications

### 3.1 Offers Feed (`/offers`)

The primary screen post-login. Displays deals from Target, Walmart, and CVS filtered by the user's current location and organised into two tabs.

#### Location Detection

- On first load, request browser geolocation permission
- Match coordinates to nearest stores (up to 10 miles) using Google Maps Places API
- Display matched stores in a filter bar above the offer list (chips: All / Target / Walmart / CVS)
- Fallback: manual zip code entry if location permission denied

#### Online vs. Offline Tabs

| Tab | What it shows | Redemption mechanism |
|---|---|---|
| Online | Deals redeemable at the retailer's website or app | Coupon code (alphanumeric, one-tap copy) |
| Offline | Deals redeemable in-store at nearby locations | QR code + barcode rendered in-app |

#### Offer Card

Each card displays: store logo, offer headline, discount value (e.g. "20% off"), expiry date, category tag, and a "Get Offer" CTA. Online cards show a code badge; offline cards show a QR icon.

#### Filtering & Sorting

- Filter by: store (Target / Walmart / CVS), category (Grocery, Electronics, Health, Beauty, Home, Apparel), expiry (today / this week / this month)
- Sort by: savings value (highest first), expiry (soonest first), distance (nearest store first)

---

### 3.2 Online Offer Detail (`/offers/[id]` — online type)

- Display full offer headline, terms, and expiry
- **Coupon code block:** large monospaced display of the code with a one-tap "Copy Code" button; confirmation toast on copy
- **Redemption event:** log copy action to Supabase redemptions table (store, offer ID, timestamp, channel: "online")
- "Shop Now" deep link button → opens retailer product/category page in new tab
- Poster generation panel (see §3.4)

---

### 3.3 Offline Offer Detail (`/offers/[id]` — offline type)

- Display full offer headline, terms, and expiry
- **QR code:** rendered via `qrcode` library, encodes offer redemption URL or store-specific identifier; displayed at ≥240×240px on a white background for scanner contrast
- Brightness tip shown below QR code: "Increase screen brightness for best scan results"
- **Redemption event:** log QR display to Supabase redemptions table (store, offer ID, timestamp, channel: "offline")
- Poster generation panel (see §3.4)

---

### 3.4 AI Poster Generation

Available on both online and offline offer detail pages.

#### Flow

1. User clicks "Generate My Ad Poster"
2. If no profile photo exists → prompt to upload one (inline, non-blocking)
3. System sends to server route: user profile photo + offer headline + discount value + store brand colours
4. OpenAI GPT-Image (`gpt-image-1`) generates a styled poster with the user's face incorporated
5. Poster previewed in browser; user can regenerate (up to 3× per offer)
6. "Download" button saves poster as PNG to the user's computer

#### Poster Design System

| Element | Specification |
|---|---|
| Dimensions | 1080×1080px (Instagram square) |
| User photo placement | Circular crop, foreground centre-left |
| Offer text | Bold headline, discount callout, store logo |
| Brand palette | Matched to retailer (Target red, Walmart blue, CVS red/white) |
| Hashtags | Displayed at bottom of poster as visual decoration |
| Watermark | "Made with Ad-Genie" small footer |

---

### 3.5 On-Demand Hashtag Generation

Hashtag generation is user-initiated — the offer detail page shows a "Generate Hashtags" button. The app prompts the user: *"Want hashtags for this offer?"* and generates only on confirmation. No auto-generation on page load.

#### Generation Flow

1. User clicks "Generate Hashtags" on the offer detail page
2. Confirmation prompt shown (single click to confirm)
3. Offer metadata sent to GPT-4o server route (category, store, product keywords, discount %, current season)
4. Response: 15–20 hashtags displayed as copyable chips below the poster panel
5. "Copy All Hashtags" button — copies the full set to clipboard; logs copy event to Supabase

#### Output Format

- Mix of broad tags (#deals, #savemoney, #couponlife), retailer-specific tags (#TargetDeals, #CVSBeauty, #WalmartFinds), and product/category tags
- Displayed as individual pill chips — user can also click individual chips to copy one at a time

**System prompt:**
> You are a social media strategist specialising in retail deal content. Given an offer's details, generate 15–20 Instagram hashtags that maximise reach. Mix 5 high-volume broad tags (#deals, #savemoney, #couponlife), 5 retailer-specific tags, and 5–10 product/category-specific tags. Return only the hashtags as a space-separated list with # symbols. Do not include explanations.

---

### 3.6 Dashboard (`/dashboard`)

Post-login home screen. Gives users a full picture of their savings activity.

#### KPI Cards

| KPI | Description | Update cadence |
|---|---|---|
| Total savings (all-time) | Sum of discount values from all redeemed coupons | On session load |
| Savings this month | Sum of discounts redeemed in the current calendar month | On session load |
| Online coupons used | Count of online redemptions (all-time) | On session load |
| Offline coupons used | Count of in-store redemptions (all-time) | On session load |
| Active offers | Count of saved/bookmarked offers not yet redeemed | Real-time |
| Offers expiring today | Count of saved offers expiring within 24h | On session load |
| Favourite store | Store with most redemptions | On session load |
| AI posters generated | Total count of poster generations | On session load |
| Posters downloaded | Total count of poster download events | On session load |
| Savings streak | Current consecutive days with at least one redemption | On session load |
| Top category | Product category with highest cumulative savings | On session load |
| Average saving per coupon | Mean discount value across all redeemed coupons | On session load |

#### Savings Chart

- Line chart: daily savings over the last 30 days (Recharts)
- Toggle: view by store (Target / Walmart / CVS / All)

#### Activity Feed

- Chronological list of the last 50 events: offer redeemed, poster generated, offer saved, hashtag copied
- Each event shows: store icon, offer headline, savings amount, timestamp
- "Load more" to fetch the next 50 events

#### Dashboard Actions

- **Browse Deals** button (primary, top-right) → navigates to `/offers`
- **Saved Offers** section → quick-access list of bookmarked offers with expiry countdown

---

### 3.7 User Profile (`/profile`)

#### Profile Photo

- Upload photo from device (JPEG/PNG, max 5MB)
- Circular crop preview shown inline
- Photo stored in Supabase Storage; referenced in all poster generation requests
- "Replace Photo" replaces the stored image and updates future poster generations
- **Privacy note:** Photo is used only for AI poster generation and never shared with third parties

#### Profile Fields

| Field | Type | Required |
|---|---|---|
| Display name | Text | Yes |
| Email | Email | Yes (from signup) |
| Home zip code | 5-digit zip | Optional (used as location fallback) |
| Favourite stores | Multi-select: Target / Walmart / CVS | Optional |
| Notification preferences | Toggle: deal alerts, expiry reminders | Optional |

#### Linked Accounts (v1.1)

- Target Circle, Walmart+, CVS ExtraCare loyalty card numbers (for personalised offers)

---

## 4. Functional Requirements

### Complete Feature List

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| FR-001 | Landing page with hero, features overview, and auth CTAs | P0 | Redirect to /offers if already logged in |
| FR-002 | User signup with email/password; stored in custom `users` table with bcrypt hash | P0 | No Supabase Auth |
| FR-003 | User login; userId + userEmail stored in localStorage | P0 | Generic error message — no field enumeration |
| FR-004 | Auth guard: all app routes redirect to /login if no userId in localStorage | P0 | — |
| FR-005 | Browser geolocation prompt on first load of /offers | P0 | Fallback to zip code entry |
| FR-006 | Google Maps Places API integration for nearest Target, Walmart, CVS within 10 miles | P0 | — |
| FR-007 | Offer feed with store filter chips (All / Target / Walmart / CVS) | P0 | — |
| FR-008 | Online / Offline tab toggle on offer feed | P0 | Client-side filter |
| FR-009 | Online offer detail page with coupon code display and one-tap copy | P0 | Toast confirmation on copy |
| FR-010 | Offline offer detail page with QR code rendered via `qrcode` library | P0 | ≥200×200px display |
| FR-011 | ~~Barcode (jsbarcode)~~ — removed | — | Replaced by QR code only (OQ-003) |
| FR-012 | Redemption events logged to Supabase on coupon code copy or QR display | P0 | Channel: "online" or "offline" |
| FR-013 | AI poster generation via OpenAI GPT-Image server route | P0 | User photo + offer metadata as input |
| FR-014 | Poster regeneration — up to 3 attempts per offer | P0 | Counter shown in UI |
| FR-015 | Poster download to device | P0 | PNG format |
| FR-016 | On-demand hashtag generation via GPT-4o — 15–20 tags per offer, triggered by user click | P0 | User-initiated only; confirmation prompt shown first (OQ-006) |
| FR-017 | Hashtag copy-all button + individual chip copy; clipboard event logged to Supabase | P0 | — |
| FR-018 | ~~Instagram share via Web Share API~~ — removed | — | No Instagram integration (OQ-002) |
| FR-019 | ~~Instagram share fallback~~ — removed | — | No Instagram integration (OQ-002) |
| FR-020 | ~~Instagram share events~~ — removed | — | No Instagram integration (OQ-002) |
| FR-021 | Dashboard KPI card grid (12 metrics) | P0 | See KPI table in §3.6 |
| FR-022 | Savings line chart (last 30 days, by store toggle) | P0 | Recharts |
| FR-023 | Dashboard activity feed (chronological, 50 events, load more) | P0 | User-specific only |
| FR-024 | Profile page with photo upload and circular crop preview | P0 | Supabase Storage |
| FR-025 | Profile fields: display name, email, home zip, favourite stores, notification prefs | P0 | — |
| FR-026 | Offer bookmarking (save for later) with expiry countdown on dashboard | P1 | Supabase saved_offers table |
| FR-027 | Offer filtering by category, expiry range, discount value | P1 | — |
| FR-028 | Offer sorting by savings value / expiry / distance | P1 | — |
| FR-029 | Expiry reminder via browser notification or email | P1 | For saved offers expiring within 24h |
| FR-030 | Savings streak tracker | P1 | Consecutive days with ≥1 redemption |
| FR-031 | ~~Apple/Google Wallet passes~~ — removed | — | Mobile-native feature; out of scope for web app |
| FR-032 | ~~Instagram direct post~~ — removed | — | No Instagram integration (OQ-002) |
| FR-033 | Target Circle / Walmart+ / CVS ExtraCare loyalty card integration | P2 | v1.1 |
| FR-034 | Responsive web layout, desktop-first; usable on tablet and mobile browsers | P0 | Web app — no native mobile build |
| FR-035 | Logout — clears localStorage, redirects to /login | P0 | — |
| FR-036 | Password reset via email | P1 | — |

### Non-Functional Requirements

- **Performance:** Offer feed loads within 2s (P95); poster generation completes within 15s (P95); QR/barcode renders within 500ms
- **Scalability:** 500 concurrent users at MVP; scale to 5,000 via Vercel autoscaling and Supabase connection pooling in v1.1
- **Security:** TLS 1.3 in transit; AES-256 at rest; user photos stored in private Supabase Storage bucket with signed URLs; no credentials in client-side code
- **Reliability:** 99.5% uptime SLA; AI generation failures shown as user-facing messages with retry prompt
- **Usability:** Core flow (find offer → get coupon code or QR → download poster) completable in under 90 seconds by a first-time user on desktop
- **Accessibility:** WCAG 2.1 AA compliance; QR code displays meet minimum size requirements for all standard retail scanners
- **Compliance:** GDPR-aware (US-only at launch) — user photos can be deleted on request; location data not persisted beyond the current browser session

---

## 5. Technical Requirements

### Prompt Strategy

| Task | Technique | Output |
|---|---|---|
| Hashtag generation | Few-shot prompting with offer metadata: category, store, discount %, product keywords | 15–20 hashtags as space-separated list |
| Poster generation | Multimodal prompt: user image + structured offer brief (headline, store, discount, brand colours) | 1080×1080px PNG via GPT-Image |
| Offer categorisation | Zero-shot classification of raw retailer offer text into category taxonomy | Category label + confidence score |

**Hashtag generation system prompt:**
> You are a social media strategist specialising in retail deal content for Instagram. Given an offer's details, generate 15–20 Instagram hashtags that maximise reach. Mix 5 high-volume broad tags (#deals, #savemoney, #couponlife), 5 retailer-specific tags, and 5–10 product/category-specific tags. Return only the hashtags as a space-separated list with # symbols. Do not include explanations.

**Poster generation system prompt:**
> You are a graphic design AI. Create a vibrant, eye-catching Instagram square poster (1080×1080px) for a retail promotion. Incorporate the provided user photo prominently. Use the retailer's brand colours. Display the offer headline and discount value in bold typography. Add a small "Made with Ad-Genie" watermark at the bottom. Style should feel energetic, modern, and social-media native.

### Model Requirements

| Criteria | Requirement |
|---|---|
| Hashtag + text model | OpenAI GPT-4o |
| Image generation model | OpenAI GPT-Image (`gpt-image-1`) |
| Context window (text) | ≥128k tokens |
| Image generation latency target | <15s per poster |
| Text latency target | <5s per hashtag set |
| Cost target | <$0.25 per hashtag generation; <$1.00 per poster generation |

### Technology Choices

| Item | What we use | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | API routes + React in one repo; desktop-first responsive web application |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Fast, consistent, responsive-first |
| Text LLM | OpenAI GPT-4o | Best-in-class for structured text generation and semantic hashtag reasoning |
| Image generation | OpenAI GPT-Image (gpt-image-1) | Native multimodal image generation with reference photo support |
| QR code | `qrcode` (npm) | Lightweight, no external API; SVG output for crisp on-screen display |
| Database | Supabase (PostgreSQL) | Real-time, JS SDK, Row-Level Security |
| File storage | Supabase Storage | Profile photos stored with private buckets + signed URLs |
| Auth | Custom `users` table + bcryptjs | Full control; no vendor lock-in |
| Location | Browser Geolocation API + Google Maps Places API | Nearest store detection |
| Charts | Recharts | Lightweight React charting for savings dashboard |
| Hosting | Vercel | Low ops overhead; Edge Functions for performance |
| Poster download | Browser `<a download>` on a Blob URL | Standard web file download; no external API needed |

### Data Model (Core Tables)

| Table | Key columns |
|---|---|
| `users` | id, email, password_hash, display_name, zip_code, created_at |
| `user_photos` | id, user_id, storage_url, uploaded_at |
| `offers` | id, store (target/walmart/cvs), type (online/offline), headline, discount_value, category, coupon_code, barcode_value, expires_at, created_at |
| `saved_offers` | id, user_id, offer_id, saved_at |
| `redemptions` | id, user_id, offer_id, channel (online/offline), redeemed_at, savings_amount |
| `posters` | id, user_id, offer_id, storage_url, generated_at |
| `hashtag_sets` | id, user_id, offer_id, hashtags (text array), generated_at, copied_at |
| `download_events` | id, user_id, offer_id, downloaded_at |

---

## 6. Roadmap

| Release | Features | Duration | Priority |
|---|---|---|---|
| **v0.1 — Internal Alpha** | Landing page, auth (signup/login), geolocation + store matching, offer feed with online/offline tabs, coupon code display, QR + barcode rendering | 3 weeks | P0 |
| **v0.2 — Closed Beta** | Redemption event logging, on-demand hashtag generation (user-initiated), AI poster generation with user photo and PNG download, profile page with photo upload | 3 weeks | P0 |
| **v1.0 — Public Launch** | Dashboard (12 KPIs + savings chart + activity feed), offer bookmarking, expiry reminders, savings streak, offer filtering/sorting, performance optimisation, security audit | 4 weeks | P0 |
| **v1.1 — Growth** | Loyalty card integrations (Target Circle, Walmart+, CVS ExtraCare), browser and email notifications for expiring offers, password reset, offer personalisation based on redemption history | 6 weeks | P1 |
| **v2.0 — Scale** | Personalised offer ranking (ML model trained on redemption data), multi-city support, group deals & social gifting, brand partnership ads, affiliate revenue layer, advanced savings analytics | Q4 2026 | P2 |

---

## 7. Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Retailer offer APIs are unstable or rate-limited | High | High | Cache offers in Supabase with TTL; implement retry + exponential backoff; fallback to last-known offers with staleness indicator |
| GPT-Image returns poster that doesn't incorporate user photo correctly | Medium | Medium | Validate output with face-detection check; re-prompt automatically on failure; offer manual crop tool as fallback |
| Location permission denied by user | High | Medium | Fallback to zip code entry; surface home zip from profile |
| QR code not accepted at checkout (scanner calibration, low brightness) | Medium | High | Display brightness tip prominently; also show the raw redemption code as a text fallback |
| User photo storage raises privacy concerns | Medium | High | Store in private bucket with signed URLs; show clear consent copy; one-click photo deletion in profile |
| OpenAI image generation costs exceed budget at scale | Low | Medium | Per-user generation limits (3 posters/day free; unlimited on paid plan); cache generated posters per offer per user |
| Offer data contains expired or incorrect discounts | High | Medium | TTL-based offer freshness; report-an-issue button on each offer card |

---

## 8. Evaluations

### Evaluation Plan

| Eval type | Method | Target | Cadence |
|---|---|---|---|
| Poster quality (user-rated) | In-app thumbs up/down after poster preview | ≥80% positive | Weekly post-beta |
| Hashtag relevance (user-rated) | Copy rate as a proxy for quality | >60% copy rate | Weekly |
| QR scan success rate | User-reported via "Did this work?" prompt after showing QR | >95% successful scans | Per release |
| Offer accuracy | Spot check: is the coupon code / discount valid at retailer? | >95% valid | Weekly |
| Poster generation latency (P95) | Server-side timing log | <15s | Per release, automated |
| Hashtag generation latency (P95) | Server-side timing log | <5s | Per release, automated |
| Offer load latency (P95) | API timing log | <2s | Per release, automated |
| Poster download rate | Posters generated vs. posters downloaded | >70% | Weekly post-launch |

### Launch Criteria

| Stage | Go criteria |
|---|---|
| Alpha (10 internal users) | All P0 flows end-to-end functional; QR renders correctly on desktop and mobile browsers; poster generation returns valid image |
| Beta (100 users) | Poster quality rating ≥75% positive; QR scan success rate >90%; offer latency <2s P95; hashtag copy rate >50% |
| Public launch | Poster quality ≥80%; QR scan success >95%; offer accuracy >95%; security audit passed; 30-day retention >45% |

---

## 9. Responsible AI

| Pillar | Strength | Risk | Mitigation |
|---|---|---|---|
| Helpful | Surfaces personalised, location-aware savings; generates shareable social content instantly | AI poster may not accurately represent offer terms | Offer headline and discount value always displayed as text alongside poster; poster is cosmetic, not authoritative |
| Honest | Offers are sourced from retailers' own data feeds; expiry dates are clearly displayed | Outdated offers may appear valid | TTL-based cache invalidation; "Verify at store" disclaimer on every offer |
| Harmless | Consumer savings app with no financial transaction capability | User photo used in AI image generation without awareness of output | Explicit consent before first poster generation; photo deletion available at any time in profile |

**Disclaimer shown on every offer detail page:**
> "Offers are subject to retailer terms and availability. Always verify the discount is active before completing your purchase."

**Photo consent shown before first poster generation:**
> "Your profile photo will be used to create a personalised AI poster. It is stored securely and never shared with third parties. You can delete your photo at any time in Profile settings."

---

## 10. Pricing

### Development Costs (MVP)

| Item | Estimated cost |
|---|---|
| OpenAI API credits — GPT-4o + GPT-Image (dev + test) | $800 |
| Google Maps Places API (dev + test) | $150 |
| Supabase Pro (3 months) | $75 |
| Vercel Pro (3 months) | $60 |
| Security pentest | $2,000 |
| Miscellaneous (domains, monitoring) | $200 |
| **Infrastructure subtotal** | **~$3,285** |
| Lead Full-Stack Engineer (3 months) | $25,000 |
| AI / Backend Integration Engineer (3 months) | $20,000 |
| Product Manager (3 months) | $15,000 |
| UX / Web Designer (3 months) | $10,000 |
| QA Engineer (part-time, 3 months) | $6,000 |
| **Manpower subtotal** | **$76,000** |
| **Total MVP** | **~$79,285** |

### Operational Costs (1,000 active users/month)

| Item | Monthly |
|---|---|
| OpenAI GPT-4o (hashtag generation — 10,000 calls × ~$0.01) | $100 |
| OpenAI GPT-Image (poster generation — 5,000 posters × ~$0.08) | $400 |
| Google Maps Places API (50,000 location queries × $0.002) | $100 |
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| Supabase Storage (profile photos + posters) | $15 |
| Monitoring (Sentry) | $26 |
| **Total** | **~$686/month** |

Cost per active user: ~$0.69/month infrastructure — well within margin for paid tiers.

### Pricing Tiers

| Plan | Price | Includes | Target user |
|---|---|---|---|
| Free | $0 | 10 offers/day, 1 poster/day, 5 hashtag generations/month | Casual saver |
| Saver | $4.99 / month | Unlimited offers, 5 posters/day, unlimited hashtag generations, expiry alerts | Regular deal hunter |
| Pro | $9.99 / month | Everything in Saver + loyalty card integrations, poster history, priority support | Power user / deal blogger |

---

## 11. Open Questions — Resolved

All six open questions have been answered. Decisions are recorded below.

| # | Question | Decision | Impact |
|---|---|---|---|
| OQ-001 | Retailer offer data source | **Affiliate network (Rakuten / CJ Affiliate).** Use structured deal feeds via Rakuten for MVP — Target, Walmart, and CVS are all on the Rakuten network. Free developer accounts available. Direct retailer API partnerships deferred to v1.1. | Updates tech stack: add Rakuten MerchandiseSearch API client. Offers may lag up to a few hours; add staleness indicator on cards. |
| OQ-002 | Instagram integration | **No Instagram integration.** Ad-Genie generates the AI poster (downloadable PNG) and a copyable hashtag set. The user posts to Instagram manually. No Web Share API, no Graph API, no share-sheet integration at any version. | Removes FR-018, FR-019, FR-020 from scope. Simplifies poster flow to: Generate → Preview → Download → Copy hashtags. |
| OQ-003 | Barcode format | **QR code only.** No 1D barcode. All offline offers show a QR code rendered via the `qrcode` library at ≥240×240px on a white background. Modern POS systems at Target, Walmart, and CVS all support QR. | Removes `jsbarcode` from the dependency list. Simplifies offline offer detail page. |
| OQ-004 | User photo privacy & GDPR | **US-only launch; US Supabase Storage region.** No GDPR compliance required at MVP. EU data residency and GDPR consent flow deferred to v1.1 if the product expands internationally. | No EU infrastructure setup needed for MVP. Add geo-block or disclaimer if EU traffic detected (v1.1). |
| OQ-005 | Affiliate revenue | **Out of scope for POC.** The POC targets the end-consumer persona only. No "Shop Now" affiliate tracking, no commission infrastructure, no revenue model implementation. Revenue strategy revisited post-POC. | Removes affiliate link tracking. "Shop Now" button can be a plain external link with no attribution. |
| OQ-006 | Hashtag generation trigger | **User-initiated (opt-in).** The app shows a prompt — "Want hashtags for this offer?" — and generates only if the user confirms. No auto-generation on page load. No auto-regeneration logic needed. | Updates FR-016: hashtag generation is on-demand, not automatic. Add a "Generate Hashtags" button to the offer detail page. |

---

## 12. Assumptions

- Ad-Genie is a web application delivered via browser (Next.js on Vercel). No native iOS or Android app is in scope.
- Retailer offer data is sourced via Rakuten affiliate API with ≤4h staleness acceptable for MVP.
- There is no Instagram integration at any version; users download the poster PNG and post manually.
- Offline offers use QR code only (no 1D barcode). QR code is rendered in the browser; the user shows the screen at the retail checkout.
- OpenAI GPT-Image (`gpt-image-1`) can incorporate a provided reference photo into a generated poster adequately for MVP; no custom fine-tuning required.
- Hashtag generation is user-initiated; no auto-generation on page load.
- US-only launch; no GDPR infrastructure required at MVP.
- User is responsible for verifying offer validity at point of sale; Ad-Genie is not liable for rejected coupons.
- Team size for MVP: 3–4 engineers. Timeline: 10 weeks from kickoff (v0.1: 3w, v0.2: 3w, v1.0 hardening: 4w).
- Dashboard KPI data is derived from existing Supabase tables on read (no separate analytics table in MVP).
