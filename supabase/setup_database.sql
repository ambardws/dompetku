-- =====================================================
-- COMPLETE DATABASE SETUP FOR DOMPETKU
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. CREATE TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  category TEXT,
  category_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON public.transactions(type);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON public.transactions(category_id);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

-- Create RLS policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.transactions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 3. CREATE CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id_type ON public.categories(user_id, type);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own non-default categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own non-default categories" ON public.categories;

-- RLS Policies for categories
CREATE POLICY "Users can view own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own non-default categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete own non-default categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- Auto-update trigger for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add foreign key constraint to transactions
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_category_id_fkey;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES public.categories(id)
  ON DELETE SET NULL;

-- Add comments
COMMENT ON TABLE public.categories IS 'Transaction categories for organizing expenses and income';
COMMENT ON TABLE public.transactions IS 'User financial transactions';
