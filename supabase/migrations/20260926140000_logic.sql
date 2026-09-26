-- Logic layer: activity, mentor board, roadmap keys, impact aggregates.
-- Apply manually. Do not run this from the app.

alter table public.profiles
  add column if not exists weekly_goal smallint null
    constraint profiles_weekly_goal_range check (weekly_goal between 1 and 50),
  add column if not exists free_only boolean not null default false,
  add column if not exists is_mentor boolean not null default false;

-- Table-level UPDATE is granted to authenticated, so a column GRANT cannot
-- protect is_mentor. Block changes unless the caller is service_role or postgres.
create or replace function public.protect_profiles_is_mentor()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.is_mentor is distinct from old.is_mentor then
    if auth.role() is distinct from 'service_role'
       and current_user is distinct from 'postgres' then
      raise exception 'is_mentor can only be changed by an admin'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_is_mentor on public.profiles;

create trigger profiles_protect_is_mentor
  before update on public.profiles
  for each row
  execute function public.protect_profiles_is_mentor();

alter table public.tasks
  add column if not exists roadmap_key text;

create unique index if not exists tasks_user_roadmap_key_uidx
  on public.tasks (user_id, roadmap_key);

create table if not exists public.activity_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);

alter table public.activity_days enable row level security;

drop policy if exists activity_days_select_own on public.activity_days;
drop policy if exists activity_days_insert_own on public.activity_days;
drop policy if exists activity_days_update_own on public.activity_days;
drop policy if exists activity_days_delete_own on public.activity_days;

create policy activity_days_select_own
  on public.activity_days
  for select
  to authenticated
  using (user_id = auth.uid());

create policy activity_days_insert_own
  on public.activity_days
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy activity_days_update_own
  on public.activity_days
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy activity_days_delete_own
  on public.activity_days
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.activity_days to authenticated;

create table if not exists public.mentor_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null constraint mentor_questions_title_len check (char_length(title) between 3 and 200),
  body text not null constraint mentor_questions_body_len check (char_length(body) between 1 and 4000),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.mentor_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.mentor_questions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null constraint mentor_answers_body_len check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists mentor_answers_question_id_idx
  on public.mentor_answers (question_id);

alter table public.mentor_questions enable row level security;
alter table public.mentor_answers enable row level security;

drop policy if exists mentor_questions_read on public.mentor_questions;
drop policy if exists mentor_questions_insert_own on public.mentor_questions;
drop policy if exists mentor_questions_update_own on public.mentor_questions;
drop policy if exists mentor_questions_delete_own on public.mentor_questions;
drop policy if exists mentor_answers_read on public.mentor_answers;
drop policy if exists mentor_answers_insert_own on public.mentor_answers;
drop policy if exists mentor_answers_update_own on public.mentor_answers;
drop policy if exists mentor_answers_delete_own on public.mentor_answers;

create policy mentor_questions_read
  on public.mentor_questions
  for select
  to authenticated
  using (true);

create policy mentor_questions_insert_own
  on public.mentor_questions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy mentor_questions_update_own
  on public.mentor_questions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy mentor_questions_delete_own
  on public.mentor_questions
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy mentor_answers_read
  on public.mentor_answers
  for select
  to authenticated
  using (true);

create policy mentor_answers_insert_own
  on public.mentor_answers
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy mentor_answers_update_own
  on public.mentor_answers
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy mentor_answers_delete_own
  on public.mentor_answers
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.mentor_questions to authenticated;
grant select, insert, update, delete on public.mentor_answers to authenticated;

-- Aggregate counts only. No user ids, names, or free text.
create or replace function public.impact_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'users', (select count(*)::int from public.profiles),
    'onboarding_completed', (
      select count(*)::int from public.profiles where onboarding_completed
    ),
    'shortlisted_items', (select count(*)::int from public.shortlist),
    'roadmap_tasks_done', (
      select count(*)::int
      from public.tasks
      where source = 'roadmap' and status = 'done'
    ),
    'cvs_filled', (
      select count(*)::int
      from public.profiles
      where cv is not null
        and jsonb_typeof(cv) = 'object'
        and (
          coalesce(btrim(cv->>'summary'), '') <> ''
          or coalesce(
            jsonb_array_length(
              case
                when jsonb_typeof(cv->'skills') = 'array' then cv->'skills'
                else '[]'::jsonb
              end
            ),
            0
          ) > 0
        )
    ),
    'questions_answered', (
      select count(distinct question_id)::int from public.mentor_answers
    ),
    'readiness_inputs', jsonb_build_object(
      'profiles_with_gpa', (
        select count(*)::int from public.profiles where gpa is not null and gpa_scale is not null
      ),
      'profiles_with_exams', (
        select count(*)::int
        from public.profiles
        where jsonb_typeof(exams) = 'array' and jsonb_array_length(exams) > 0
      ),
      'profiles_with_shortlist', (
        select count(distinct user_id)::int from public.shortlist
      ),
      'profiles_with_cv', (
        select count(*)::int
        from public.profiles
        where cv is not null
          and jsonb_typeof(cv) = 'object'
          and coalesce(btrim(cv->>'summary'), '') <> ''
      )
    )
  );
$$;

revoke all on function public.impact_stats() from public;
revoke all on function public.impact_stats() from anon;
grant execute on function public.impact_stats() to authenticated;
