-- =====================================================
-- JALANKAN SQL INI DI SUPABASE SQL EDITOR
-- =====================================================
-- 1. Buka https://supabase.com dan login
-- 2. Pilih project Anda
-- 3. Klik "SQL Editor" di menu kiri
-- 4. Klik "New query"
-- 5. Copy paste semua SQL dibawah ini
-- 6. Klik tombol "Run" atau tekan Ctrl+Enter
-- =====================================================

-- Create function untuk auto-update timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (jika ada)
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own non-default categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own non-default categories" ON public.categories;

-- Create RLS Policies
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

-- Create trigger
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- SELESAI!
-- =====================================================
-- Setelah SQL ini berhasil dijalankan:
-- 1. Klik "Table Editor" di menu kiri
-- 2. Pastikan tabel "categories" sudah muncul
-- 3. Refresh halaman aplikasi Anda
-- =====================================================
