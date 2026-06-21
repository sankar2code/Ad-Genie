# Ad-Genie Design System

**Theme:** Arabian Nights — Aladdin & the Magic Genie
**Inspired by:** The Cave of Wonders, the Magic Lamp, and midnight skies over Agrabah

---

## Brand Aesthetic

Rich, magical, warm. Every surface should feel like it was pulled from an enchanted bazaar — deep midnight blues, glowing gold, and bursts of jewel colour. The interface should feel alive: like the Genie has just poured out of the lamp and is ready to grant your next wish.

Dark mode is the primary product experience (offers feed, dashboard, poster generator).
Light mode (desert sand palette) is used for auth and onboarding surfaces.

Decoration earns its place — but here, magic IS the brand. Subtle glow edges, gold shimmer accents, and smoke-reveal animations are deliberate, not noise.

---

## Color System

### Dark Mode — Night Sky (product: offers feed, dashboard, poster, profile)

| Token | Hex | Use |
|---|---|---|
| `ag-bg-base` | `#0D0B1E` | Page / app background — deep midnight |
| `ag-bg-subtle` | `#13112A` | Sidebar, nav, secondary surfaces |
| `ag-bg-surface` | `#1C1A38` | Cards, input fields, elevated panels |
| `ag-bg-elevated` | `#252348` | Dropdowns, modals, tooltips |
| `ag-border-base` | `rgba(212,175,55,0.12)` | Default dividers and borders — gold tint |
| `ag-border-strong` | `rgba(212,175,55,0.28)` | Focused inputs, active states |
| `ag-fg-base` | `#F5EDD6` | Primary text — warm parchment |
| `ag-fg-subtle` | `#A89B7A` | Secondary text, placeholders, metadata |
| `ag-fg-muted` | `#6B6047` | Disabled text, timestamps |
| `ag-fg-inverted` | `#0D0B1E` | Text on gold accent backgrounds |
| `ag-accent` | `#D4AF37` | Primary accent — royal gold (the lamp) |
| `ag-accent-hover` | `#B8962E` | Gold hover state |
| `ag-accent-subtle` | `rgba(212,175,55,0.15)` | Gold tint for backgrounds |
| `ag-genie` | `#2DC7C7` | Genie teal — secondary accent |
| `ag-genie-hover` | `#22AAAA` | Genie teal hover |
| `ag-genie-subtle` | `rgba(45,199,199,0.15)` | Genie tint for backgrounds |
| `ag-jewel-sapphire` | `#1B5FA8` | Sapphire — info / online coupon states |
| `ag-jewel-emerald` | `#1A7A4A` | Emerald — success / savings confirmed |
| `ag-jewel-ruby` | `#A82332` | Ruby — error / expired offer |
| `ag-success` | `#3DAA6E` | Success states — emerald |
| `ag-warning` | `#E6A817` | Warning states — amber gold |
| `ag-error` | `#C94040` | Error states — ruby |
| `ag-star` | `rgba(212,175,55,0.6)` | Star / sparkle decorative elements |

### Light Mode — Desert Sand (auth, login, signup)

| Token | Hex | Use |
|---|---|---|
| `ag-bg-base` | `#FDF6E3` | Page background — warm parchment |
| `ag-bg-subtle` | `#F5E9C8` | Input backgrounds, subtle cards |
| `ag-bg-surface` | `#EDD9A3` | Elevated surfaces — sand |
| `ag-bg-elevated` | `#E3CA84` | Modals on light |
| `ag-border-base` | `rgba(0,0,0,0.08)` | Default borders |
| `ag-border-strong` | `rgba(139,101,17,0.30)` | Focused inputs — gold tint |
| `ag-fg-base` | `#1C1533` | Primary text — deep midnight |
| `ag-fg-subtle` | `#5C4A1A` | Secondary text — dark sand |
| `ag-fg-muted` | `#8C7040` | Placeholders |
| `ag-fg-inverted` | `#FDF6E3` | Text on dark surfaces |
| `ag-accent` | `#B8962E` | Gold accent (slightly deeper for light contrast) |
| `ag-accent-hover` | `#9A7C24` | |
| `ag-accent-subtle` | `rgba(212,175,55,0.18)` | Tint backgrounds |
| `ag-genie` | `#1A9E9E` | Genie teal on light |
| `ag-genie-subtle` | `rgba(45,199,199,0.14)` | Genie tint on light |

