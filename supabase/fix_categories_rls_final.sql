-- =====================================================
-- FINAL FIX: Force drop and recreate categories RLS
-- =====================================================

-- Step 1: Disable RLS temporarily to see current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'categories';

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own non-default categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own non-default categories" ON public.categories;
DROP POLICY IF EXISTS "categories_select_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_update_policy" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON public.categories;

-- Step 3: Disable RLS temporarily
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Step 5: Create new simple policy that allows ALL SELECT
CREATE POLICY "allow_all_select" ON public.categories
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);

-- Step 6: Create policy for authenticated users to manage their own
CREATE POLICY "allow_authenticated_insert" ON public.categories
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_authenticated_update" ON public.categories
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_authenticated_delete" ON public.categories
    AS PERMISSIVE
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Step 7: Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY cmd;
