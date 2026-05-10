-- Traveloop India market readiness.
-- This migration keeps the existing schema intact, expands India catalog seed data,
-- and scopes city/activity search RPCs to India-only public catalog results.

create index if not exists cities_country_code_name_idx
  on public.cities(country_code, name);

create index if not exists activities_city_category_rating_idx
  on public.activities(city_id, category, rating desc nulls last);

with seed_cities(name, region, country, country_code, lat, lng, timezone, image_url) as (
  values
    ('Agra', 'Uttar Pradesh', 'India', 'IN', 27.176670, 78.008070, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80'),
    ('Ahmedabad', 'Gujarat', 'India', 'IN', 23.022505, 72.571362, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1653489218319-7f99c0c2d6e7?auto=format&fit=crop&w=900&q=80'),
    ('Amritsar', 'Punjab', 'India', 'IN', 31.634000, 74.872300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1609766418204-94aae0ecfdfc?auto=format&fit=crop&w=900&q=80'),
    ('Darjeeling', 'West Bengal', 'India', 'IN', 27.041000, 88.266300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80'),
    ('Gangtok', 'Sikkim', 'India', 'IN', 27.331400, 88.613800, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1622735341889-1c5c0fb54de2?auto=format&fit=crop&w=900&q=80'),
    ('Guwahati', 'Assam', 'India', 'IN', 26.144500, 91.736200, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=900&q=80'),
    ('Hampi', 'Karnataka', 'India', 'IN', 15.335000, 76.460000, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=900&q=80'),
    ('Hyderabad', 'Telangana', 'India', 'IN', 17.385000, 78.486700, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1626516011853-9e82d693f0d9?auto=format&fit=crop&w=900&q=80'),
    ('Jaisalmer', 'Rajasthan', 'India', 'IN', 26.915700, 70.908300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=900&q=80'),
    ('Jodhpur', 'Rajasthan', 'India', 'IN', 26.238900, 73.024300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80'),
    ('Kolkata', 'West Bengal', 'India', 'IN', 22.572600, 88.363900, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=900&q=80'),
    ('Leh', 'Ladakh', 'India', 'IN', 34.152600, 77.577100, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80'),
    ('Lucknow', 'Uttar Pradesh', 'India', 'IN', 26.846700, 80.946200, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1625735162867-2e68a8bb4c3c?auto=format&fit=crop&w=900&q=80'),
    ('Madurai', 'Tamil Nadu', 'India', 'IN', 9.925200, 78.119800, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80'),
    ('Manali', 'Himachal Pradesh', 'India', 'IN', 32.239600, 77.188700, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1585936369609-1b0a54a1d629?auto=format&fit=crop&w=900&q=80'),
    ('Munnar', 'Kerala', 'India', 'IN', 10.088900, 77.059500, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80'),
    ('Mysuru', 'Karnataka', 'India', 'IN', 12.295800, 76.639400, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1600093112174-b1a565a8e9e5?auto=format&fit=crop&w=900&q=80'),
    ('Ooty', 'Tamil Nadu', 'India', 'IN', 11.410200, 76.695000, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1580889010969-1b2b3b6b9b8b?auto=format&fit=crop&w=900&q=80'),
    ('Puducherry', 'Puducherry', 'India', 'IN', 11.941600, 79.808300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=900&q=80'),
    ('Pune', 'Maharashtra', 'India', 'IN', 18.520400, 73.856700, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1567604130959-7e5e5e8e8e8e?auto=format&fit=crop&w=900&q=80'),
    ('Rishikesh', 'Uttarakhand', 'India', 'IN', 30.086900, 78.267600, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=900&q=80'),
    ('Shillong', 'Meghalaya', 'India', 'IN', 25.578800, 91.893300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1598394848012-4a4fb4e4e4e4?auto=format&fit=crop&w=900&q=80'),
    ('Srinagar', 'Jammu and Kashmir', 'India', 'IN', 34.083700, 74.797300, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1566837497312-7be7830ae9b2?auto=format&fit=crop&w=900&q=80'),
    ('Thiruvananthapuram', 'Kerala', 'India', 'IN', 8.524100, 76.936600, 'Asia/Kolkata', 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=900&q=80')
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

-- Patch image_url for any previously seeded cities that still have null
update public.cities c
set image_url = s.image_url
from seed_cities s
where lower(c.name) = lower(s.name)
  and coalesce(lower(c.region), '') = coalesce(lower(s.region), '')
  and lower(c.country) = lower(s.country)
  and (c.image_url is null or c.image_url = '');

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
    ('Agra', 'Uttar Pradesh', 'India', 'Taj Mahal Sunrise Visit', 'heritage', 'Early morning monument visit with lower crowd pressure.', 150, 250.00, 'INR', 4.90, '{"area":"Tajganj"}'::jsonb, array['unesco','sunrise','monument']),
    ('Ahmedabad', 'Gujarat', 'India', 'Old City Pol Heritage Walk', 'culture', 'Guided walk through heritage pol lanes and carved havelis.', 120, 400.00, 'INR', 4.50, '{"area":"Old Ahmedabad"}'::jsonb, array['walk','heritage','architecture']),
    ('Amritsar', 'Punjab', 'India', 'Golden Temple Dawn Visit', 'spiritual', 'Quiet morning visit around Harmandir Sahib and the sarovar.', 120, 0.00, 'INR', 4.90, '{"area":"Golden Temple"}'::jsonb, array['spiritual','morning','heritage']),
    ('Bengaluru', 'Karnataka', 'India', 'Bengaluru Filter Coffee Trail', 'food', 'Local cafes and darshini stops around the city core.', 120, 500.00, 'INR', 4.40, '{"area":"Basavanagudi"}'::jsonb, array['food','coffee','local']),
    ('Darjeeling', 'West Bengal', 'India', 'Tiger Hill Sunrise', 'outdoors', 'Early drive for Kanchenjunga sunrise views.', 180, 600.00, 'INR', 4.60, '{"area":"Tiger Hill"}'::jsonb, array['sunrise','mountains','viewpoint']),
    ('Delhi', 'Delhi', 'India', 'Old Delhi Food Walk', 'food', 'Street food route through Chandni Chowk with heritage stops.', 150, 900.00, 'INR', 4.60, '{"area":"Chandni Chowk"}'::jsonb, array['food','walk','old-city']),
    ('Gangtok', 'Sikkim', 'India', 'Rumtek Monastery Half-Day', 'spiritual', 'Monastery visit with valley views outside Gangtok.', 180, 1200.00, 'INR', 4.50, '{"area":"Rumtek"}'::jsonb, array['monastery','culture','day-trip']),
    ('Goa', 'Goa', 'India', 'Old Goa Church Circuit', 'heritage', 'Visit Basilica of Bom Jesus and nearby Portuguese-era churches.', 150, 0.00, 'INR', 4.40, '{"area":"Old Goa"}'::jsonb, array['churches','heritage','unesco']),
    ('Guwahati', 'Assam', 'India', 'Umananda Island Ferry', 'outdoors', 'Short Brahmaputra ferry ride to the river island temple.', 90, 250.00, 'INR', 4.20, '{"area":"Brahmaputra River"}'::jsonb, array['river','ferry','temple']),
    ('Hampi', 'Karnataka', 'India', 'Vittala Temple Complex', 'heritage', 'Stone chariot and temple ruins across the Hampi landscape.', 150, 40.00, 'INR', 4.80, '{"area":"Vittala Temple"}'::jsonb, array['unesco','ruins','temple']),
    ('Hyderabad', 'Telangana', 'India', 'Charminar and Laad Bazaar Walk', 'culture', 'Old city landmark visit with bangle market lanes.', 120, 200.00, 'INR', 4.40, '{"area":"Charminar"}'::jsonb, array['market','heritage','photo']),
    ('Jaipur', 'Rajasthan', 'India', 'City Palace and Jantar Mantar', 'heritage', 'Central Jaipur palace and observatory circuit.', 150, 500.00, 'INR', 4.50, '{"area":"Pink City"}'::jsonb, array['palace','unesco','architecture']),
    ('Jaisalmer', 'Rajasthan', 'India', 'Sam Sand Dunes Sunset', 'outdoors', 'Desert sunset visit outside Jaisalmer.', 240, 1800.00, 'INR', 4.50, '{"area":"Sam Sand Dunes"}'::jsonb, array['desert','sunset','day-trip']),
    ('Jodhpur', 'Rajasthan', 'India', 'Mehrangarh Fort Visit', 'heritage', 'Fort museum and blue city viewpoints.', 180, 200.00, 'INR', 4.80, '{"area":"Mehrangarh"}'::jsonb, array['fort','museum','viewpoint']),
    ('Kochi', 'Kerala', 'India', 'Kerala Cooking Class', 'food', 'Hands-on local cooking session near Fort Kochi.', 180, 1800.00, 'INR', 4.70, '{"area":"Fort Kochi"}'::jsonb, array['food','class','local']),
    ('Kolkata', 'West Bengal', 'India', 'North Kolkata Heritage Tram Route', 'culture', 'Old neighborhoods, colonial buildings, and tram nostalgia.', 150, 300.00, 'INR', 4.30, '{"area":"North Kolkata"}'::jsonb, array['heritage','tram','walk']),
    ('Leh', 'Ladakh', 'India', 'Shanti Stupa Sunset', 'outdoors', 'High-altitude sunset viewpoint over Leh town.', 90, 0.00, 'INR', 4.70, '{"area":"Shanti Stupa"}'::jsonb, array['sunset','viewpoint','high-altitude']),
    ('Madurai', 'Tamil Nadu', 'India', 'Meenakshi Temple Evening Visit', 'spiritual', 'Temple complex visit during evening rituals.', 120, 0.00, 'INR', 4.80, '{"area":"Meenakshi Amman Temple"}'::jsonb, array['temple','spiritual','heritage']),
    ('Manali', 'Himachal Pradesh', 'India', 'Solang Valley Adventure Slot', 'adventure', 'Seasonal adventure activities and valley views.', 180, 1500.00, 'INR', 4.30, '{"area":"Solang Valley"}'::jsonb, array['adventure','mountains','seasonal']),
    ('Munnar', 'Kerala', 'India', 'Tea Estate Walk', 'outdoors', 'Guided walk through tea gardens and viewpoint stops.', 120, 600.00, 'INR', 4.60, '{"area":"Munnar Tea Gardens"}'::jsonb, array['tea','walk','hills']),
    ('Mumbai', 'Maharashtra', 'India', 'Elephanta Caves Ferry', 'heritage', 'Ferry and cave temple visit from Gateway of India.', 240, 600.00, 'INR', 4.50, '{"area":"Elephanta Island"}'::jsonb, array['unesco','ferry','caves']),
    ('Mysuru', 'Karnataka', 'India', 'Mysore Palace Illumination', 'heritage', 'Evening palace visit when illumination is scheduled.', 90, 100.00, 'INR', 4.70, '{"area":"Mysore Palace"}'::jsonb, array['palace','evening','architecture']),
    ('Ooty', 'Tamil Nadu', 'India', 'Nilgiri Mountain Railway Ride', 'outdoors', 'Heritage train segment through the Nilgiri hills.', 180, 500.00, 'INR', 4.50, '{"area":"Ooty Railway Station"}'::jsonb, array['train','hills','heritage']),
    ('Puducherry', 'Puducherry', 'India', 'White Town Cycling Loop', 'outdoors', 'Slow cycle route through French Quarter streets.', 120, 700.00, 'INR', 4.40, '{"area":"White Town"}'::jsonb, array['cycling','architecture','coastal']),
    ('Pune', 'Maharashtra', 'India', 'Shaniwar Wada Heritage Stop', 'heritage', 'Peshwa-era fortification and old city stop.', 75, 25.00, 'INR', 4.10, '{"area":"Shaniwar Wada"}'::jsonb, array['history','fort','city']),
    ('Rishikesh', 'Uttarakhand', 'India', 'Ganga Rafting Half-Day', 'adventure', 'Seasonal rafting route with certified local operators.', 240, 1600.00, 'INR', 4.60, '{"area":"Shivpuri"}'::jsonb, array['rafting','adventure','river']),
    ('Shillong', 'Meghalaya', 'India', 'Ward Lake and Cafe Trail', 'leisure', 'Compact city loop around lake, markets, and cafes.', 120, 500.00, 'INR', 4.20, '{"area":"Police Bazaar"}'::jsonb, array['lake','cafes','city']),
    ('Srinagar', 'Jammu and Kashmir', 'India', 'Dal Lake Shikara Ride', 'outdoors', 'Classic shikara ride through Dal Lake channels.', 90, 900.00, 'INR', 4.70, '{"area":"Dal Lake"}'::jsonb, array['lake','boat','scenic']),
    ('Thiruvananthapuram', 'Kerala', 'India', 'Kovalam Beach Evening', 'outdoors', 'Evening beach stop near lighthouse and cafes.', 120, 0.00, 'INR', 4.20, '{"area":"Kovalam"}'::jsonb, array['beach','sunset','coastal']),
    ('Udaipur', 'Rajasthan', 'India', 'City Palace Museum', 'heritage', 'Palace museum visit overlooking Lake Pichola.', 150, 400.00, 'INR', 4.60, '{"area":"City Palace"}'::jsonb, array['palace','museum','lake'])
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

create or replace function public.search_cities(
  p_query text,
  p_limit integer default 10
)
returns table (
  id uuid,
  name text,
  region text,
  country text,
  country_code text,
  lat numeric,
  lng numeric,
  timezone text,
  image_url text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.id,
    c.name,
    c.region,
    c.country,
    c.country_code,
    c.lat,
    c.lng,
    c.timezone,
    c.image_url
  from public.cities c
  where c.country_code = 'IN'
    and (
      coalesce(btrim(p_query), '') = ''
      or c.search_text ilike '%' || lower(btrim(p_query)) || '%'
    )
  order by
    case when lower(c.name) = lower(btrim(coalesce(p_query, ''))) then 0 else 1 end,
    similarity(c.search_text, lower(btrim(coalesce(p_query, '')))) desc,
    c.region,
    c.name
  limit least(greatest(coalesce(p_limit, 10), 1), 50);
$$;

create or replace function public.search_activities(
  p_city_id uuid default null,
  p_query text default null,
  p_category text default null,
  p_limit integer default 20
)
returns table (
  id uuid,
  city_id uuid,
  city_name text,
  name text,
  category text,
  description text,
  duration_minutes integer,
  estimated_cost numeric,
  currency text,
  rating numeric,
  location jsonb,
  tags text[],
  source text,
  is_seed boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    a.id,
    a.city_id,
    c.name as city_name,
    a.name,
    a.category,
    a.description,
    a.duration_minutes,
    a.estimated_cost,
    a.currency,
    a.rating,
    a.location,
    a.tags,
    a.source,
    a.is_seed
  from public.activities a
  join public.cities c on c.id = a.city_id
  where c.country_code = 'IN'
    and (p_city_id is null or a.city_id = p_city_id)
    and (coalesce(btrim(p_category), '') = '' or a.category = p_category)
    and (
      coalesce(btrim(p_query), '') = ''
      or a.search_text ilike '%' || lower(btrim(p_query)) || '%'
    )
  order by
    case when lower(a.name) = lower(btrim(coalesce(p_query, ''))) then 0 else 1 end,
    a.is_seed desc,
    similarity(a.search_text, lower(btrim(coalesce(p_query, '')))) desc,
    a.rating desc nulls last,
    a.name
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

comment on function public.search_cities(text, integer) is
  'India-only city search for Traveloop catalog surfaces.';
comment on function public.search_activities(uuid, text, text, integer) is
  'India-only activity search for Traveloop catalog surfaces.';

revoke execute on function public.search_cities(text, integer) from public;
revoke execute on function public.search_activities(uuid, text, text, integer) from public;
grant execute on function public.search_cities(text, integer) to anon, authenticated;
grant execute on function public.search_activities(uuid, text, text, integer) to anon, authenticated;

insert into public.seed_runs (seed_name, checksum, metadata)
values (
  'traveloop_india_market_catalog_seed',
  '20260510_v1',
  jsonb_build_object(
    'country_scope', 'IN',
    'cities_added', 24,
    'activities_added', 30,
    'currency', 'INR'
  )
)
on conflict (seed_name) do update
set checksum = excluded.checksum,
    applied_at = timezone('utc'::text, now()),
    metadata = excluded.metadata;