### Retailer Accent Colors

Used on offer cards and detail pages to match retailer brand.

| Retailer | Primary | Secondary | Use |
|---|---|---|---|
| Target | `#CC0000` | `#FFFFFF` | Card border tint, logo background |
| Walmart | `#0071CE` | `#FFC220` | Card border tint, logo background |
| CVS | `#CC0000` | `#004B87` | Card border tint, logo background |
| Macy's | `#E21A2C` | `#000000` | Card border tint, logo background |
| Best Buy | `#0046BE` | `#FFE000` | Card border tint, logo background |
| Whole Foods | `#00674B` | `#5A8F29` | Card border tint, logo background |
| JCPenney | `#BA0C2F` | `#FFFFFF` | Card border tint, logo background |

---

## Tailwind Config

```js
// tailwind.config.ts — extend colors
colors: {
  ag: {
    'bg-base':        'var(--ag-bg-base)',
    'bg-subtle':      'var(--ag-bg-subtle)',
    'bg-surface':     'var(--ag-bg-surface)',
    'bg-elevated':    'var(--ag-bg-elevated)',
    'border':         'var(--ag-border-base)',
    'border-strong':  'var(--ag-border-strong)',
    'fg-base':        'var(--ag-fg-base)',
    'fg-subtle':      'var(--ag-fg-subtle)',
    'fg-muted':       'var(--ag-fg-muted)',
    'fg-inverted':    'var(--ag-fg-inverted)',
    'accent':         'var(--ag-accent)',
    'accent-hover':   'var(--ag-accent-hover)',
    'accent-subtle':  'var(--ag-accent-subtle)',
    'genie':          'var(--ag-genie)',
    'genie-hover':    'var(--ag-genie-hover)',
    'genie-subtle':   'var(--ag-genie-subtle)',
    'success':        'var(--ag-success)',
    'warning':        'var(--ag-warning)',
    'error':          'var(--ag-error)',
  }
}
```

---

## Typography

### Fonts

| Role | Font | Fallback | Feel |
|---|---|---|---|
| Display / hero | **Cinzel** | Georgia, serif | Regal, ancient, magical inscription |
| UI sans (body, labels, inputs) | **Poppins** | system-ui, sans-serif | Rounded, warm, approachable |
| Monospace (coupon codes, barcodes) | **JetBrains Mono** | monospace | Clear, scannable for coupon codes |

```html
<!-- globals.css @import -->
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Poppins:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
```

**Rationale:**
- **Cinzel** — Roman-style majuscule with an ancient, engraved quality. Perfect for "Ad-Genie" wordmark, page titles, and the "Your Wish Is Granted" hero moment.
- **Poppins** — Geometric but soft; feels magical without being unreadable. Pairs with Cinzel as a friendly counterpart.
- **JetBrains Mono** — Kept for coupon codes and barcode values where character disambiguation is critical.

### Scale

| Name | Size | Weight | Line Height | Font | Use |
|---|---|---|---|---|---|
| `text-display` | 32px | 600 | 1.15 | Cinzel | Page hero titles, "Your wish is granted" moments |
| `text-title` | 20px | 500 | 1.25 | Cinzel | Section headings, offer category titles |
| `text-heading` | 16px | 600 | 1.3 | Poppins | Card titles, modal headings |
| `text-body` | 14px | 400 | 1.65 | Poppins | Default body, offer descriptions |
| `text-body-sm` | 13px | 400 | 1.5 | Poppins | Sidebar labels, metadata, terms |
| `text-caption` | 12px | 400 | 1.4 | Poppins | Timestamps, helper text, expiry dates |
| `text-coupon` | 20px | 500 | 1.2 | JetBrains Mono | Coupon code display |
| `text-barcode` | 12px | 400 | 1 | JetBrains Mono | Barcode value below barcode graphic |
| `text-label` | 12px | 600 | 1 | Poppins | Buttons, tabs, badges, chip labels |

---

## Spacing & Layout

### App Shell

```
┌──────────────────────────────────────────────────────────────┐
│  Nav Rail 72px  │  Offer Feed flex-1  │  Detail Panel 360px  │
│  bg-subtle      │  bg-base            │  bg-subtle            │
│  (midnight)     │  (night sky)        │  (inset indigo)       │
└──────────────────────────────────────────────────────────────┘
```

