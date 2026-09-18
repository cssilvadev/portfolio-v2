-- Portfolio authentication and billing schema.
-- Passwords are owned by Supabase Auth; this database never stores password
-- hashes. Apply this file in the Supabase SQL editor before enabling billing.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'user'
    check (role in ('user', 'admin')),
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro', 'lifetime')),
  stripe_customer_id text unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

create table if not exists public.billing_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  kind text not null check (kind in ('recurring', 'lifetime')),
  interval text not null check (interval in ('month', 'year', 'once')),
  currency text not null check (currency = lower(currency) and length(currency) = 3),
  price_cents integer not null check (price_cents >= 0),
  stripe_price_id text unique,
  active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.billing_plans(id),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null check (status in ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, plan_id)
);

alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions add constraint subscriptions_status_check
  check (status in ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused'));

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.billing_plans(id),
  source text not null check (source in ('stripe_subscription', 'stripe_payment', 'admin_grant')),
  status text not null check (status in ('active', 'revoked', 'expired')),
  starts_at timestamptz not null default timezone('utc', now()),
  ends_at timestamptz,
  stripe_reference_id text unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, plan_id)
);

-- Used for webhook idempotency. Raw Stripe payloads are intentionally not
-- stored here; keep the minimum metadata needed for audit/replay decisions.
create table if not exists public.billing_events (
  stripe_event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz
);

create table if not exists public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('article', 'project', 'page')),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  date_label text not null default '',
  category text,
  cover_image text,
  tags text[] not null default '{}',
  stack text[] not null default '{}',
  specs jsonb not null default '[]'::jsonb check (jsonb_typeof(specs) = 'array'),
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (kind, slug)
);

create table if not exists public.cms_entry_translations (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.cms_entries(id) on delete cascade,
  language text not null check (language in ('en', 'pt', 'es')),
  title text not null default '',
  excerpt text not null default '',
  overview text not null default '',
  body text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (entry_id, language)
);

-- Server-only sliding window buckets used by Edge Functions. The key is a
-- server-side SHA-256 digest, never a raw IP or user identifier.
create table if not exists public.rate_limit_buckets (
  key_hash text primary key,
  window_started_at timestamptz not null default timezone('utc', now()),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists rate_limit_buckets_updated_at_idx
  on public.rate_limit_buckets (updated_at);

insert into public.billing_plans (slug, name, description, kind, interval, currency, price_cents, active)
values
  ('pro-monthly', 'Portfolio PRO monthly', 'Access to protected portfolio features.', 'recurring', 'month', 'brl', 0, false),
  ('pro-yearly', 'Portfolio PRO yearly', 'Access to protected portfolio features.', 'recurring', 'year', 'brl', 0, false),
  ('pro-lifetime', 'Portfolio PRO lifetime', 'Permanent access to protected portfolio features.', 'lifetime', 'once', 'brl', 0, false)
on conflict (slug) do nothing;

alter table public.profiles enable row level security;
alter table public.billing_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.billing_events enable row level security;
alter table public.rate_limit_buckets enable row level security;
alter table public.cms_entries enable row level security;
alter table public.cms_entry_translations enable row level security;

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Anyone can read active billing plans" on public.billing_plans;
create policy "Anyone can read active billing plans"
  on public.billing_plans for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Users can read their own subscriptions" on public.subscriptions;
create policy "Users can read their own subscriptions"
  on public.subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own entitlements" on public.entitlements;
create policy "Users can read their own entitlements"
  on public.entitlements for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No client role receives INSERT, UPDATE or DELETE policies for billing tables.
revoke all on public.billing_events from anon, authenticated;
revoke all on public.rate_limit_buckets from anon, authenticated;

drop policy if exists "Published CMS entries are public" on public.cms_entries;
create policy "Published CMS entries are public"
  on public.cms_entries for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins can read all CMS entries" on public.cms_entries;
create policy "Admins can read all CMS entries"
  on public.cms_entries for select
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins can insert CMS entries" on public.cms_entries;
create policy "Admins can insert CMS entries"
  on public.cms_entries for insert
  to authenticated
  with check ((select private.is_admin()) and (created_by is null or created_by = (select auth.uid())));

drop policy if exists "Admins can update CMS entries" on public.cms_entries;
create policy "Admins can update CMS entries"
  on public.cms_entries for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins can delete CMS entries" on public.cms_entries;
create policy "Admins can delete CMS entries"
  on public.cms_entries for delete
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "Published CMS translations are public" on public.cms_entry_translations;
create policy "Published CMS translations are public"
  on public.cms_entry_translations for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.cms_entries
      where id = entry_id and published = true
    )
  );

