-- Create a storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);

-- Allow authenticated users to upload videos
CREATE POLICY "Allow authenticated users to upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own videos
CREATE POLICY "Allow users to read their own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own videos
CREATE POLICY "Allow users to delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
); 