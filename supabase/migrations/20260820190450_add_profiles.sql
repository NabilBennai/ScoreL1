create table public.profiles
(
    user_id             uuid primary key references auth.users (id) on delete cascade,
    role                text        not null default 'user',
    subscription_status text        not null default 'inactive',
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),

    constraint profiles_role_check
        check (role in ('admin', 'user')),

    constraint profiles_subscription_status_check
        check (subscription_status in ('active', 'inactive'))
);

alter table public.profiles
    enable row level security;

create
    policy "Users can read their own profile"
    on public.profiles
    for
    select
    to authenticated
    using (auth.uid() = user_id);

create function public.handle_new_user()
    returns trigger
    language plpgsql
    security definer
    set search_path = '' as
$$
begin
    insert into public.profiles (user_id)
    values (new.id);

    return new;
end;
$$;

create trigger on_auth_user_created
    after insert
    on auth.users
    for each row
execute function public.handle_new_user();