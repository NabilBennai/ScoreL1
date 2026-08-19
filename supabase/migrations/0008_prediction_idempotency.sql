with ranked_predictions as (
    select
        id,
        row_number() over (
            partition by
                match_id,
                odds_snapshot_id,
                model_version_id
            order by
                calculated_at desc,
                created_at desc,
                id desc
            ) as row_number
from public.predictions
    )
delete from public.predictions
where id in (
    select id
    from ranked_predictions
    where row_number > 1
);

alter table public.predictions
    add constraint predictions_unique_model_snapshot
        unique (
                match_id,
                odds_snapshot_id,
                model_version_id
            );