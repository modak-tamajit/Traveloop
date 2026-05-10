-- Traveloop / Safarnama seed data entrypoint.
-- Safe to run repeatedly after the backend migrations.
-- Seeds only public catalog data: cities and seed activities.

with seed_cities(name, region, country, country_code, lat, lng, timezone, image_url) as (
  values
    ('Mumbai', 'Maharashtra', 'India', 'IN', 19.076000, 72.877700, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=900&q=80'),
    ('Delhi', 'Delhi', 'India', 'IN', 28.613900, 77.209000, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80'),
    ('Jaipur', 'Rajasthan', 'India', 'IN', 26.912400, 75.787300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=900&q=80'),
    ('Goa', 'Goa', 'India', 'IN', 15.299300, 74.124000, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80'),
    ('Kochi', 'Kerala', 'India', 'IN', 9.931200, 76.267300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=900&q=80'),
    ('Udaipur', 'Rajasthan', 'India', 'IN', 24.585400, 73.712500, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=900&q=80'),
    ('Varanasi', 'Uttar Pradesh', 'India', 'IN', 25.317600, 82.973900, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=900&q=80'),
    ('Bengaluru', 'Karnataka', 'India', 'IN', 12.971600, 77.594600, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=80'),
    ('Guwahati', 'Assam', 'India', 'IN', 26.144500, 91.736200, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1626015365107-338ee48b8022?auto=format&fit=crop&w=900&q=80'),
    ('Hampi', 'Karnataka', 'India', 'IN', 15.335000, 76.462000, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=80'),
    ('Hyderabad', 'Telangana', 'India', 'IN', 17.385000, 78.486700, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1626516011853-9e82d693f0d9?auto=format&fit=crop&w=900&q=80'),
    ('Agra', 'Uttar Pradesh', 'India', 'IN', 27.176700, 78.008000, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80'),
    ('Kolkata', 'West Bengal', 'India', 'IN', 22.572600, 88.363900, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=900&q=80'),
    ('Chennai', 'Tamil Nadu', 'India', 'IN', 13.082700, 80.270700, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80'),
    ('Rishikesh', 'Uttarakhand', 'India', 'IN', 30.086900, 78.267800, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80'),
    ('Amritsar', 'Punjab', 'India', 'IN', 31.634000, 74.872300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?auto=format&fit=crop&w=900&q=80')
)
insert into public.cities (name, region, country, country_code, lat, lng, timezone, image_url)
select s.name, s.region, s.country, s.country_code, s.lat, s.lng, s.timezone, s.image_url
from seed_cities s
where not exists (
  select 1
  from public.cities c
  where lower(c.name) = lower(s.name)
    and coalesce(lower(c.region), '') = coalesce(lower(s.region), '')
    and lower(c.country) = lower(s.country)
);

-- Update image_url for existing cities that have null images
update public.cities c
set image_url = s.image_url
from seed_cities s
where lower(c.name) = lower(s.name)
  and coalesce(lower(c.region), '') = coalesce(lower(s.region), '')
  and lower(c.country) = lower(s.country)
  and c.image_url is null;

with seed_activities(
  city_name,
  city_region,
  city_country,
  name,
  category,
  description,
  duration_minutes,
  estimated_cost,
  currency,
  rating,
  location,
  tags
) as (
  values
    ('Mumbai', 'Maharashtra', 'India', 'Gateway of India Visit', 'sightseeing', 'Classic Mumbai landmark near Colaba and the waterfront.', 90, 0.00, 'INR', 4.50, '{"area":"Colaba"}'::jsonb, array['landmark','history','photo']),
    ('Mumbai', 'Maharashtra', 'India', 'Marine Drive Sunset Walk', 'outdoors', 'Evening walk along the Queen''s Necklace promenade.', 75, 0.00, 'INR', 4.60, '{"area":"Marine Drive"}'::jsonb, array['sunset','walk','waterfront']),
    ('Delhi', 'Delhi', 'India', 'Red Fort Heritage Tour', 'history', 'Walk through the Mughal-era fort complex in Old Delhi.', 120, 50.00, 'INR', 4.40, '{"area":"Old Delhi"}'::jsonb, array['fort','heritage','unesco']),
    ('Delhi', 'Delhi', 'India', 'India Gate Evening Stop', 'sightseeing', 'Short evening stop at the central Delhi memorial lawns.', 45, 0.00, 'INR', 4.30, '{"area":"Kartavya Path"}'::jsonb, array['memorial','evening','photo']),
    ('Jaipur', 'Rajasthan', 'India', 'Amber Fort Morning Visit', 'history', 'Hilltop fort visit with palace courtyards and city views.', 150, 100.00, 'INR', 4.70, '{"area":"Amer"}'::jsonb, array['fort','palace','heritage']),
    ('Jaipur', 'Rajasthan', 'India', 'Hawa Mahal Photo Stop', 'sightseeing', 'Quick stop at Jaipur''s iconic pink sandstone facade.', 45, 50.00, 'INR', 4.40, '{"area":"Badi Choupad"}'::jsonb, array['architecture','photo','old-city']),
    ('Goa', 'Goa', 'India', 'Fontainhas Heritage Walk', 'culture', 'Colorful Latin Quarter walk through Panaji lanes.', 90, 500.00, 'INR', 4.50, '{"area":"Panaji"}'::jsonb, array['walk','culture','architecture']),
    ('Goa', 'Goa', 'India', 'Baga Beach Evening', 'outdoors', 'Beach time with food shacks and sunset atmosphere.', 120, 0.00, 'INR', 4.20, '{"area":"Baga"}'::jsonb, array['beach','sunset','food']),
    ('Kochi', 'Kerala', 'India', 'Fort Kochi Art Walk', 'culture', 'Walk through galleries, cafes, murals, and colonial-era streets.', 120, 0.00, 'INR', 4.50, '{"area":"Fort Kochi"}'::jsonb, array['art','walk','cafes']),
    ('Kochi', 'Kerala', 'India', 'Chinese Fishing Nets Visit', 'sightseeing', 'Waterfront visit to Kochi''s historic fishing nets.', 45, 0.00, 'INR', 4.10, '{"area":"Fort Kochi Beach"}'::jsonb, array['waterfront','history','photo']),
    ('Udaipur', 'Rajasthan', 'India', 'Lake Pichola Boat Ride', 'outdoors', 'Scenic boat ride with palace and old-city views.', 60, 700.00, 'INR', 4.70, '{"area":"Lake Pichola"}'::jsonb, array['lake','boat','sunset']),
    ('Varanasi', 'Uttar Pradesh', 'India', 'Ganga Aarti at Dashashwamedh Ghat', 'culture', 'Evening river ceremony on the ghats.', 90, 0.00, 'INR', 4.80, '{"area":"Dashashwamedh Ghat"}'::jsonb, array['spiritual','evening','river']),
    ('Bengaluru', 'Karnataka', 'India', 'Cubbon Park Morning Walk', 'outdoors', 'Calm green walk in central Bengaluru.', 60, 0.00, 'INR', 4.30, '{"area":"Cubbon Park"}'::jsonb, array['park','walk','morning'])
)
insert into public.activities (
  city_id,
  name,
  category,
  description,
  duration_minutes,
  estimated_cost,
  currency,
  rating,
  location,
  tags,
  source,
  is_seed
)
select
  c.id,
  s.name,
  s.category,
  s.description,
  s.duration_minutes,
  s.estimated_cost,
  s.currency,
  s.rating,
  s.location,
  s.tags,
  'seed',
  true
from seed_activities s
join public.cities c
  on lower(c.name) = lower(s.city_name)
  and coalesce(lower(c.region), '') = coalesce(lower(s.city_region), '')
  and lower(c.country) = lower(s.city_country)
where not exists (
  select 1
  from public.activities a
  where a.city_id = c.id
    and lower(a.name) = lower(s.name)
    and lower(a.source) = 'seed'
    and a.is_seed = true
);

insert into public.seed_runs (seed_name, checksum, metadata)
values (
  'traveloop_initial_city_activity_seed',
  '20260510_v1',
  jsonb_build_object(
    'cities', 8,
    'activities', 13,
    'scope', 'public catalog'
  )
)
on conflict (seed_name) do update
set checksum = excluded.checksum,
    applied_at = timezone('utc'::text, now()),
    metadata = excluded.metadata;
