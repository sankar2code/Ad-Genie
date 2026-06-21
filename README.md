# Ad-Genie
Next-generation AI-powered advertising platform designed to automate campaign creation, optimization, and performance analysis.

## Deploying to Netlify

Netlify supports Next.js 14 App Router natively — API routes, Server Components, and image optimisation all work without any static export.

### 1. Connect the repo

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Connect your GitHub account and select the **Ad-Genie** repository
3. Netlify auto-detects Next.js. Confirm the build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. Click **Deploy site**

### 2. Add environment variables

In Netlify dashboard → **Site → Environment variables**, add every key from `.env`:

| Variable | Where to get it | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role | **No** |
| `OPENAI_API_KEY` | platform.openai.com/api-keys | **No** |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | console.cloud.google.com | Yes |
| `RAKUTEN_API_KEY` | api.rakutenmarketing.com | **No** |
| `RAKUTEN_PUBLISHER_ID` | Rakuten affiliate dashboard | **No** |
| `NEXT_PUBLIC_SENTRY_DSN` | sentry.io → Project → Client Keys | Yes |
| `SENTRY_DSN` | sentry.io → Project → Client Keys | **No** |
| `SENTRY_ORG` | sentry.io → Settings | **No** |
| `SENTRY_PROJECT` | sentry.io → Settings | **No** |
| `SENTRY_AUTH_TOKEN` | sentry.io → Settings → Auth Tokens | **No** |

Sentry variables are optional — leave them blank to disable error tracking.

### 3. Set up Supabase

Run the migrations and create storage buckets **once**, before your first real user hits the site:

```bash
# In Supabase SQL Editor, run in order:
supabase/migrations/0001_init.sql
supabase/migrations/0002_reported_issues.sql

# Then, with SUPABASE_SERVICE_ROLE_KEY set locally:
npm run setup:storage
```

This creates the `user-photos` and `generated-posters` private buckets.

### 4. Custom domain (optional)

Netlify dashboard → **Domain management → Add a domain** → follow the DNS instructions.
TLS is provisioned automatically via Let's Encrypt.

### 5. Before public launch

- Run a security pentest against the live Netlify URL
- Load test the offer feed (<2s P95) and poster generation (<15s P95) with real API credentials
- Verify Sentry is receiving errors in your Sentry dashboard

---

## Local development

```bash
cp .env .env.local          # add your real keys to .env.local
npm install
npm run dev                 # http://localhost:3000
```
