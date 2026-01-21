INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  );

CREATE POLICY "Users can delete their avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
  );
