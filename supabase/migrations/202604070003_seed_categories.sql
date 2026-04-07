insert into public.event_categories (slug, label, sort_order)
values
  ('music', 'Music', 10),
  ('nightlife', 'Nightlife', 20),
  ('arts', 'Arts', 30),
  ('community', 'Community', 40),
  ('food', 'Food', 50),
  ('sports', 'Sports', 60),
  ('markets', 'Markets', 70)
on conflict (slug) do update
set
  label = excluded.label,
  sort_order = excluded.sort_order,
  is_active = true;