| Zone | Width | Background | Notes |
|---|---|---|---|
| Nav Rail (mobile bottom bar on small screens) | 72px fixed | `ag-bg-subtle` | App logo at top, nav icons, profile at bottom |
| Offer Feed | `flex-1` | `ag-bg-base` | Primary browsing area |
| Detail Panel | 360px fixed | `ag-bg-subtle` | Offer detail, QR/barcode, poster generator |

### Nav Rail

- Top: Ad-Genie lamp logo (40px icon) + wordmark in Cinzel
- Middle: Nav icons with gold active state — Offers, Dashboard, Profile
- Bottom: User avatar (circular, 32px) + Settings icon (pinned, 16px padding)
- Active state: left border 3px `ag-accent` + gold icon fill

### Offer Feed

- Offer cards: 2-column grid on desktop, 1-column on mobile
- Tab bar (Online / Offline): full-width, pinned below store filter chips
- Store filter chips: horizontal scroll, gap 8px, sticky below header
- Header: 56px, logo left, location indicator + search icon right

### Spacing Units (multiples of 4)

```
4px  — tight gaps (icon + label, chip inner)
8px  — small padding (badges, tags, store chips)
12px — compact padding (sm buttons, card meta)
16px — standard component padding
20px — medium gaps (between card sections)
24px — section padding, card padding
32px — large gaps between sections
40px — page-level breathing room
48px — hero vertical padding
```

---

## Components

### Buttons

```
Primary (Gold Wish)
  background:    ag-accent  (#D4AF37)
  text:          ag-fg-inverted (#0D0B1E)
  hover:         ag-accent-hover + box-shadow: 0 0 12px rgba(212,175,55,0.40)
  border-radius: 8px
  height:        40px
  padding:       0 20px
  font:          14px/600 Poppins
  transition:    150ms ease-out + glow shimmer

Genie (Teal secondary)
  background:    ag-genie (#2DC7C7)
  text:          ag-fg-inverted
  hover:         ag-genie-hover + box-shadow: 0 0 12px rgba(45,199,199,0.40)
  Same dimensions as Primary.
  Use for: "Generate AI Poster", "Copy All Hashtags"

Ghost
  background:    transparent
  text:          ag-fg-base
  border:        1px solid ag-border-base
  hover:         bg ag-bg-surface, border ag-border-strong

Danger
  background:    rgba(201,64,64,0.15)
  text:          ag-error
  border:        1px solid rgba(201,64,64,0.30)
  hover:         background rgba(201,64,64,0.25)
```

All buttons: `transition duration-150 ease-out`. No shadow on Ghost/Danger.

### Input Fields

```
height:          40px (single line), padding: 0 14px
background:      ag-bg-surface
border:          1px solid ag-border-base
border-radius:   8px
text:            14px ag-fg-base (Poppins)
placeholder:     ag-fg-muted
focus:           border-color ag-border-strong
                 box-shadow: 0 0 0 3px rgba(212,175,55,0.12)
                 outline: none
```

### Offer Card

```
background:      ag-bg-surface
border:          1px solid ag-border-base
border-radius:   12px
padding:         16px
hover:           border-color ag-border-strong
                 box-shadow: 0 4px 24px rgba(0,0,0,0.40), 0 0 0 1px rgba(212,175,55,0.20)
                 transform: translateY(-2px)
transition:      150ms ease-out

Store logo:      32px × 32px circle, top-left
Discount badge:  top-right, pill, gold background, dark text (see Badge spec)
Headline:        text-heading, ag-fg-base, 2-line clamp
Category tag:    text-caption, ag-genie, bottom-left
Expiry:          text-caption, ag-fg-muted, bottom-right
CTA arrow:       Lucide ChevronRight, 16px, ag-accent, bottom-right inline with expiry
```

### Coupon Code Block (Online Offer)

```
container:       background ag-bg-elevated
                 border: 1px dashed rgba(212,175,55,0.40)
                 border-radius: 10px
                 padding: 20px 24px
                 text-align: center

code display:    font JetBrains Mono, 22px/500, ag-accent, letter-spacing: 0.12em

copy button:     full-width below code, Primary gold button, icon: Lucide Copy
copy toast:      "✨ Code copied! Your wish is ready." — ag-genie colour, 2s fade
```

