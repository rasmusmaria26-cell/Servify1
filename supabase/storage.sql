-- Create a new storage bucket for issue images
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-images', 'issue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files to 'issue-images'
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'issue-images' AND auth.role() = 'authenticated' );

-- Policy: Allow public to view images (so admins/vendors can see them)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'issue-images' );

-- Policy: Allow users to delete their own images (optional, good for cleanup)
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'issue-images' AND owner = auth.uid() );
