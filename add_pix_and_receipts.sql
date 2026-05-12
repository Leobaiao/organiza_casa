-- Add pix_key to households
ALTER TABLE households ADD COLUMN IF NOT EXISTS pix_key TEXT;

-- Add receipt_url to transactions to store the proof of payment
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Create a storage bucket for receipts if not exists (via SQL is harder, but we'll assume it's created via UI or we'll use a public URL)
