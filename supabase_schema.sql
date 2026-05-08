-- SQL Schema for "Organiza Casa" (Household Management System)

-- Create Households table
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Profiles table
CREATE TYPE user_role AS ENUM ('admin', 'member');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    whatsapp_number TEXT UNIQUE,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    role user_role DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Bills table
CREATE TYPE bill_type AS ENUM ('fixed', 'variable');

CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    type bill_type DEFAULT 'fixed',
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Participants table (linking bills to users)
CREATE TABLE participants (
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (bill_id, user_id)
);

-- Create Transactions table (Current Balance Model)
-- Positive values = Credit (payment from user to house)
-- Negative values = Debit (share of a bill assigned to user)
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'rejected');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    proof_url TEXT,
    status transaction_status DEFAULT 'confirmed', -- Debits are confirmed by default, credits (payments) might be pending
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Basic Policies (To be refined based on roles)
-- Users can read their own profile
CREATE POLICY "Users can read their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles in their household
CREATE POLICY "Admins can read household profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles AS admin_p
            WHERE admin_p.id = auth.uid()
            AND admin_p.role = 'admin'
            AND admin_p.household_id = profiles.household_id
        )
    );

-- Users can read bills from their household
CREATE POLICY "Users can read household bills" ON bills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.household_id = bills.household_id
        )
    );

-- Transactions visibility
CREATE POLICY "Users can read their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage household transactions" ON transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles AS admin_p
            WHERE admin_p.id = auth.uid()
            AND admin_p.role = 'admin'
            AND admin_p.household_id = transactions.household_id
        )
    );
