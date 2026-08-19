grant usage on schema public to service_role;

grant all privileges on table public.teams to service_role;
grant all privileges on table public.seasons to service_role;
grant all privileges on table public.matches to service_role;
grant all privileges on table public.odds_snapshots to service_role;
grant all privileges on table public.model_versions to service_role;
grant all privileges on table public.predictions to service_role;