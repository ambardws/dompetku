-- =====================================================
-- STEP 1: Check current policies (run this first to see what exists)
-- =====================================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('bot_users', 'bot_link_tokens')
ORDER BY tablename, cmd;

-- =====================================================
-- STEP 2: Reset all policies (run this after checking)
-- =====================================================

-- Drop ALL policies on bot_users
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bot_users') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.bot_users';
    END LOOP;
END $$;

-- Drop ALL policies on bot_link_tokens
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bot_link_tokens') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.bot_link_tokens';
    END LOOP;
END $$;

-- =====================================================
-- STEP 3: Create new permissive policies
-- =====================================================

-- Bot Users Policies - Allow bot webhook to manage records
CREATE POLICY "bot_users_select_policy" ON public.bot_users
    FOR SELECT
    USING (true);

CREATE POLICY "bot_users_insert_policy" ON public.bot_users
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "bot_users_update_policy" ON public.bot_users
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "bot_users_delete_policy" ON public.bot_users
    FOR DELETE
    USING (true);

-- Bot Link Tokens Policies - Allow bot webhook to manage tokens
CREATE POLICY "bot_link_tokens_select_policy" ON public.bot_link_tokens
    FOR SELECT
    USING (expires_at > NOW());

CREATE POLICY "bot_link_tokens_insert_policy" ON public.bot_link_tokens
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "bot_link_tokens_delete_policy" ON public.bot_link_tokens
    FOR DELETE
    USING (true);

-- =====================================================
-- STEP 4: Fix categories and transactions tables for bot access
-- =====================================================

-- Drop ALL policies on categories
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'categories') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.categories';
    END LOOP;
END $$;

-- Create new policies for categories (allow bot webhook to read)
CREATE POLICY "categories_select_policy" ON public.categories
    FOR SELECT
    USING (true);

CREATE POLICY "categories_insert_policy" ON public.categories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_policy" ON public.categories
    FOR UPDATE
    USING (auth.uid() = user_id AND is_default = false)
    WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "categories_delete_policy" ON public.categories
    FOR DELETE
    USING (auth.uid() = user_id AND is_default = false);

-- Drop ALL policies on transactions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'transactions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.transactions';
    END LOOP;
END $$;

-- Create new policies for transactions (allow bot webhook to insert)
CREATE POLICY "transactions_select_policy" ON public.transactions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_policy" ON public.transactions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "transactions_update_policy" ON public.transactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_delete_policy" ON public.transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- DONE! All policies have been reset
-- =====================================================
