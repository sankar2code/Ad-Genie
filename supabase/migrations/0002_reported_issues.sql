-- Phase 11: "Report an issue" button on offer detail pages.
-- user_id is nullable — a report should still be accepted even if the
-- client's localStorage userId is somehow missing.

create table if not exists reported_issues (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete set null,
  offer_id    uuid not null references offers(id) on delete cascade,
  reason      text not null,
  details     text,
  reported_at timestamptz not null default now()
);

create index if not exists idx_reported_issues_offer_id on reported_issues (offer_id);
