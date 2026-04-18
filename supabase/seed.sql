-- Development seed: sample organizer + 20 approved public events with placeholder flyers.
-- Safe to re-run; all inserts use ON CONFLICT DO NOTHING.
-- Flyer images are served from picsum.photos (portrait 600×800) for realistic sizing tests.

-- ── Seed auth user ─────────────────────────────────────────────────────────────
insert into auth.users (
  id, instance_id, aud, role,
  email, encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'seed@dev.polepost',
  crypt('seed-dev-only', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Sample Organizer"}',
  false, '', '', '', ''
) on conflict (id) do nothing;

-- ── Seed profile ───────────────────────────────────────────────────────────────
insert into public.profiles (id, display_name, role, is_organizer_enabled)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Sample Organizer',
  'organizer',
  true
) on conflict (id) do nothing;

-- ── Seed organizer ─────────────────────────────────────────────────────────────
insert into public.organizers (id, owner_profile_id, name, slug, contact_email, instagram_url, is_active)
values (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Polepost Events',
  'polepost-events',
  'hello@polepost.dev',
  'https://instagram.com/polepost',
  true
) on conflict (id) do nothing;

-- ── 20 sample events ───────────────────────────────────────────────────────────
-- 16 with placeholder flyers, 4 with null flyer_url to test "Flyer coming soon"
-- age_requirement varies: mix of all_ages, age_18_plus, age_21_plus
insert into public.events (
  id,
  organizer_id,
  created_by_profile_id,
  title,
  slug,
  description,
  flyer_url,
  flyer_path,
  venue_name,
  city,
  state,
  starts_at,
  ends_at,
  timezone,
  category_id,
  age_requirement,
  visibility,
  lifecycle_status,
  moderation_status,
  approved_at,
  approved_by_profile_id
)
select
  e.eid::uuid,
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  e.title,
  e.slug,
  e.description,
  case when e.flyer_seed is not null
    then 'https://picsum.photos/seed/' || e.flyer_seed || '/600/800'
    else null
  end,
  'seed/' || e.slug || '.jpg',
  e.venue_name,
  e.city,
  e.state,
  now() + (e.days_ahead * 24 + e.hour_start) * interval '1 hour',
  now() + (e.days_ahead * 24 + e.hour_start + 4) * interval '1 hour',
  e.tz,
  (select id from public.event_categories where slug = e.cat limit 1),
  e.age_req::age_requirement,
  'public',
  'approved',
  'approved',
  now(),
  'a0000000-0000-0000-0000-000000000001'
