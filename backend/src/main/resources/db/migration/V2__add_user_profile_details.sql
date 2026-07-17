begin;

alter table public.user_profiles
    add column if not exists phone_number varchar(32),
    add column if not exists location varchar(120),
    add column if not exists bio varchar(500),
    add column if not exists avatar_url varchar(2048);

commit;