### QR Code & Barcode Block (Offline Offer)

```
container:       background #FFFFFF (white — for scanner contrast)
                 border-radius: 12px
                 padding: 20px
                 width: 240px, centered

QR code:         240×240px, rendered via `qrcode` library, foreground #0D0B1E
barcode:         300×80px, Code 128, rendered via `jsbarcode`, foreground #0D0B1E

brightness tip:  text-caption, ag-fg-muted, italic
                 "Increase brightness for best scan results ✨"

below container: "Add to Wallet" ghost button (P1)
```

### AI Poster Panel

```
container:       ag-bg-elevated, border-radius: 12px, padding: 20px

Poster preview:  1:1 aspect ratio, border-radius: 10px
                 border: 2px solid ag-accent
                 box-shadow: 0 0 32px rgba(212,175,55,0.25)

Generate button: Genie teal button, full width, icon: Lucide Wand
Regenerate link: text-body-sm, ag-fg-subtle, "Not quite right? Try again (2 left)"

Download button: Ghost button, icon: Lucide Download
Share button:    Primary gold button, icon: Lucide Share2, "Share to Instagram"
```

### Hashtag Chip List

```
container:       flex-wrap, gap: 8px, padding: 16px 0

chip:            background ag-accent-subtle
                 border: 1px solid rgba(212,175,55,0.25)
                 border-radius: 20px (pill)
                 padding: 6px 12px
                 font: 12px/500 Poppins
                 color: ag-accent

Copy All button: Ghost, full width below chips, icon: Lucide ClipboardList
                 "Copy all hashtags"
```

### Dashboard KPI Card

```
background:      ag-bg-surface
border:          1px solid ag-border-base
border-radius:   12px
padding:         20px

icon:            24px, ag-accent (gold) or ag-genie (teal) based on category
value:           text-display (Cinzel, 28px/600), ag-fg-base
label:           text-caption, ag-fg-subtle
trend arrow:     Lucide TrendingUp, ag-success / ag-error based on direction

hover:           border-color ag-border-strong
                 box-shadow: 0 0 0 1px rgba(212,175,55,0.12)
```

### Savings Chart

```
Chart area:      Recharts LineChart
Line colour:     ag-accent (#D4AF37) — 2px stroke
Dot:             6px filled gold circle on data points
Grid lines:      rgba(255,255,255,0.06)
Axis text:       ag-fg-muted, 11px Poppins
Tooltip:         background ag-bg-elevated, border 1px ag-border-strong
                 border-radius 8px, padding 10px 14px
Toggle chips:    store filter (All / Target / Walmart / CVS) — pill chips, active = gold
```

### Nav Rail Item

```
width: 72px, height: 64px
icon:   20px Lucide, default ag-fg-muted
label:  text-caption, 10px, ag-fg-muted
active: icon ag-accent, label ag-accent,
        left border 3px ag-accent,
        background rgba(212,175,55,0.08)
hover:  icon ag-fg-subtle, background ag-bg-surface
```

### Badges / Status Chips

```
height:          22px, padding: 0 10px
border-radius:   11px (pill)
font:            11px/600 Poppins uppercase letter-spacing: 0.06em

Online (coupon): background ag-genie-subtle, text ag-genie, border 1px rgba(45,199,199,0.25)
Offline (QR):    background ag-accent-subtle, text ag-accent, border 1px rgba(212,175,55,0.25)
Expiring soon:   background rgba(230,168,23,0.15), text ag-warning
Expired:         background ag-bg-elevated, text ag-fg-muted
Saved:           background rgba(61,170,110,0.15), text ag-success
```

### Cards / Panels (General)

```
background:      ag-bg-surface
border:          1px solid ag-border-base
border-radius:   12px
padding:         20px
```

---

## Iconography

- **Library:** Lucide React
- **Stroke width:** 1.5px
- **Default size:** 16px (UI), 20px (nav), 24px (KPI cards), 14px (inline with text)
- **Color:** Defaults to `ag-fg-subtle`; gold (`ag-accent`) for primary actions; teal (`ag-genie`) for AI/generative actions
- **Special icons for Ad-Genie context:**

