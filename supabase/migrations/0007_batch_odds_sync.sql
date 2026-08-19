alter table public.odds_snapshots
    drop constraint if exists odds_snapshots_match_id_provider_captured_at_content_hash_key;

alter table public.odds_snapshots
    add constraint odds_snapshots_unique_bookmaker_snapshot
        unique (
                match_id,
                provider,
                bookmaker,
                captured_at,
                content_hash
            );