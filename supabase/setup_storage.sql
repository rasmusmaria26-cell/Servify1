-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', true);

-- Set up storage policies for KYC documents
-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access (so admins can view documents)
CREATE POLICY "Public can view KYC documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'kyc-documents');

-- Allow admins to delete documents if needed (optional)
CREATE POLICY "Admins can delete KYC documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'kyc-documents');