| Use | Lucide Icon |
|---|---|
| Online offer / coupon | `Ticket` |
| Offline offer / in-store | `QrCode` |
| AI poster generation | `Wand2` |
| Hashtag | `Hash` |
| Instagram share | `Share2` |
| Location / store | `MapPin` |
| Total savings | `PiggyBank` |
| Savings streak | `Flame` |
| Copy coupon code | `Copy` |
| Bookmark offer | `Bookmark` |
| Dashboard | `LayoutDashboard` |
| Profile | `CircleUser` |

No filled icons in product UI. Decorative lamp icon (🪔) used only in the wordmark and empty-state illustrations — never in functional UI.

---

## Motion

```
duration:  100–200ms
easing:    cubic-bezier(0.16, 1, 0.3, 1)  /* ease-out-expo */

Standard transitions:
  opacity 0 → 1 (150ms) for panels, modals, dropdowns
  translateY(6px) → 0 with opacity for cards and panels appearing
  background-color, border-color, box-shadow on hover (100ms)
  transform: translateY(-2px) on offer card hover (150ms)

Genie reveal (AI poster + modal entrance):
  opacity: 0 → 1 + scale(0.96) → scale(1) over 200ms
  Used for: poster preview appearing, first-load dashboard KPIs

Gold shimmer (on Primary button, coupon code block):
  A subtle shimmer sweep left → right on hover
  CSS: linear-gradient shimmer overlay, 600ms, runs once on hover

Never:
  Bounce or spring in product UI
  Animations longer than 300ms on repeated interactions
  Spinning loaders except on poster generation (which uses a sparkle pulse)
```

```css
/* globals.css */

/* Standard fade-in for panels and cards */
.ag-fade-in {
  animation: agFadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes agFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Genie reveal — poster and modal entrances */
.ag-genie-reveal {
  animation: agGenieReveal 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes agGenieReveal {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

/* Gold shimmer on hover (apply to Primary button via ::after) */
.ag-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%);
  transform: translateX(-100%);
  border-radius: inherit;
  pointer-events: none;
}
.ag-shimmer:hover::after {
  animation: agShimmer 600ms ease-out forwards;
}
@keyframes agShimmer {
  to { transform: translateX(100%); }
}

/* Sparkle pulse — poster generation loading state */
.ag-sparkle-pulse {
  animation: agSparklePulse 1.2s ease-in-out infinite;
}
@keyframes agSparklePulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.08); }
}
```

---

## CSS Variables Setup

```css
/* globals.css — dark mode (default, Night Sky) */
:root {
  --ag-bg-base:        #0D0B1E;
  --ag-bg-subtle:      #13112A;
  --ag-bg-surface:     #1C1A38;
  --ag-bg-elevated:    #252348;
  --ag-border-base:    rgba(212,175,55,0.12);
  --ag-border-strong:  rgba(212,175,55,0.28);
  --ag-fg-base:        #F5EDD6;
  --ag-fg-subtle:      #A89B7A;
  --ag-fg-muted:       #6B6047;
  --ag-fg-inverted:    #0D0B1E;
  --ag-accent:         #D4AF37;
  --ag-accent-hover:   #B8962E;
  --ag-accent-subtle:  rgba(212,175,55,0.15);
  --ag-genie:          #2DC7C7;
  --ag-genie-hover:    #22AAAA;
  --ag-genie-subtle:   rgba(45,199,199,0.15);
  --ag-jewel-sapphire: #1B5FA8;
  --ag-jewel-emerald:  #1A7A4A;
  --ag-jewel-ruby:     #A82332;
  --ag-success:        #3DAA6E;
  --ag-warning:        #E6A817;
  --ag-error:          #C94040;
  --ag-star:           rgba(212,175,55,0.60);
}

/* Light mode override — Desert Sand (auth pages) */
[data-theme="light"] {
  --ag-bg-base:        #FDF6E3;
  --ag-bg-subtle:      #F5E9C8;
  --ag-bg-surface:     #EDD9A3;
  --ag-bg-elevated:    #E3CA84;
  --ag-border-base:    rgba(0,0,0,0.08);
  --ag-border-strong:  rgba(139,101,17,0.30);
  --ag-fg-base:        #1C1533;
  --ag-fg-subtle:      #5C4A1A;
  --ag-fg-muted:       #8C7040;
  --ag-fg-inverted:    #FDF6E3;
  --ag-accent:         #B8962E;
  --ag-accent-hover:   #9A7C24;
  --ag-accent-subtle:  rgba(212,175,55,0.18);
  --ag-genie:          #1A9E9E;
  --ag-genie-hover:    #148585;
  --ag-genie-subtle:   rgba(45,199,199,0.14);
}
```

