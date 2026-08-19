alter table public.predictions
    add column if not exists crowd_probabilities jsonb,
    add column if not exists expected_points jsonb,
    add column if not exists leader_score text,
    add column if not exists balanced_score text,
    add column if not exists challenger_score text;