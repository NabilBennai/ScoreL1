alter table public.matches
    alter column round drop not null;

create unique index if not exists matches_external_id_unique_idx
    on public.matches(external_id)
    where external_id is not null;