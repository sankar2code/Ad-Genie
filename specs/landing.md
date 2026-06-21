# Landing Page Spec

Generated from `/blueprint/app-plan.md`. Structural guide: `dashboard-spec-template.md` (adapted — this is a public marketing page, not an authenticated app shell, so state/auth-specific sections are marked not applicable).

---

## Feature Name
Landing Page (`/`)

---

## Description
- Public marketing page at route `/`. No auth required.
- Single static page: hero, feature grid, retailer strip, and a footer, wrapped by a public nav (`LandingNav`) rather than the authenticated `<Nav />` rail.
- Purpose: communicate the two core value props (deal discovery across Target/Walmart/CVS, AI poster + hashtag generation) and drive the user to `/signup` or `/login`.
- No client-side state, no API calls, no data fetching — fully static content rendered server-side by Next.js.

---

## Layout

```
┌──────────────────────────────────────────────┐
│  LandingNav (sticky top)                      │
├──────────────────────────────────────────────┤
│  HeroSection                                  │
│  FeaturesGrid (2×3)                           │
│  RetailerStrip                                │
│  FooterSection                                │
└──────────────────────────────────────────────┘
```
Single-column scroll, no sidebar, no persistent right panel. Full-width sections stacked vertically.

---

## State Architecture
Not applicable — the landing page is stateless. No shared state, no callbacks, no client component state beyond what's needed for scroll-triggered fade-in animations (`ag-fade-in` class per the design system Motion section).

---

## Home / Default View

### Hero Section
- `HeroSection` — gradient headline (Cinzel, `text-display`), gold glow orb decorative element, two CTAs: "Get started" (Primary gold → `/signup`) and "Sign in" (Ghost → `/login`).
- Dark mode (Night Sky) styling — this page is not part of the `(auth)` light-theme route group.

### Features Grid
- `FeaturesGrid` — 6 feature cards in a 2×3 grid (1 column on mobile). Cards use the general Card/Panel spec: `ag-bg-surface` background, `ag-border-base` border, 12px radius, 20px padding.
- Content per app-plan.md's two core value props: deal discovery (location-aware, online/offline format detection) and social content creation (AI poster + hashtags). The remaining 4 cards expand on supporting capabilities (multi-retailer coverage, savings dashboard, QR/coupon redemption, profile personalization) — exact copy is a content decision, not specced here.

### Retailer Strip
- `RetailerStrip` — horizontal logo bar for Target, Walmart, CVS using each retailer's brand colors per the design system's Retailer Accent Colors table (Target `#CC0000`, Walmart `#0071CE`/`#FFC220`, CVS `#CC0000`/`#004B87`).

### Activity Feed
Not applicable — no activity data exists pre-signup.

---

## Sidebar
Not applicable — replaced by `LandingNav`, a horizontal top nav (not a left rail):
- Left: Ad-Genie lamp logo + Cinzel wordmark
- Right: "Sign in" link + "Get started" button

## Right Panel
Not applicable.

---

## Database Changes Required
None — this page reads and writes no data.

---

## API Routes
None — fully static.

---

## Components

| Component | File | Responsibility | Key props |
|---|---|---|---|
| `LandingNav` | `components/LandingNav.jsx` | Public top nav — logo, Sign in / Get started links | none |
| `HeroSection` | `components/HeroSection.jsx` | Gradient headline, glow orb, two CTAs | none |
| `FeaturesGrid` | `components/FeaturesGrid.jsx` | 6-card feature grid | none |
| `RetailerStrip` | `components/RetailerStrip.jsx` | Target / Walmart / CVS logo bar | none |
| `FooterSection` | `components/FooterSection.jsx` | Footer links | none |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Already-logged-in user visits `/` | No redirect logic specified in app-plan.md — page renders normally; "Get started"/"Sign in" CTAs still route to `/signup`/`/login` (acceptable since auth guard only protects `app/(app)/*`, not `/`) |
| User on mobile viewport | `FeaturesGrid` collapses to 1 column; `LandingNav` remains horizontal with condensed spacing |
| Slow network / first load | No loading state needed — page is static and server-rendered |
