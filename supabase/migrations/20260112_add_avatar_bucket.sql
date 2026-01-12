insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public read access for avatars"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy "Users can upload their avatar"
  on storage.objects
  for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their avatar"
  on storage.objects
  for update
  using (
    bucket_id = 'avatars'
    and owner = auth.uid()
  )
  with check (
    bucket_id = 'avatars'
    and owner = auth.uid()
  );

create policy "Users can delete their avatar"
  on storage.objects
  for delete
  using (
    bucket_id = 'avatars'
    and owner = auth.uid()
  );
