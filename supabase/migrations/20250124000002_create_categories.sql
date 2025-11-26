-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
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
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_user_id_type ON categories(user_id, type);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
-- Users can only see their own categories
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own categories (except default ones)
CREATE POLICY "Users can update own non-default categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id AND is_default = false);

-- Users can delete their own categories (except default ones)
CREATE POLICY "Users can delete own non-default categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default categories (will be copied per user on registration)
-- These serve as templates
COMMENT ON TABLE categories IS 'Transaction categories for organizing expenses and income';
