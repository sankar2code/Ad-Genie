# Ad-Genie
Next-generation AI-powered advertising platform designed to automate campaign creation, optimization, and performance analysis.

## Deploying to Vercel

1. Push this repo to GitHub/GitLab and import it in Vercel.
2. Add every variable from `.env` to the Vercel project's Environment Variables (Production + Preview). Server-only keys (`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `RAKUTEN_API_KEY`, `RAKUTEN_PUBLISHER_ID`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`) must **not** get a `NEXT_PUBLIC_` prefix — only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, and `NEXT_PUBLIC_SENTRY_DSN` are meant to reach the browser.
3. Run `supabase/migrations/0001_init.sql` and `0002_reported_issues.sql` against your Supabase project (SQL Editor or `supabase db push`), then `npm run setup:storage` once `SUPABASE_SERVICE_ROLE_KEY` is set, to create the `user-photos` and `generated-posters` buckets.
4. TLS is enforced automatically for all `*.vercel.app` and custom domains on Vercel — no app-level config needed.
5. A third-party security pentest and a load test against real Rakuten/OpenAI credentials (targeting offer feed <2s P95, poster generation <15s P95 per the PRD) are recommended before public launch — both require infrastructure outside this repo.
