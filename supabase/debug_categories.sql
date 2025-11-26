-- =====================================================
-- DEBUG: Check categories and RLS policies
-- =====================================================

-- 1. Check if there are any categories in the database
SELECT id, user_id, name, type
FROM public.categories
LIMIT 10;

-- 2. Check current RLS policies on categories table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY cmd;

-- 3. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'categories';

-- =====================================================
-- If categories table is empty, insert some default categories
-- =====================================================
-- Note: You'll need to replace 'YOUR_USER_ID' with your actual user_id from auth.users
-- To get your user_id, run: SELECT id, email FROM auth.users;
