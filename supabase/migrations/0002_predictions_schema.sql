create table if not exists public.odds_snapshots
(
    id uuid primary key default gen_random_uuid(),
    match_id uuid not null references public.matches(id) on delete cascade,
    provider     text not null,
    bookmaker    text,
    captured_at timestamptz not null,
    market_payload jsonb not null,
    content_hash text not null,
    created_at timestamptz not null default now(),
    unique (match_id, provider, captured_at, content_hash)
);

create index if not exists odds_snapshots_match_time_idx on public.odds_snapshots(match_id, captured_at desc);

create table if not exists public.model_versions
(
    id uuid primary key default gen_random_uuid(),
    version text not null unique,
    git_sha text,
    config jsonb not null,
    trained_until timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists public.predictions
(
    id uuid primary key default gen_random_uuid(),
    match_id uuid not null references public.matches(id) on delete cascade,
    odds_snapshot_id uuid not null references public.odds_snapshots(id),
    model_version_id uuid not null references public.model_versions(id),
    calculated_at timestamptz not null,
    cutoff_at timestamptz not null,
    lambda_home     numeric not null,
    lambda_away     numeric not null,
    rho             numeric not null,
    market_fit_loss numeric not null,
    score_probabilities jsonb not null,
    created_at timestamptz not null default now()
);

create index if not exists predictions_match_calc_idx on public.predictions(match_id, calculated_at desc);

alter table public.odds_snapshots enable row level security;
alter table public.model_versions enable row level security;
alter table public.predictions enable row level security;