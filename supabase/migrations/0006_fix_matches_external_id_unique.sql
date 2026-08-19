drop index if exists public.matches_external_id_unique_idx;

alter table public.matches
    add constraint matches_external_id_unique unique (external_id);