insert into public.seasons (
    code,
    competition,
    starts_at,
    ends_at
)
values (
           '2026-2027',
           'L1',
           '2026-08-21',
           '2027-05-29'
       )
on conflict (code)
do update set
    competition = excluded.competition,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at;

insert into public.teams (
    slug,
    name,
    short_name,
    active
)
values
    ('aj-auxerre', 'AJ Auxerre', 'AJA', true),
    ('angers-sco', 'Angers SCO', 'SCO', true),
    ('as-monaco', 'AS Monaco', 'ASM', true),
    ('stade-brestois', 'Stade Brestois 29', 'SB29', true),
    ('fc-lorient', 'FC Lorient', 'FCL', true),
    ('le-havre', 'Havre AC', 'HAC', true),
    ('le-mans', 'Le Mans FC', 'LMFC', true),
    ('losc', 'LOSC Lille', 'LOSC', true),
    ('olympique-lyonnais', 'Olympique Lyonnais', 'OL', true),
    ('olympique-marseille', 'Olympique de Marseille', 'OM', true),
    ('ogc-nice', 'OGC Nice', 'OGCN', true),
    ('paris-fc', 'Paris FC', 'PFC', true),
    ('paris-sg', 'Paris Saint-Germain', 'PSG', true),
    ('rc-lens', 'RC Lens', 'RCL', true),
    ('stade-rennais', 'Stade Rennais FC', 'SRFC', true),
    ('rc-strasbourg', 'RC Strasbourg Alsace', 'RCSA', true),
    ('toulouse-fc', 'Toulouse FC', 'TFC', true),
    ('estac-troyes', 'ESTAC Troyes', 'ESTAC', true)
on conflict (slug)
do update set
    name = excluded.name,
    short_name = excluded.short_name,
    active = excluded.active;