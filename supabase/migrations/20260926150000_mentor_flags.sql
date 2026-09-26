create or replace function public.mentor_flags(ids uuid[]) returns table (user_id uuid) language sql stable security definer set search_path = public as $$ select p.id from public.profiles p where p.id = any(ids) and p.is_mentor; $$;
revoke all on function public.mentor_flags(uuid[]) from public;
revoke all on function public.mentor_flags(uuid[]) from anon;
grant execute on function public.mentor_flags(uuid[]) to authenticated;
