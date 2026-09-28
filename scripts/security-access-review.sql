-- Metadata only. No credentials, account rows, tokens or content are selected.
select jsonb_build_object(
  'functions', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'schema', n.nspname, 'name', p.proname,
      'arguments', pg_get_function_identity_arguments(p.oid),
      'return_type', pg_get_function_result(p.oid),
      'security_definer', p.prosecdef, 'configuration', p.proconfig,
      'anon_execute', has_function_privilege('anon', p.oid, 'EXECUTE'),
      'authenticated_execute', has_function_privilege('authenticated', p.oid, 'EXECUTE')
    ) order by n.nspname, p.proname), '[]'::jsonb)
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private') and p.prokind = 'f'
      and not exists (select 1 from pg_depend d where d.classid = 'pg_proc'::regclass
        and d.objid = p.oid and d.refclassid = 'pg_extension'::regclass and d.deptype = 'e')
  ),
  'tables_and_views', (
    select coalesce(jsonb_agg(jsonb_build_object(
      'name', c.relname, 'kind', c.relkind, 'rls', c.relrowsecurity, 'options', c.reloptions,
      'acl', coalesce(c.relacl, acldefault('r', c.relowner))::text,
      'anon_read', has_table_privilege('anon', c.oid, 'SELECT'),
      'anon_write', has_table_privilege('anon', c.oid, 'INSERT,UPDATE,DELETE'),
      'authenticated_ddl', has_table_privilege('authenticated', c.oid, 'TRUNCATE,TRIGGER,REFERENCES')
    ) order by c.relname), '[]'::jsonb)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r','p','v','m')
  ),
  'policies', (select coalesce(jsonb_agg(to_jsonb(p) order by p.tablename, p.policyname), '[]'::jsonb)
    from pg_policies p where schemaname = 'public'),
  'schemas', (select coalesce(jsonb_agg(jsonb_build_object('name', nspname,
    'anon_create', has_schema_privilege('anon', oid, 'CREATE'),
    'authenticated_create', has_schema_privilege('authenticated', oid, 'CREATE'))), '[]'::jsonb)
    from pg_namespace where nspname in ('public','private'))
)::text as access_review;
