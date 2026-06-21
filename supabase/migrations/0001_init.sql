-- Ad-Genie initial schema. Mirrors specs/database.md.
-- NOTE: as of this build, all 9 tables already exist in the live Supabase
-- project (verified via the PostgREST API). This file exists for version
-- control / reproducibility — re-running it against the same project is
-- safe since every statement is idempotent (`if not exists` / `create table`
-- will simply error harmlessly if already applied; drop the `create table`
-- statements for tables you've already confirmed exist before re-running).

create extension if not exists "pgcrypto";

create table if not exists users (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,
  password_hash       text not null,
  display_name        text not null,
  zip_code            text,
  favourite_stores    text[] default '{}',
  notification_prefs  jsonb default '{"dealAlerts": true, "expiryReminders": true}',
  created_at          timestamptz not null default now()
);

create table if not exists user_photos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  storage_url   text not null,
  uploaded_at   timestamptz not null default now(),
  unique (user_id)
);

create table if not exists offers (
  id              uuid primary key default gen_random_uuid(),
  store           text not null check (store in ('target', 'walmart', 'cvs')),
  type            text not null check (type in ('online', 'offline')),
  headline        text not null,
  discount_value  text not null,
  category        text not null check (category in ('Grocery', 'Electronics', 'Health', 'Beauty', 'Home', 'Apparel')),
  coupon_code     text,
  qr_value        text,
  retailer_url    text,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  is_active       boolean not null default true
);

create index if not exists idx_offers_store_type_active on offers (store, type, is_active);
create index if not exists idx_offers_expires_at on offers (expires_at);

create table if not exists saved_offers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  offer_id    uuid not null references offers(id) on delete cascade,
  saved_at    timestamptz not null default now(),
  unique (user_id, offer_id)
);

create table if not exists redemptions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  offer_id        uuid not null references offers(id) on delete cascade,
  channel         text not null check (channel in ('online', 'offline')),
  savings_amount  numeric,
  redeemed_at     timestamptz not null default now()
);

create index if not exists idx_redemptions_user_id on redemptions (user_id);

create table if not exists posters (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  offer_id      uuid not null references offers(id) on delete cascade,
  storage_url   text not null,
  generated_at  timestamptz not null default now()
);

create index if not exists idx_posters_user_id on posters (user_id);

create table if not exists hashtag_sets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  offer_id      uuid not null references offers(id) on delete cascade,
  hashtags      text[] not null,
  generated_at  timestamptz not null default now(),
  copied_at     timestamptz
);

create index if not exists idx_hashtag_sets_user_id on hashtag_sets (user_id);

create table if not exists download_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  offer_id        uuid not null references offers(id) on delete cascade,
  downloaded_at   timestamptz not null default now()
);

create index if not exists idx_download_events_user_id on download_events (user_id);

create table if not exists hashtag_copy_events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  hashtag_set_id    uuid not null references hashtag_sets(id) on delete cascade,
  copied_at         timestamptz not null default now()
);

create index if not exists idx_hashtag_copy_events_user_id on hashtag_copy_events (user_id);
