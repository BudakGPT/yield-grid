alter table product_gradings
    add column if not exists photo_ipfs_cid varchar(160);

create table if not exists grade_recommendations (
    grade varchar(1) primary key,
    title varchar(120) not null,
    description varchar(500) not null,
    constraint chk_grade_recommendations_grade check (grade in ('A', 'B', 'C'))
);

insert into grade_recommendations (grade, title, description) values
    ('A', 'Premium retail & hospitality', 'Best suited for premium fresh retail, supermarkets, hotels, restaurants, and direct consumers.'),
    ('B', 'Wholesale & food manufacturing', 'Suitable for wholesale distribution, commercial kitchens, packaged foods, sauces, and other manufacturing inputs.'),
    ('C', 'Processing, feed & fertilizer', 'Route away from premium fresh retail toward safe processing, animal feed, compost, or fertilizer based on food-safety review.')
on conflict (grade) do nothing;
