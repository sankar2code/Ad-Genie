# Offer Detail Spec

Generated from `/blueprint/app-plan.md`. Structural guide: `chat-spec-template.md` (for the AI request/response patterns — poster + hashtags) and `file-upload-spec-template.md` (for the profile-photo input feeding poster generation), adapted since this page has no true multi-turn conversation.

---

## Feature Name
Offer Detail (`/offers/[id]`) — Redemption, AI Poster Generation, Hashtag Generation

---

## Description
- Single offer detail page with up to four distinct interactions depending on offer `type`:
  1. **Online coupon redemption** — copy code to clipboard.
  2. **Offline QR redemption** — display a scannable QR code.
  3. **AI poster generation** — single-shot (not streamed) image generation via OpenAI `gpt-image-1`, optionally including the user's profile photo.
  4. **Hashtag generation** — single-shot (not streamed) text generation via GPT-4o, returned as a parsed array.
- Both AI features are **request → wait → full response** (no token streaming) — the UI shows a themed loading state ("The Genie is at work…") rather than an incrementally-filling response.
- Every user action that constitutes a "redemption" or "AI output" event is logged to Supabase for the dashboard to aggregate later (see `/specs/dashboard.md`).

---

## User Flow — Online Coupon
1. User on `/offers/[id]` where `offer.type === 'online'`.
2. `<CouponCodeBlock />` renders `offer.coupon_code` (JetBrains Mono, 22px, gold, inside a dashed-border `ag-bg-elevated` container).
3. User clicks "Copy Code" → `navigator.clipboard.writeText(offer.coupon_code)`.
4. Toast: "✨ Code copied! Head to checkout." — `ag-genie` color, 2s fade.
5. Client calls `POST /api/redemptions` with `{ userId, offerId, channel: 'online' }`.
6. "Shop Now" button opens `offer.retailer_url` in a new tab — plain link, no affiliate tracking parameters added client-side.

## User Flow — Offline QR
1. User on `/offers/[id]` where `offer.type === 'offline'`.
2. `<QRCodeBlock />` renders a QR code from `offer.qr_value` using the `qrcode` library — 240×240px, white background (for scanner contrast), dark (`#0D0B1E`) foreground.
3. Brightness tip shown below: "Increase brightness for best scan results ✨".
4. Client calls `POST /api/redemptions` with `{ userId, offerId, channel: 'offline' }` — logged when the QR is displayed (i.e. on render/mount of this block, not on a separate user action, since there is no "copy" equivalent for a QR code).

## User Flow — AI Poster Generation
1. User clicks "Generate My Ad Poster" in `<PosterPanel />`.
2. If the user has no profile photo on file (`user_photos` row missing), show an inline, **non-blocking** prompt to upload one — user may skip and generate without a photo.
3. Loading state: sparkle pulse animation (`ag-sparkle-pulse` class) + copy "The Genie is at work…".
4. Client `POST`s `{ offer: { store, headline, discount_value }, userPhotoBase64: string | null }` to `/api/poster`.
5. Server calls OpenAI `gpt-image-1` (output size `1024x1024`) with a structured prompt (retailer brand colors, "Made with Ad-Genie" watermark, photo placement instructions per PRD §3.4).
6. Server returns `{ imageUrl }` (OpenAI-hosted URL).
7. Client renders the poster in a 1:1 preview with a 2px gold border + glow (`box-shadow: 0 0 32px rgba(212,175,55,0.25)`), using the `ag-genie-reveal` entrance animation.
8. "Not quite right? Try again (N left)" — a client-side-only regeneration counter, **max 3 attempts per offer per session** (resets if the user navigates away and back — it is not persisted server-side).
9. "Download" button: client fetches the `imageUrl`, converts it to a Blob, and triggers `<a download>` to save a PNG to the device.
10. On successful download, client calls `POST /api/events/download` with `{ userId, offerId }`.

## User Flow — Hashtag Generation
1. User clicks "Generate Hashtags" in `<HashtagPanel />`.
2. Confirmation prompt: "Want hashtags for this offer?" → user clicks Confirm (this is a deliberate extra step — hashtag generation is not triggered on the first click alone, to avoid accidental API spend).
3. Client `POST`s `{ offer }` to `/api/hashtags`.
4. Server calls GPT-4o with offer metadata (`store`, `headline`, `category`, `discount_value`) using a "social media strategist for retail deals" system prompt (PRD §3.5), with `response_format: { type: 'json_object' }`.
5. Server parses `{ hashtags: string[] }` (15–20 hashtag strings, `#`-prefixed) and returns it to the client.
6. Hashtags render as pill chips in `<HashtagChipList />` (`ag-accent-subtle` background, `ag-accent` text).
7. Clicking an individual chip copies just that hashtag to the clipboard.
8. "Copy all hashtags" button copies the full set (joined by spaces) and calls `POST /api/events/hashtag-copy` with `{ userId, hashtagSetId }`.

---

## Shared Context State
The offer object (`{ id, store, type, headline, discount_value, category, coupon_code, qr_value, retailer_url, expires_at }`) is fetched once via `GET /api/offers/[id]` and owned by the `/offers/[id]` page component (parent). It is passed down as props to `CouponCodeBlock`, `QRCodeBlock`, `PosterPanel`, and `HashtagPanel` — none of these sub-components fetch the offer independently.

The user's profile photo (if any) is fetched once at the page level (`user_photos` row → signed URL → base64, or passed as a storage reference) and handed to `PosterPanel` as a prop; `PosterPanel` does not own this state, since the same photo could in principle be reused across regenerations without re-fetching.

---

