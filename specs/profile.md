# Profile Spec

Generated from `/blueprint/app-plan.md` and `PRD.md` FR-024/FR-025. Structural guide: `file-upload-spec-template.md` (for the photo upload), with general profile-field sections adapted in since this page is not exclusively a file-upload feature.

---

## Feature Name
Profile (`/profile`)

---

## Description
- Authenticated page for managing the user's photo, display info, and preferences.
- Photo upload accepts **JPEG/PNG, max 5MB**, with a **circular crop preview** before upload. The cropped image is uploaded to a **private Supabase Storage bucket** (`user-photos`) and the resulting reference is stored in the `user_photos` table — the raw file itself is never sent anywhere except that bucket.
- Editable fields: display name, home zip code, favourite stores (toggle chips), notification preferences. Email is **read-only** (it's the login identifier, changed nowhere in this app's scope).
- The uploaded photo is later reused by the AI poster generation flow on `/offers/[id]` (see `/specs/offer-detail.md`) — this page is the canonical place that photo is captured and managed.

---

## User Flow
1. User navigates to `/profile`.
2. Current profile loads from `users` + `user_photos` via `GET /api/profile`.
3. **Photo upload:** user opens the file picker (JPEG/PNG only, max 5MB) → selects a file → a circular crop preview appears inline → user confirms the crop → cropped image uploads to the `user-photos` Supabase Storage bucket → `PATCH`-equivalent insert/update on the `user_photos` row (`storage_url`, `uploaded_at`).
4. **Field edits:** user changes display name, home zip, toggles favourite store chips (Target/Walmart/CVS/Macy's/Best Buy/Whole Foods/JCPenney), and/or notification toggles (deal alerts, expiry reminders) — these are local form state changes, not saved until the user explicitly submits.
5. User clicks "Save changes" → client calls `PATCH /api/profile` with the changed fields.
6. **Delete photo:** user clicks "Delete photo" → removes the object from the `user-photos` Storage bucket → clears (deletes) the `user_photos` row for that user.

---

## How Content Reaches the Backend
- The **cropped photo** is sent as `multipart/form-data` (or as a base64 data URL in a JSON body — either is acceptable; recommend `multipart/form-data` given a 5MB binary payload) to `POST /api/profile/photo`. Field name: `photo`.
- **Profile fields** (display name, zip, favourite stores, notification prefs) are sent as a JSON body to `PATCH /api/profile` — no file content travels with this request.
- If the user removes the photo without selecting a replacement, no photo field is sent in any subsequent `PATCH /api/profile` call — photo removal is its own dedicated `DELETE /api/profile/photo` call, not a side effect of saving other fields.

---

## Parsing / Processing Strategy

**Client-side cropping:**
- File is read into the browser (`URL.createObjectURL` or `FileReader`) immediately on selection.
- Circular crop UI lets the user reposition/zoom before confirming — implementation library not specified in app-plan.md (a canvas-based crop tool, e.g. `react-easy-crop`, is a reasonable choice; flagged as an implementation decision, not specified in the plan).
- On confirm, the cropped region is rendered to a `<canvas>` and exported as a Blob/File before upload — so the **server never needs to crop**, only store what's sent.

**Server-side storage:**
- `POST /api/profile/photo` receives the cropped image, uploads it to the `user-photos` private bucket under a per-user path (e.g. `user-photos/{userId}/avatar.png`, overwriting any previous file for that user — consistent with "one active photo per user" / the `unique(user_id)` constraint on `user_photos`).
- Server upserts the `user_photos` row with the new `storage_url` and `uploaded_at = now()`.

---

## Content Preview

**Circular crop preview (pre-upload):**
- Rendered from a local blob URL (`URL.createObjectURL(file)`), shown inside a circular mask, with crop/zoom controls.
- Lives inline within `PhotoUploader`, directly below the file picker trigger — not a modal (app-plan.md does not specify a modal; inline keeps the flow on one page).
- Blob URL is revoked once the crop is confirmed and the upload completes (or if the user cancels).

**Current/saved photo display:**
- Once uploaded, the photo is displayed via its Supabase Storage **signed URL** (never a public URL, since the bucket is private) — fetched as part of `GET /api/profile`.
- Rendered as a circular avatar (matches the crop aspect) inside `PhotoUploader`, with "Replace" and "Delete" actions overlaid or adjacent.

---

## State Architecture — CRITICAL
- The `/profile` page component owns: `profile` (display name, zip, favourite stores, notification prefs — loaded from `GET /api/profile`), `photoUrl` (current signed URL, or null), `pendingCropFile` (the just-selected file mid-crop, before upload), `isSaving`, `isDirty` (whether form fields differ from the loaded profile).
- `PhotoUploader` does not own the final `photoUrl` — it calls a callback (`onPhotoUploaded(storageUrl)`) once the upload to `/api/profile/photo` completes, and the parent updates `photoUrl`. `PhotoUploader` DOES own its own transient crop-in-progress state (the file being cropped, crop coordinates) since no other component needs that mid-crop state.
- `ProfileForm` and `FavouriteStoresSelector`/`NotificationToggles` are controlled by the parent's `profile` state — they call `onChange` callbacks that update the parent, they do not hold their own copy of the saved values.

---

## API Contract

### `GET /api/profile`
**Auth:** Yes
**Response:** `{ displayName, email, zipCode, favouriteStores, notificationPrefs, photoUrl }` — `photoUrl` is a freshly-generated signed URL (or `null` if no `user_photos` row exists).

### `PATCH /api/profile`
**Auth:** Yes
**Request body:** any subset of `{ displayName, zipCode, favouriteStores, notificationPrefs }` — `email` is never accepted here (read-only).
**Response:** `{ success: true }` or the updated profile object.

### `POST /api/profile/photo`
**Auth:** Yes
**Request body:** `multipart/form-data`, field `photo` (the cropped image Blob).
**Behavior:** Upload to `user-photos` bucket, upsert `user_photos` row.
**Response:** `{ photoUrl: string }` (new signed URL).

### `DELETE /api/profile/photo`
**Auth:** Yes
**Behavior:** Remove the object from the `user-photos` bucket, delete the `user_photos` row.
**Response:** `{ success: true }`

---

## Validation
- **File type:** reject anything other than JPEG/PNG client-side before the crop UI even opens — error: "Only JPEG and PNG images are supported."
- **File size:** reject files over 5MB client-side — error: "Image must be under 5MB."
- **Display name:** required, non-empty, on save.
- **Zip code:** optional; if provided, must be a 5-digit US zip (client-side regex check) — error: "Enter a valid 5-digit zip code."
- **Favourite stores:** no minimum required — a user can have zero favourites selected.

---

## Components

| Component | File | Responsibility | Key props |
|---|---|---|---|
| `PhotoUploader` | `components/PhotoUploader.jsx` | File picker, circular crop preview, upload/replace/delete | `photoUrl`, `onPhotoUploaded`, `onPhotoDeleted` |
| `ProfileForm` | `components/ProfileForm.jsx` | Display name, email (read-only), zip code fields | `profile`, `onChange` |
| `FavouriteStoresSelector` | `components/FavouriteStoresSelector.jsx` | Toggle buttons for all 7 retailers (see `lib/stores.js`) | `selected`, `onChange` |
| `NotificationToggles` | `components/NotificationToggles.jsx` | Deal alerts + expiry reminder switches | `prefs`, `onChange` |

---

## Edge Cases
- **User selects a file over 5MB:** rejected before the crop UI opens; clear inline error, file picker remains usable for another attempt.
- **User selects a non-JPEG/PNG file:** same — rejected before crop UI opens.
- **User cancels mid-crop:** local blob URL revoked, `pendingCropFile` cleared, no network call made.
- **Upload to Storage succeeds but the `user_photos` row upsert fails:** treat as a failed upload overall (don't show success) — orphaned Storage object is an acceptable, low-frequency cleanup item, not blocking for MVP.
- **User deletes a photo that's referenced by an in-progress AI poster generation on another tab/page:** out of scope to coordinate live — the poster route reads the photo at generation time; a delete simply means future generations proceed with `userPhotoBase64: null`.
- **User saves the form with no changes (`isDirty === false`):** "Save changes" should be disabled, or a no-op `PATCH` is acceptable but unnecessary — disabling is the cleaner choice.
- **Email field tampering:** even if a malicious client sends `email` in the `PATCH` body, the server must ignore it — email changes are out of scope entirely.
