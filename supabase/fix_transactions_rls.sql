-- =====================================================
-- FIX: Allow bot webhook to insert transactions
-- =====================================================

-- Drop ALL existing policies on transactions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'transactions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.transactions';
    END LOOP;
END $$;

-- Disable and re-enable RLS
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create new policies that allow bot webhook
CREATE POLICY "transactions_select_policy" ON public.transactions
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_policy" ON public.transactions
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "transactions_update_policy" ON public.transactions
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_delete_policy" ON public.transactions
    AS PERMISSIVE
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Verify policies
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'transactions';
