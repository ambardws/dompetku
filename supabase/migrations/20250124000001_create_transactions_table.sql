-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON public.transactions(type);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own transactions
CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own transactions
CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
