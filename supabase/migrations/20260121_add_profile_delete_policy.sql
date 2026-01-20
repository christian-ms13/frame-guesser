create policy "Users can delete their own profile."
  on public.profiles
  for delete
  using (auth.uid() = id);
