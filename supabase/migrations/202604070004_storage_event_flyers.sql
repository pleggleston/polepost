-- PolePost MVP Phase 1 storage foundation: flyer uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-flyers',
  'event-flyers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "event_flyers_public_read"
on storage.objects
for select
using (bucket_id = 'event-flyers');

create policy "event_flyers_insert_own_folder_or_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'event-flyers'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = auth.uid()::text
  )
);

create policy "event_flyers_update_own_folder_or_admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'event-flyers'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = auth.uid()::text
  )
)
with check (
  bucket_id = 'event-flyers'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = auth.uid()::text
  )
);

create policy "event_flyers_delete_own_folder_or_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'event-flyers'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = auth.uid()::text
  )
);
