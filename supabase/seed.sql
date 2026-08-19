insert into public.seasons (code, competition, starts_at, ends_at)
values ('2026-2027', 'L1', '2026-08-01', '2027-05-31')
on conflict (code) do nothing;

insert into public.teams (slug, name, short_name)
values
    ('paris-sg', 'Paris Saint-Germain', 'PSG'),
    ('lens', 'RC Lens', 'RCL'),
    ('marseille', 'Olympique de Marseille', 'OM'),
    ('lyon', 'Olympique Lyonnais', 'OL')
on conflict (slug) do nothing;

insert into public.matches (
    season_id,
    round,
    kickoff_at,
    home_team_id,
    away_team_id
)
select
    s.id,
    1,
    '2026-08-22T21:00:00+02:00',
    h.id,
    a.id
from public.seasons s
         join public.teams h on h.slug = 'paris-sg'
         join public.teams a on a.slug = 'lens'
where s.code = '2026-2027'
on conflict do nothing;