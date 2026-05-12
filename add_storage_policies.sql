-- 1. Ensure the bucket exists (just in case)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to read receipts
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');

-- 3. Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload receipts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'receipts');

-- 4. Allow users to update/delete their own receipts
CREATE POLICY "Users can update their own receipts" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their own receipts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);
