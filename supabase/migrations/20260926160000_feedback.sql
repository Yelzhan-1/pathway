-- Feedback scores for «Помогло ли тебе?».
-- Apply manually. Do not run this from the app.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  page text not null check (char_length(page) <= 100),
  helpful smallint not null check (helpful between 1 and 5),
  comment text null check (char_length(comment) <= 1000),
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

drop policy if exists feedback_select_own on public.feedback;
drop policy if exists feedback_insert_own on public.feedback;

create policy feedback_select_own
  on public.feedback
  for select
  to authenticated
  using (user_id = auth.uid());

create policy feedback_insert_own
  on public.feedback
  for insert
  to authenticated
  with check (user_id = auth.uid());

grant select, insert on public.feedback to authenticated;

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
    'feedback_count', (select count(*)::int from public.feedback),
    'feedback_avg', (select round(avg(helpful)::numeric, 1) from public.feedback),
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
