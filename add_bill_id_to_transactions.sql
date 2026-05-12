-- Add bill_id to transactions to link splits to their parent bill
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bill_id UUID REFERENCES bills(id) ON DELETE CASCADE;

-- Also add an index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_bill_id ON transactions(bill_id);
