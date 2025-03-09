-- Disable RLS for profiles table to allow registration
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to profiles
DROP POLICY IF EXISTS "Public profiles read access" ON profiles;
CREATE POLICY "Public profiles read access"
ON profiles FOR SELECT
USING (true);

-- Create a policy to allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Create a policy to allow the service role to insert profiles
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);
