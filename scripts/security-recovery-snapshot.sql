-- READ ONLY. Run in the project's Supabase SQL Editor, then export the result.
-- Configuration snapshot only: NOT a full database/data/Auth/Storage backup.
-- No passwords, session tokens or account rows are selected.
-- Keep the export private and outside version control.
select jsonb_build_object(
  'project_ref', 'wigksclnaybjqmoktsje',
  'captured_at', current_timestamp,
  'scope', 'Configuration before 202609280001_security_hardening; not a data backup',
  'functions', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'schema', n.nspname,
      'name', p.proname,
      'arguments', pg_get_function_identity_arguments(p.oid),
      'definition', pg_get_functiondef(p.oid),
      'owner', pg_get_userbyid(p.proowner),
      'security_definer', p.prosecdef,
      'configuration', p.proconfig,
      'acl', coalesce(p.proacl, acldefault('f', p.proowner))::text,
      'grants', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'grantor', pg_get_userbyid(a.grantor),
          'grantee', case when a.grantee = 0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,
          'privilege', a.privilege_type,
          'grantable', a.is_grantable
        )), '[]'::jsonb)
        from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
      )
    ) order by n.nspname, p.proname), '[]'::jsonb)
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where p.prokind = 'f' and (
      (n.nspname = 'private' and p.proname = 'is_admin') or
      (n.nspname = 'public' and p.proname = 'consume_rate_limit')
    )
  ),
  'private_schema', (
    select jsonb_build_object(
      'owner', pg_get_userbyid(n.nspowner),
      'acl', coalesce(n.nspacl, acldefault('n', n.nspowner))::text,
      'grants', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'grantor', pg_get_userbyid(a.grantor),
          'grantee', case when a.grantee = 0 then 'PUBLIC' else pg_get_userbyid(a.grantee) end,
          'privilege', a.privilege_type,
          'grantable', a.is_grantable
        )), '[]'::jsonb)
        from aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) a
      )
    ) from pg_namespace n where n.nspname = 'private'
  ),
  'table_security', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'table', c.relname, 'rls_enabled', c.relrowsecurity,
      'rls_forced', c.relforcerowsecurity, 'owner', pg_get_userbyid(c.relowner),
      'acl', coalesce(c.relacl, acldefault('r', c.relowner))::text
    ) order by c.relname), '[]'::jsonb)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p') and
      c.relname in ('profiles', 'cms_entries', 'cms_entry_translations', 'rate_limit_buckets')
  ),
  'policies', (
    select coalesce(jsonb_agg(to_jsonb(p) order by p.tablename, p.policyname), '[]'::jsonb)
    from pg_policies p where p.schemaname = 'public' and
      p.tablename in ('profiles', 'cms_entries', 'cms_entry_translations', 'rate_limit_buckets')
  ),
  'profile_triggers', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'name', t.tgname, 'enabled', t.tgenabled, 'definition', pg_get_triggerdef(t.oid)
    ) order by t.tgname), '[]'::jsonb)
    from pg_trigger t join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'profiles' and not t.tgisinternal
  )
)::text as recovery_snapshot;
