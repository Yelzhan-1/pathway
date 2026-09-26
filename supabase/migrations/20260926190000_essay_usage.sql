-- Rate-limit counter for «Разбор мотивационного письма» (/essay).
-- Stores ONLY a per-user timestamp — never the letter text — so ~5 analyses/hour can be
-- enforced across serverless instances. Apply manually. Do not run this from the app.
--
-- NOT APPLIED YET. The app currently falls back to an in-memory, per-process rate limiter
-- (see src/lib/essay/rateLimit.ts) until this migration is applied by the project owner.
-- Once applied, the /api/essay route can be switched to count rows in this table instead
-- (same isOverEssayRateLimit threshold, no other behavior change).

create table if not exists public.essay_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists essay_usage_events_user_id_created_at_idx
  on public.essay_usage_events (user_id, created_at desc);

alter table public.essay_usage_events enable row level security;

drop policy if exists essay_usage_events_select_own on public.essay_usage_events;
drop policy if exists essay_usage_events_insert_own on public.essay_usage_events;

create policy essay_usage_events_select_own
  on public.essay_usage_events
  for select
  to authenticated
  using (user_id = auth.uid());

create policy essay_usage_events_insert_own
  on public.essay_usage_events
  for insert
  to authenticated
  with check (user_id = auth.uid());

grant select, insert on public.essay_usage_events to authenticated;