---

## Illustrations & Empty States

Each empty state uses a thematic phrase and a minimal SVG illustration (no photos).

| State | Headline (Cinzel) | Subtext (Poppins) | Illustration |
|---|---|---|---|
| No offers near you | "The Cave of Wonders is quiet…" | "Try a different location or check back soon." | Closed cave door, stars |
| No saved offers | "Your magic lamp is empty" | "Save offers to find them here." | Empty brass lamp |
| Savings streak starts | "Your first wish is granted! ✨" | "You saved on your first redemption." | Gold coin burst |
| Poster generating | "The Genie is at work…" | "Your personalised ad poster is being conjured." | Smoke swirl animation |
| No internet | "Even magic needs a signal" | "Check your connection and try again." | Broken lamp |

---

## Copy / Voice

Ad-Genie's voice is warm, playful, and theatrically confident — like a Genie who is genuinely delighted to help you save money.

- Sentence case for all labels, headings, buttons
- Active voice, short sentences
- Use "you" for the user; "the Genie" or "Ad-Genie" for AI-generated content
- Discount amounts are always bold: **$12.50 off**, **20% discount**
- Emoji ✨ 🪔 💰 are allowed in empty states, toasts, and celebration moments — not in functional labels or error messages
- No filler phrases ("Please note that...", "In order to...", "Please be aware...")
- Error messages state what happened and what to do next — never just a code

| Moment | Copy |
|---|---|
| Coupon copied | "✨ Code copied! Head to checkout." |
| Poster generated | "Your ad poster is ready — go show it off." |
| Hashtags ready | "15 hashtags conjured. Copy and paste when you share." |
| Offer saved | "Saved. We'll remind you before it expires." |
| Offer expired | "This deal has vanished. Browse fresh offers." |
| Barcode shown | "Show this at checkout — increase brightness for best results." |
| Share success | "Shared to Instagram. Your savings are out in the world." |
| Location denied | "Location access lets us show your nearest deals. You can also enter a zip code." |

---

## Design Decisions & Rationale

1. **Dark-first, midnight palette** — Mirrors an Arabian night sky. Deep `#0D0B1E` is warm (blue-leaning purple) not cold blue-black, so it feels inviting rather than corporate.
2. **Royal gold accent (`#D4AF37`)** — Pulled from the hex value closest to traditional 18-karat gold leaf. Used for the lamp, treasure, and every primary action — reinforces "wish granted" as a primary interaction metaphor.
3. **Genie teal (`#2DC7C7`)** — Warm turquoise references the Genie's magic smoke and character colour. Reserved for AI-generative actions (poster, hashtags) to visually distinguish human-driven actions (gold) from AI-driven ones (teal).
4. **Cinzel for display** — Roman-engraved letterforms evoke ancient inscription (the lamp's script) while remaining completely legible. Poppins grounds the UI in modern approachability.
5. **Gold border tokens** — Rather than plain white opacity borders (common in dark UIs), borders carry a gold tint (`rgba(212,175,55,0.12)`) so even dividers feel like they belong to the world.
6. **Desert Sand light mode** — Auth pages use warm parchment tones (`#FDF6E3`) rather than clinical white — the scrolls and market stalls of Agrabah rather than a blank office wall.
7. **No cold blues or greys anywhere** — Every neutral has warmth baked in (purple-blacks, sandy browns). Cold values would break the enchanted-world cohesion.
8. **Retailer colours as accents, not overrides** — Target red, Walmart blue, and CVS brand colours appear as card border tints and logo backgrounds only — they never replace the Ad-Genie palette.
9. **Sparkle pulse for AI loading** — Rather than a spinning ring, poster generation uses a `ag-sparkle-pulse` animation on a ✨ icon — reinforces the "magic at work" metaphor without being noisy.
10. **Lucide icon set** — Stroke-only, 1.5px, consistent with a clean modern feel. The lamp emoji 🪔 is used as a brand illustration element only, never as a functional UI icon.