drop policy if exists "Admins can read all CMS translations" on public.cms_entry_translations;
create policy "Admins can read all CMS translations"
  on public.cms_entry_translations for select
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins can insert CMS translations" on public.cms_entry_translations;
create policy "Admins can insert CMS translations"
  on public.cms_entry_translations for insert
  to authenticated
  with check ((select private.is_admin()));

drop policy if exists "Admins can update CMS translations" on public.cms_entry_translations;
create policy "Admins can update CMS translations"
  on public.cms_entry_translations for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins can delete CMS translations" on public.cms_entry_translations;
create policy "Admins can delete CMS translations"
  on public.cms_entry_translations for delete
  to authenticated
  using ((select private.is_admin()));

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_window_seconds integer,
  p_max_requests integer
)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  now_at timestamptz := timezone('utc', now());
  bucket public.rate_limit_buckets%rowtype;
  elapsed_seconds integer;
begin
  if p_key_hash is null or length(p_key_hash) < 32 or p_window_seconds < 1 or p_max_requests < 1 then
    raise exception 'Invalid rate limit parameters';
  end if;

  insert into public.rate_limit_buckets (key_hash, window_started_at, request_count, updated_at)
  values (p_key_hash, now_at, 0, now_at)
  on conflict (key_hash) do nothing;

  select * into bucket
  from public.rate_limit_buckets
  where key_hash = p_key_hash
  for update;

  elapsed_seconds := floor(extract(epoch from (now_at - bucket.window_started_at)))::integer;
  if elapsed_seconds >= p_window_seconds then
    update public.rate_limit_buckets
    set window_started_at = now_at, request_count = 1, updated_at = now_at
    where key_hash = p_key_hash;
    return query select true, 0;
  end if;

  if bucket.request_count < p_max_requests then
    update public.rate_limit_buckets
    set request_count = bucket.request_count + 1, updated_at = now_at
    where key_hash = p_key_hash;
    return query select true, 0;
  end if;

  return query select false, greatest(1, p_window_seconds - elapsed_seconds);
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists touch_billing_plans_updated_at on public.billing_plans;
create trigger touch_billing_plans_updated_at before update on public.billing_plans
for each row execute function public.touch_updated_at();

drop trigger if exists touch_subscriptions_updated_at on public.subscriptions;
create trigger touch_subscriptions_updated_at before update on public.subscriptions
for each row execute function public.touch_updated_at();

drop trigger if exists touch_entitlements_updated_at on public.entitlements;
create trigger touch_entitlements_updated_at before update on public.entitlements
for each row execute function public.touch_updated_at();

drop trigger if exists touch_cms_entries_updated_at on public.cms_entries;
create trigger touch_cms_entries_updated_at before update on public.cms_entries
for each row execute function public.touch_updated_at();

drop trigger if exists touch_cms_entry_translations_updated_at on public.cms_entry_translations;
create trigger touch_cms_entry_translations_updated_at before update on public.cms_entry_translations
for each row execute function public.touch_updated_at();

create or replace function public.prevent_client_protected_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is not null and (
    new.id is distinct from old.id or
    new.email is distinct from old.email or
    new.role is distinct from old.role or
    new.subscription_tier is distinct from old.subscription_tier or
    new.stripe_customer_id is distinct from old.stripe_customer_id or
    new.created_at is distinct from old.created_at
  ) then
    raise exception 'Protected profile fields are server-managed';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields before update on public.profiles
for each row execute function public.prevent_client_protected_profile_changes();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant select on public.billing_plans to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.subscriptions, public.entitlements to authenticated;
grant select on public.cms_entries, public.cms_entry_translations to anon, authenticated;
grant insert, update, delete on public.cms_entries, public.cms_entry_translations to authenticated;
