alter table user_profiles add column if not exists delivery_recipient_name varchar(120);
alter table user_profiles add column if not exists delivery_phone_number varchar(40);
alter table user_profiles add column if not exists delivery_province varchar(120);
alter table user_profiles add column if not exists delivery_city varchar(120);
alter table user_profiles add column if not exists delivery_district varchar(120);
alter table user_profiles add column if not exists delivery_postal_code varchar(20);
alter table user_profiles add column if not exists delivery_address varchar(1000);
alter table user_profiles add column if not exists delivery_notes varchar(1000);
