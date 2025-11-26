-- Create bill_reminders table
-- This table stores recurring bill reminders for users

CREATE TABLE IF NOT EXISTS bill_reminders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'yearly', 'weekly', 'custom')),
  next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_days INTEGER NOT NULL DEFAULT 3 CHECK (reminder_days >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_bill_reminders_user_id ON bill_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_reminders_next_due_date ON bill_reminders(next_due_date);
CREATE INDEX IF NOT EXISTS idx_bill_reminders_user_active ON bill_reminders(user_id, is_active);

-- Enable Row Level Security
ALTER TABLE bill_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bill reminders"
  ON bill_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bill reminders"
  ON bill_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bill reminders"
  ON bill_reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bill reminders"
  ON bill_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_bill_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bill_reminders_updated_at_trigger
  BEFORE UPDATE ON bill_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_reminders_updated_at();