## "Response" Rendering (AI Poster + Hashtags)
Since neither AI feature streams, there is no partial/streaming bubble — the rendering states are simply:
- **Idle:** action button visible ("Generate My Ad Poster" / "Generate Hashtags").
- **Loading:** sparkle pulse animation, action button disabled/replaced by the loader.
- **Success:** poster image or hashtag chip list rendered with the `ag-genie-reveal` animation (opacity 0→1, scale 0.96→1, 200ms).
- **Error:** inline error message in place of the result area, with a retry action that re-enables the trigger button (does not consume a regeneration attempt for the poster counter, since the attempt never produced output).

## Streaming Responses
Not applicable — both `/api/poster` and `/api/hashtags` return a single complete JSON response; no SSE/WebSocket.

---

## File Upload Aspect (Profile Photo → Poster)
- Accepted types: JPEG/PNG, max 5MB (per `/specs/profile.md`, where the canonical upload flow lives).
- On the offer detail page specifically, the photo is **read**, not uploaded — if `user_photos` already has a row, its image is fetched and converted to base64 client-side to send as `userPhotoBase64` in the `/api/poster` request body.
- If no photo exists, the inline prompt links to `/profile` to upload one, or the user can proceed with `userPhotoBase64: null`.

---

## API Routes

### `POST /api/redemptions`
**Auth:** Yes
**Request body:** `{ userId, offerId, channel: 'online' | 'offline' }`
**Behavior:** Insert into `redemptions`, with `savings_amount` parsed server-side from the offer's `discount_value`.
**Response:** `{ success: true, redemptionId }`

### `POST /api/poster`
**Auth:** Yes
**Request body:** `{ offer: { store, headline, discount_value }, userPhotoBase64: string | null }`
**Response (success):** `{ imageUrl: string }`
**Response (error):** `{ error: string }` — e.g. OpenAI rate limit, content policy rejection
**Cost target:** < $1.00 per call. **Retry limit:** 3 per offer per session, enforced client-side only (not persisted).
**Note:** this route does NOT itself log to `posters` — that insert happens at download time, not generation time (see `/api/events/download` below), since app-plan.md's `posters` table records `storage_url`, implying the image is persisted to Supabase Storage on save, not on every generation attempt. **Implementation decision needed:** either (a) upload every generated image to the `generated-posters` bucket and insert a `posters` row immediately on generation, or (b) only persist on download. Recommend (a) for dashboard accuracy ("posters generated" vs. "posters downloaded" become distinguishable metrics) — flagged as a decision point since app-plan.md does not specify which.

### `POST /api/hashtags`
**Auth:** Yes
**Request body:** `{ offer: { store, headline, category, discount_value } }`
**Response (success):** `{ hashtags: string[] }`
**Cost target:** < $0.25 per call.
**Note:** insert into `hashtag_sets` (with `user_id`, `offer_id`, `hashtags`, `generated_at`) happens server-side as part of this route, so the client has a `hashtagSetId` available for the later `copy-all` event.

### `POST /api/events/download`
**Auth:** Yes
**Request body:** `{ userId, offerId }`
**Behavior:** Insert into `download_events`.
**Response:** `{ success: true }`

### `POST /api/events/hashtag-copy`
**Auth:** Yes
**Request body:** `{ userId, hashtagSetId }`
**Behavior:** Insert into `hashtag_copy_events`; also set `hashtag_sets.copied_at = now()` for that row if not already set.
**Response:** `{ success: true }`

---

## Components

| Component | File | Responsibility | Key props |
|---|---|---|---|
| `CouponCodeBlock` | `components/CouponCodeBlock.jsx` | Code display, copy button, toast trigger | `code`, `onCopy` |
| `QRCodeBlock` | `components/QRCodeBlock.jsx` | Renders QR via `qrcode`, brightness tip | `value` |
| `PosterPanel` | `components/PosterPanel.jsx` | Generate button, loader, preview, regen counter, download | `offer`, `userPhotoBase64`, `onDownload` |
| `HashtagPanel` | `components/HashtagPanel.jsx` | Generate button, confirm prompt, chip list, copy-all | `offer`, `onCopyAll` |
| `HashtagChipList` | `components/HashtagChipList.jsx` | Renders pill chips, per-chip copy | `hashtags`, `onChipClick` |
| `Toast` | `components/Toast.jsx` | Timed notification | `message`, `variant` |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| `navigator.clipboard.writeText` fails (e.g. permissions) | Show an error toast instead of the success toast; do not log the redemption event if the copy itself failed |
| Poster generation fails (OpenAI error) | Show inline error in `PosterPanel`; allow retry without decrementing the regeneration counter |
| Poster regeneration limit reached (0 left) | "Try again" link removed/disabled; only "Download" remains for the last successful poster |
| Hashtag generation fails | Show inline error in `HashtagPanel`; Confirm step must be repeated (no special-cased instant retry) |
| User navigates away mid-generation | In-flight request is not explicitly cancelled (no AbortController specified in app-plan.md) — response is discarded on unmount if the component is gone |
| User has no profile photo and skips upload | Poster still generates, with `userPhotoBase64: null`; the AI prompt omits photo placement instructions |
| Offer is expired (`is_active = false` or `expires_at` past) when detail page is opened | Show an expired-state badge; coupon/QR still technically renders unless explicitly blocked — **decision point not specified in app-plan.md**, recommend blocking redemption actions on expired offers and showing "This deal has vanished. Browse fresh offers." (per the design system's copy table) |
| Hashtag copy-all clicked twice | Second click re-logs a `hashtag_copy_events` row (events are append-only) but does not change `copied_at` beyond the first set |