from (values
  -- (id, title, slug, description, flyer_seed, venue_name, city, state, tz, cat, age_req, days_ahead, hour_start)
  ('c0000000-0000-0000-0000-000000000001',
   'Midnight Rhythms',
   'midnight-rhythms',
   'An all-night music experience with live DJs, immersive lighting, and back-to-back sets from LA''s best underground acts.',
   'mrp01',
   'The Palladium', 'Los Angeles', 'CA', 'America/Los_Angeles', 'music', 'all_ages', 3, 22),

  ('c0000000-0000-0000-0000-000000000002',
   'Neon Nights',
   'neon-nights',
   'UV glow party with art installations, themed cocktails, and three dance floors spanning house, techno, and hip-hop.',
   'nnp02',
   'Club Space', 'Miami', 'FL', 'America/New_York', 'nightlife', 'age_21_plus', 5, 23),

  ('c0000000-0000-0000-0000-000000000003',
   'Urban Canvas Festival',
   'urban-canvas-festival',
   'A two-day celebration of street art, live mural painting, and gallery showcases from emerging and established artists.',
   'ucf03',
   'The Knockdown Center', 'Brooklyn', 'NY', 'America/New_York', 'arts', 'all_ages', 7, 18),

  ('c0000000-0000-0000-0000-000000000004',
   'Community Block Party',
   'community-block-party',
   'Free neighborhood gathering with food trucks, lawn games, live music, and activities for all ages.',
   null,
   'Cesar Chavez Park', 'Austin', 'TX', 'America/Chicago', 'community', 'all_ages', 4, 14),

  ('c0000000-0000-0000-0000-000000000005',
   'Street Food Carnival',
   'street-food-carnival',
   'Over 40 vendors serving cuisines from around the world, plus craft beer gardens and live cooking demonstrations.',
   'sfc05',
   'Millennium Park', 'Chicago', 'IL', 'America/Chicago', 'food', 'all_ages', 10, 12),

  ('c0000000-0000-0000-0000-000000000006',
   'City Slam Championship',
   'city-slam-championship',
   'Competitive urban volleyball tournament with open and elite divisions. Sign up as a team or join a pickup bracket.',
   'csc06',
   'Piedmont Park', 'Atlanta', 'GA', 'America/New_York', 'sports', 'all_ages', 6, 9),

  ('c0000000-0000-0000-0000-000000000007',
   'Sunday Makers Market',
   'sunday-makers-market',
   'Curated weekend market featuring handmade goods, vintage finds, ceramics, and local produce.',
   null,
   'Pioneer Courthouse Square', 'Portland', 'OR', 'America/Los_Angeles', 'markets', 'all_ages', 2, 10),

  ('c0000000-0000-0000-0000-000000000008',
   'Bass Drop Festival',
   'bass-drop-festival',
   'Three stages of electronic music across six hours, featuring headline acts and up-and-coming producers from the Bay.',
   'bdf08',
   'The Warfield', 'San Francisco', 'CA', 'America/Los_Angeles', 'music', 'age_18_plus', 14, 20),

  ('c0000000-0000-0000-0000-000000000009',
   'Club Verve Opening Night',
   'club-verve-opening-night',
   'Grand opening of the Strip''s newest ultra-lounge. Complimentary champagne for the first 100 guests. Dress to impress.',
   'cvo09',
   'Omnia Nightclub', 'Las Vegas', 'NV', 'America/Los_Angeles', 'nightlife', 'age_21_plus', 8, 22),

  ('c0000000-0000-0000-0000-000000000010',
   'Gallery After Dark',
   'gallery-after-dark',
   'Night tour of Pioneer Square galleries with artist talks, wine, and access to exclusive after-hours collections.',
   'gad10',
   'Pioneer Square Gallery District', 'Seattle', 'WA', 'America/Los_Angeles', 'arts', 'age_21_plus', 11, 19),

  ('c0000000-0000-0000-0000-000000000011',
   'Eastern Market Fiesta',
   'eastern-market-fiesta',
   'Community celebration at Eastern Market with live music, local artisans, and a neighborhood cookout.',
   null,
   'Eastern Market', 'Detroit', 'MI', 'America/Detroit', 'community', 'all_ages', 9, 11),

  ('c0000000-0000-0000-0000-000000000012',
   'Taco & Tequila Fest',
   'taco-tequila-fest',
   'Dallas''s biggest food festival returns with 30+ taco vendors, premium tequila tastings, and live Tejano and reggaeton.',
   'ttf12',
   'Deep Ellum Outdoor Stage', 'Dallas', 'TX', 'America/Chicago', 'food', 'age_21_plus', 12, 15),

  ('c0000000-0000-0000-0000-000000000013',
   'Beach Volleyball Open',
   'beach-volleyball-open',
   'Open-bracket sand volleyball tournament on Mission Beach. All skill levels welcome. Prizes for top three teams.',
   'bvo13',
   'Mission Beach Courts', 'San Diego', 'CA', 'America/Los_Angeles', 'sports', 'all_ages', 15, 9),

  ('c0000000-0000-0000-0000-000000000014',
   'Artisan Craft Fair',
   'artisan-craft-fair',
   'Juried craft fair showcasing ceramics, textiles, jewelry, and woodworking from over 60 regional makers.',
   'acf14',
   'Union Station Great Hall', 'Denver', 'CO', 'America/Denver', 'markets', 'all_ages', 16, 10),

  ('c0000000-0000-0000-0000-000000000015',
   'Electric Rave',
   'electric-rave',
   'A midnight-to-dawn rave in an industrial warehouse with four rooms of electronic music, lasers, and immersive visuals.',
   'erp15',
   'Warehouse 215', 'Phoenix', 'AZ', 'America/Phoenix', 'music', 'age_18_plus', 18, 22),

  ('c0000000-0000-0000-0000-000000000016',
   'Rooftop Cocktail Night',
   'rooftop-cocktail-night',
   'Elevated evening on a downtown rooftop with craft cocktails, small plates, and a live jazz trio.',
   'rcn16',
   'The Rooftop at Canopy', 'Houston', 'TX', 'America/Chicago', 'nightlife', 'age_21_plus', 20, 20),

  ('c0000000-0000-0000-0000-000000000017',
   'Photography Exhibition',
   'photography-exhibition',
   'Solo show featuring large-format documentary photographs exploring movement, identity, and the urban landscape.',
   'pex17',
   'Zeitgeist Gallery', 'Nashville', 'TN', 'America/Chicago', 'arts', 'all_ages', 21, 18),

  ('c0000000-0000-0000-0000-000000000018',
   'Park Cleanup & Cookout',
   'park-cleanup-cookout',
   'Volunteer morning cleanup followed by a community BBQ. Gloves and bags provided. Bring a side dish to share!',
   null,
   'Freedom Park', 'Charlotte', 'NC', 'America/New_York', 'community', 'all_ages', 13, 9),

  ('c0000000-0000-0000-0000-000000000019',
   'Ramen Bowl Festival',
   'ramen-bowl-festival',
   'Twelve acclaimed ramen shops compete for the People''s Choice Award. Includes craft beer pairings and sake flights.',
   'rbf19',
   'Grand Park', 'Los Angeles', 'CA', 'America/Los_Angeles', 'food', 'all_ages', 25, 11),

  ('c0000000-0000-0000-0000-000000000020',
   'Sunrise Yoga Flow',
   'sunrise-yoga-flow',
   'Free community yoga class at sunrise in Central Park. All levels welcome. Bring your own mat.',
   'syf20',
   'Central Park Great Lawn', 'New York', 'NY', 'America/New_York', 'sports', 'all_ages', 17, 7)

) as e(eid, title, slug, description, flyer_seed, venue_name, city, state, tz, cat, age_req, days_ahead, hour_start)
on conflict (id) do nothing;
