-- Existing rows, accounts, policies and triggers are retained.
-- Client table grants are limited to the operations the app actually uses.
-- MFA/RLS still decide which rows each authenticated request can access.
begin;

revoke all on table public.billing_plans, public.cms_entries,
  public.cms_entry_translations, public.profiles, public.subscriptions,
  public.entitlements, public.billing_events, public.rate_limit_buckets
  from public, anon, authenticated;

grant select on table public.billing_plans, public.cms_entries,
  public.cms_entry_translations to anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select on table public.subscriptions, public.entitlements to authenticated;
grant insert, update, delete on table public.cms_entries,
  public.cms_entry_translations to authenticated;

-- Bodies use schema-qualified relations/auth helpers; built-ins resolve via pg_catalog.
-- Trigger execution does not need client RPC grants; trigger definitions stay unchanged.
alter function public.handle_new_user() set search_path = '';
alter function public.prevent_client_protected_profile_changes() set search_path = '';
alter function public.touch_updated_at() set search_path = '';
revoke all on function public.handle_new_user(),
  public.prevent_client_protected_profile_changes(),
  public.touch_updated_at() from public, anon, authenticated;

-- The legacy production project has an additional billing protection trigger.
-- New installations use the broader protected-profile trigger instead.
do $$
begin
  if to_regprocedure('public.prevent_client_billing_changes()') is not null then
    alter function public.prevent_client_billing_changes() set search_path = '';
    revoke all on function public.prevent_client_billing_changes() from public, anon, authenticated;
  end if;
end;
$$;

commit;
