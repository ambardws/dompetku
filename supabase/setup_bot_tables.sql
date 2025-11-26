-- =====================================================
-- BOT TABLES SETUP FOR TELEGRAM/WHATSAPP INTEGRATION
-- Run this in Supabase SQL Editor after setup_database.sql
-- =====================================================

-- Create bot_users table
-- This table links bot platform accounts (Telegram/WhatsApp) to Dompetku users
CREATE TABLE IF NOT EXISTS public.bot_users (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('telegram', 'whatsapp')),
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one platform user can only be linked to one Dompetku user
  UNIQUE(platform, platform_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bot_users_user_id ON public.bot_users(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_platform_user ON public.bot_users(platform, platform_user_id);

-- Enable RLS
ALTER TABLE public.bot_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own bot links" ON public.bot_users;
DROP POLICY IF EXISTS "Users can insert their own bot links" ON public.bot_users;
DROP POLICY IF EXISTS "Users can update their own bot links" ON public.bot_users;
DROP POLICY IF EXISTS "Users can delete their own bot links" ON public.bot_users;

-- RLS Policies
CREATE POLICY "Users can view their own bot links"
  ON public.bot_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bot links"
  ON public.bot_users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot links"
  ON public.bot_users FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot links"
  ON public.bot_users FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger
DROP TRIGGER IF EXISTS update_bot_users_updated_at_trigger ON public.bot_users;
CREATE TRIGGER update_bot_users_updated_at_trigger
  BEFORE UPDATE ON public.bot_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- BOT LINK TOKENS TABLE
-- =====================================================

-- Create bot_link_tokens table for secure account linking
CREATE TABLE IF NOT EXISTS public.bot_link_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bot_link_tokens_user_id ON public.bot_link_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_link_tokens_expires_at ON public.bot_link_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.bot_link_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own link tokens" ON public.bot_link_tokens;
DROP POLICY IF EXISTS "Users can insert their own link tokens" ON public.bot_link_tokens;
DROP POLICY IF EXISTS "Users can delete their own link tokens" ON public.bot_link_tokens;

-- RLS Policies
CREATE POLICY "Users can view their own link tokens"
  ON public.bot_link_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own link tokens"
  ON public.bot_link_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own link tokens"
  ON public.bot_link_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Function to clean up expired tokens (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_bot_link_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.bot_link_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SELESAI!
-- =====================================================
-- Setelah SQL ini berhasil dijalankan:
-- 1. Tabel bot_users dan bot_link_tokens sudah siap
-- 2. Lanjut install dependencies untuk bot
-- =====================================================
