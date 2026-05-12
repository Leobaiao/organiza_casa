-- Fix for infinite recursion in profiles policy and missing households policies

-- 1. Drop the recursive policy
DROP POLICY IF EXISTS "Admins can read household profiles" ON profiles;

-- 2. Create helper functions to avoid recursion (Security Definer bypasses RLS)
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_my_household()
RETURNS UUID AS $$
  SELECT household_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 3. Re-create the admin policy using the helper functions
CREATE POLICY "Admins can read household profiles" ON profiles
    FOR SELECT USING (
        get_my_role() = 'admin'
        AND household_id = get_my_household()
    );

-- 4. Add missing policies for households table
DROP POLICY IF EXISTS "Users can read their own household" ON households;
CREATE POLICY "Users can read their own household" ON households
    FOR SELECT USING (
        id = get_my_household()
    );

DROP POLICY IF EXISTS "Admins can update their own household" ON households;
CREATE POLICY "Admins can update their own household" ON households
    FOR UPDATE USING (
        id = get_my_household()
        AND get_my_role() = 'admin'
    );
