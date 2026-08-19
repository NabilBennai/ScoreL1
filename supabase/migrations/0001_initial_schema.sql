create extension if not exists "pgcrypto";

create table if not exists public.teams
(
    id         uuid primary key     default gen_random_uuid(),
    slug       text        not null unique,
    name       text        not null,
    short_name text,
    active     boolean     not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.seasons
(
    id          uuid primary key     default gen_random_uuid(),
    code        text        not null unique,
    competition text        not null default 'L1',
    starts_at   date        not null,
    ends_at     date        not null,
    created_at  timestamptz not null default now()
);

create table if not exists public.matches
(
    id           uuid primary key     default gen_random_uuid(),
    season_id    uuid        not null references public.seasons (id) on delete cascade,
    external_id  text,
    round        integer     not null check (round > 0),
    kickoff_at   timestamptz not null,
    home_team_id uuid        not null references public.teams (id),
    away_team_id uuid        not null references public.teams (id),
    status       text        not null default 'SCHEDULED',
    home_goals   integer check (home_goals is null or home_goals >= 0),
    away_goals   integer check (away_goals is null or away_goals >= 0),
    created_at   timestamptz not null default now(),

    constraint matches_different_teams check (home_team_id <> away_team_id),

    constraint matches_unique_fixture unique (
                                              season_id,
                                              round,
                                              home_team_id,
                                              away_team_id
        )
);

create index if not exists matches_season_round_idx
    on public.matches (season_id, round);

create index if not exists matches_kickoff_idx
    on public.matches (kickoff_at);

alter table public.teams
    enable row level security;
alter table public.seasons
    enable row level security;
alter table public.matches
    enable row level security;