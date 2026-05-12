-- Fix policies for transactions table

-- 1. Ensure RLS is enabled
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Users can read transactions from their own household
DROP POLICY IF EXISTS "Users can read household transactions" ON transactions;
CREATE POLICY "Users can read household transactions" ON transactions
    FOR SELECT USING (
        household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
    );

-- 3. Policy: Users can insert their own transactions into their household
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
    );

-- 4. Policy: Admins can update/delete any transaction in their household
DROP POLICY IF EXISTS "Admins can manage household transactions" ON transactions;
CREATE POLICY "Admins can manage household transactions" ON transactions
    FOR ALL USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        AND household_id = (SELECT household_id FROM profiles WHERE id = auth.uid())
    );
