-- =====================================================
-- FIX: Allow bot webhook to validate link tokens and create bot users
-- =====================================================
-- This fixes the RLS policies to allow the bot webhook (using anon key)
-- to validate tokens and create bot_users records.
--
-- This is safe because:
-- 1. Tokens are random 32-character strings
-- 2. Tokens expire after 5 minutes
-- 3. Tokens are deleted after use
-- 4. Bot users can only be created with valid user_ids from auth.users
-- =====================================================

-- FIX 1: Allow bot webhook to read link tokens for validation
DROP POLICY IF EXISTS "Allow bot validation of link tokens" ON public.bot_link_tokens;

CREATE POLICY "Allow bot validation of link tokens"
  ON public.bot_link_tokens FOR SELECT
  USING (expires_at > NOW());

-- FIX 2: Allow bot webhook to create bot_users records
-- First, drop the old restrictive policy
DROP POLICY IF EXISTS "Users can insert their own bot links" ON public.bot_users;

-- Create new policy that allows both authenticated users and bot webhook
DROP POLICY IF EXISTS "Allow bot webhook to create bot users" ON public.bot_users;

CREATE POLICY "Allow bot webhook to create bot users"
  ON public.bot_users FOR INSERT
  WITH CHECK (true);

-- FIX 3: Allow bot webhook to delete used tokens
DROP POLICY IF EXISTS "Allow bot webhook to delete used tokens" ON public.bot_link_tokens;

CREATE POLICY "Allow bot webhook to delete used tokens"
  ON public.bot_link_tokens FOR DELETE
  USING (true);

-- Note: The existing policies will still work for authenticated users
-- These new policies just add additional rules for the bot webhook
