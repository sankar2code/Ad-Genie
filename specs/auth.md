# Auth Spec — Signup and Login

Generated from `/blueprint/app-plan.md`. Structural guide: `auth-spec-template.md`.

---

## Feature Name
User Authentication (Signup, Login, Logout, Auth Guard)

---

## Description
- Authentication is **fully custom** — Supabase Auth is not used. A custom `users` table stores credentials.
- Users authenticate with **email + password** only. No OAuth, no magic link.
- Passwords are hashed with **bcryptjs at 12 rounds** before being stored — the plaintext password never touches the database.
- On successful signup or login, the server returns `{ userId, userEmail }`. The client stores both values in **`localStorage`** (no cookies, no server session, no JWT).
- After successful auth, the user is redirected to `/offers`.
- All `app/(app)/*` routes (offers, dashboard, profile) are protected by a client-side auth guard that checks `localStorage` on mount.

---

## User Flow — Signup
1. User lands on `/` and clicks "Get started", routing to `/signup`.
2. User fills in: **display name**, **email**, **password** (min 8 characters).
3. Client-side validation: all three fields required; password must be ≥ 8 chars. Inline error shown under the field if invalid; submit is blocked until resolved.
4. On submit, client calls `POST /api/auth/signup` with `{ displayName, email, password }`.
5. Server checks the `users` table for an existing row with that `email`.
   - If found → return `400` with `{ error: "Email already registered" }`.
6. If not found, server hashes the password with `bcryptjs` (12 rounds) and inserts a new row into `users` (`email`, `password_hash`, `display_name`, `created_at`).
7. Server returns `{ userId, userEmail }`.
8. Client stores `localStorage.setItem('userId', userId)` and `localStorage.setItem('userEmail', userEmail)`.
9. Client redirects to `/offers`.

---

## User Flow — Login
1. User visits `/login` (or is routed there from `/` via "Sign in").
2. User fills in: **email**, **password**.
3. Client-side validation: both fields required (non-empty). No password-length check on login (only on signup).
4. On submit, client calls `POST /api/auth/login` with `{ email, password }`.
5. Server fetches the user row by `email`. If no row is found, treat identically to a password mismatch (see step 6) — never reveal whether the email exists.
6. Server runs `bcrypt.compare(password, user.password_hash)`.
   - If it does not match (or user does not exist) → return `401` with `{ error: "Invalid credentials" }`.
7. If it matches → server returns `{ userId, userEmail }`.
8. Client stores `localStorage.setItem('userId', userId)` and `localStorage.setItem('userEmail', userEmail)`.
9. Client redirects to `/offers`.

---

## DB Schema

**`users`**
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | PK, `gen_random_uuid()` |
| `email` | text | `UNIQUE NOT NULL` — login identifier |
| `password_hash` | text | `NOT NULL` — bcryptjs, 12 rounds |
| `display_name` | text | `NOT NULL` — captured at signup |
| `zip_code` | text | Optional, 5-digit US zip (set later via Profile) |
| `favourite_stores` | text[] | Subset of `['target','walmart','cvs']` (set later via Profile) |
| `notification_prefs` | jsonb | `{ dealAlerts: bool, expiryReminders: bool }` (set later via Profile) |
| `created_at` | timestamptz | Default `now()` |

See `/specs/database.md` for the full `CREATE TABLE` statement and indexes.

---

## API Routes

### `POST /api/auth/signup`
**Auth:** No
**Request body:** `{ displayName: string, email: string, password: string }`
| Status | Body | When |
|---|---|---|
| 200 | `{ userId, userEmail }` | Account created |
| 400 | `{ error: "Email already registered" }` | Email already exists in `users` |
| 400 | `{ error: "All fields are required" }` | Missing displayName/email/password |

