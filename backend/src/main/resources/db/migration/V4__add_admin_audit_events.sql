create table if not exists admin_audit_events (
    id uuid primary key,
    actor_id uuid not null,
    actor_email varchar(254) not null,
    action varchar(80) not null,
    target_type varchar(40) not null,
    target_id varchar(80) not null,
    detail varchar(500),
    created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_created on admin_audit_events (created_at);
create index if not exists idx_admin_audit_actor on admin_audit_events (actor_id);
