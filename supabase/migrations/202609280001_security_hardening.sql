-- Apply AFTER the admin MFA UI is deployed. Existing content and users are retained.
-- This migration does not enable CAPTCHA or disable sign-up: those are Auth settings.
begin;

create or replace function private.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt()->>'aal') = 'aal2', false) and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function public.consume_rate_limit(
  p_key_hash text, p_window_seconds integer, p_max_requests integer
)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql security definer set search_path = ''
as $$
declare
  now_at timestamptz := timezone('utc', now());
  bucket public.rate_limit_buckets%rowtype;
  elapsed_seconds integer;
begin
  if p_key_hash is null or p_key_hash !~ '^[a-f0-9]{64}$' or
    p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 or
    p_max_requests is null or p_max_requests < 1 or p_max_requests > 10000 then
    raise exception 'Invalid rate limit parameters';
  end if;
  insert into public.rate_limit_buckets (key_hash, window_started_at, request_count, updated_at)
  values (p_key_hash, now_at, 0, now_at) on conflict (key_hash) do nothing;
  select * into bucket from public.rate_limit_buckets where key_hash = p_key_hash for update;
  elapsed_seconds := floor(extract(epoch from (now_at - bucket.window_started_at)))::integer;
  if elapsed_seconds >= p_window_seconds then
    update public.rate_limit_buckets
    set window_started_at = now_at, request_count = 1, updated_at = now_at
    where key_hash = p_key_hash;
    return query select true, 0;
    return;
  end if;
  if bucket.request_count < p_max_requests then
    update public.rate_limit_buckets set request_count = bucket.request_count + 1, updated_at = now_at
    where key_hash = p_key_hash;
    return query select true, 0;
    return;
  end if;
  return query select false, greatest(1, p_window_seconds - elapsed_seconds);
end;
$$;
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

commit;
