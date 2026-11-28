-- 003: Rates from La Luz (Nov 2026). Already 50% off, breakfast, lunch and dinner included.
-- Adds the 3BR and 7BR pool villas. Safe to run again.

update public.rooms r set price_per_night = v.price, capacity = v.cap, summary = v.summary, weekend_price = null
from (values
  ('family-suite',                    5500,  3, 'A deluxe annex room with 2 king beds size, good for 2 to 3 guests.'),
  ('beachfront-villa',                6500,  5, 'A deluxe premier room for 4 to 5 guests.'),
  ('presidential-suite',              8000,  6, 'A dormitory-style annex room with 3 king beds for 5 to 6 guests.'),
  ('annex-loft-room',                 10000, 8, 'A two-level annex loft room, good for 8 guests.'),
  ('premier-loft-room',               12000, 12, 'A spacious loft room ideal for families or groups of up to 10-12.'),
  ('la-luz-luxury-5br-private-villa', 25000, 25, 'A 5-bedroom luxury villa with a kitchen and private pool, good for 20 to 25 guests.')
) as v(slug, price, cap, summary)
where r.slug = v.slug;

insert into public.rooms (slug, name, summary, price_per_night, capacity, beds, size_m2, units) values
  ('luxury-pool-villa-3br', 'Luxury Pool Villa 3BR', 'A 3-bedroom luxury pool villa, good for 15 to 17 guests.', 17500, 17, '3 bedrooms', null, 1),
  ('luxury-pool-villa-7br', 'Luxury Pool Villa 7BR', 'A 7-bedroom luxury pool villa, good for 30 to 45 guests.', 36000, 45, '7 bedrooms', null, 1)
on conflict (slug) do update set name = excluded.name, summary = excluded.summary,
  price_per_night = excluded.price_per_night, capacity = excluded.capacity, beds = excluded.beds;

notify pgrst, 'reload schema';