### `POST /api/auth/login`
**Auth:** No
**Request body:** `{ email: string, password: string }`
| Status | Body | When |
|---|---|---|
| 200 | `{ userId, userEmail }` | Credentials match |
| 401 | `{ error: "Invalid credentials" }` | Email not found OR password mismatch (generic — no field enumeration) |

**Error message rule:** Login never reveals whether the email or the password was wrong — always the same generic 401 message, to avoid account enumeration.

---

## Components

| Component | File | Purpose |
|---|---|---|
| `AuthCard` | `components/AuthCard.jsx` | Shared card shell — desert sand background, gold border, centered |
| `LoginForm` | `components/LoginForm.jsx` | Email + password fields, submit button, link to `/signup` |
| `SignupForm` | `components/SignupForm.jsx` | Display name + email + password fields, submit button, link to `/login` |

**Layout:** Standalone, centered card on a full-viewport background (`app/(auth)/layout.jsx`). Not part of the `<Nav />` app shell — `app/(auth)/` route group applies `data-theme="light"` (Desert Sand) instead.

---

## Auth Guard
- Implemented in `app/(app)/layout.jsx`, which wraps `/offers`, `/dashboard`, and `/profile`.
- On mount, the layout checks `localStorage.getItem('userId')`.
- If `userId` is missing → immediate client-side redirect to `/login`. No flash of protected content (check runs before render of children, or children are gated behind the check).
- If present → renders `<Nav />` + the page content.

### Logout Flow
1. User clicks logout in `<Nav />`.
2. Client runs `localStorage.removeItem('userId')` and `localStorage.removeItem('userEmail')`.
3. Redirects to `/login`.

---

## Important Implementation Notes
- **Storage keys are exact:** `userId` and `userEmail` — every read (auth guard, dashboard queries, profile fetch) must use these exact keys.
- **No Supabase Auth tables** (`auth.users`, etc.) are used anywhere — all user identity lives in the custom `public.users` table.
- **bcryptjs rounds = 12** for this feature specifically (note: the generic database template elsewhere in this codebase reference uses 10 rounds — Ad-Genie's plan specifies **12**, use 12).
- Never log or return `password_hash` in any API response.
- `userId` from `localStorage` is the value passed as `user_id` on every authenticated write (redemptions, posters, hashtag_sets, download_events, hashtag_copy_events, saved_offers) — there is no server-side session to derive it from, so the client must include it explicitly in authenticated request bodies.

---

## Design
- **Page background:** `ag-bg-base` under light theme (`#FDF6E3` — Desert Sand), set via `data-theme="light"` on the `(auth)` route group.
- **Card:** `AuthCard` uses `ag-bg-surface` (`#EDD9A3`), 1px border `ag-border-base`, `border-radius: 12px`, padding 24px, centered both axes.
- **Heading:** Cinzel, `text-title` (20px/500), `ag-fg-base`.
- **Inputs:** Standard input spec from the design system — 40px height, `ag-bg-surface` background, `ag-border-base` border, focus ring `rgba(212,175,55,0.12)`.
- **Submit button:** Primary gold button (`ag-accent` background, `ag-fg-inverted` text), full width, 40px height.
- **Error state:** Inline text below the field, `ag-error` (`#C94040`), `text-caption` size — never a generic top-of-form banner only; field-level errors take priority.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Signup with an email that already exists | `400` — "Email already registered"; shown inline near the email field |
| Signup with password < 8 chars | Blocked client-side before request is sent; inline error under password field |
| Signup with any field empty | Blocked client-side; submit button disabled until all fields are filled |
| Login with unknown email | `401` — "Invalid credentials" (same message as wrong password — no enumeration) |
| Login with correct email, wrong password | `401` — "Invalid credentials" |
| Login/signup network failure | Generic error banner: "Something went wrong. Try again." — form remains filled in, not cleared |
| User manually clears `localStorage` mid-session | Next navigation into `app/(app)/*` triggers the auth guard → redirect to `/login` |
| Double-submit (user clicks submit twice quickly) | Submit button disabled while request is in flight |
