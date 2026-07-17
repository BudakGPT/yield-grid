begin;

-- The legacy table only contains YieldGrid smoke-test identities. Abort instead
-- of deleting anything if a non-synthetic account is present.
do $$
begin
    if to_regclass('public.users') is not null
       and exists (
            select 1
            from public.users
            where email not like 'vlm-%@yieldgrid.local'
       ) then
        raise exception 'Refusing to migrate public.users because non-synthetic accounts exist';
    end if;
end
$$;

delete from public.product_gradings
where farmer_id in (
    select id from public.users where email like 'vlm-%@yieldgrid.local'
);

delete from public.users where email like 'vlm-%@yieldgrid.local';

create table if not exists public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name varchar(100) not null,
    email varchar(254) not null unique,
    role varchar(32) not null check (role in ('BUYER', 'SELLER')),
    enabled boolean not null default true,
    email_verified boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    last_login_at timestamptz,
    stellar_public_key varchar(64),
    stellar_secret_enc varchar(1000)
);

do $$
declare
    foreign_key record;
begin
    if to_regclass('public.users') is not null then
        for foreign_key in
            select conrelid::regclass as table_name, conname
            from pg_constraint
            where contype = 'f'
              and confrelid = 'public.users'::regclass
        loop
            execute format(
                'alter table %s drop constraint %I',
                foreign_key.table_name,
                foreign_key.conname
            );
        end loop;
        drop table public.users;
    end if;
end
$$;

alter table public.carts
    add constraint fk_carts_buyer_profile
    foreign key (buyer_id) references public.user_profiles(id);
alter table public.order_items
    add constraint fk_order_items_seller_profile
    foreign key (seller_id) references public.user_profiles(id);
alter table public.orders
    add constraint fk_orders_buyer_profile
    foreign key (buyer_id) references public.user_profiles(id);
alter table public.orders
    add constraint fk_orders_farmer_profile
    foreign key (farmer_seller_id) references public.user_profiles(id);
alter table public.product_gradings
    add constraint fk_product_gradings_farmer_profile
    foreign key (farmer_id) references public.user_profiles(id);
alter table public.products
    add constraint fk_products_seller_profile
    foreign key (seller_id) references public.user_profiles(id);

create or replace function public.handle_yieldgrid_auth_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
    requested_role text;
begin
    requested_role := upper(coalesce(new.raw_user_meta_data ->> 'role', 'BUYER'));
    if requested_role not in ('BUYER', 'SELLER') then
        requested_role := 'BUYER';
    end if;

    insert into public.user_profiles (
        id,
        full_name,
        email,
        role,
        enabled,
        email_verified,
        created_at,
        updated_at
    ) values (
        new.id,
        coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'YieldGrid User'),
        lower(new.email),
        requested_role,
        true,
        new.email_confirmed_at is not null,
        now(),
        now()
    )
    on conflict (id) do update set
        full_name = excluded.full_name,
        email = excluded.email,
        email_verified = excluded.email_verified,
        updated_at = now();

    return new;
end
$$;

drop trigger if exists on_yieldgrid_auth_user_created on auth.users;
create trigger on_yieldgrid_auth_user_created
    after insert or update of email, email_confirmed_at, raw_user_meta_data
    on auth.users
    for each row execute procedure public.handle_yieldgrid_auth_user();

alter table public.user_profiles enable row level security;
grant select on public.user_profiles to authenticated;
grant select, insert, update, delete on public.user_profiles to service_role;

drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own
    on public.user_profiles
    for select
    to authenticated
    using ((select auth.uid()) = id);

commit;
