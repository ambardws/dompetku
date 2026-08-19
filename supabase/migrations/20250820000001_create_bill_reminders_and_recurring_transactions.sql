-- =====================================================
-- Migration: Create Bill Reminders & Recurring Transactions Tables
-- =====================================================

-- Bill Reminders table
CREATE TABLE IF NOT EXISTS bill_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category_id UUID REFERENCES categories(id),
  frequency TEXT CHECK (frequency IN ('monthly', 'weekly', 'yearly', 'custom')) NOT NULL DEFAULT 'monthly',
  next_due_date TIMESTAMPTZ NOT NULL,
  reminder_days INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  note TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) NOT NULL DEFAULT 'monthly',
  start_date TIMESTAMPTZ NOT NULL,
  next_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Enable Row Level Security
-- =====================================================
ALTER TABLE bill_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for bill_reminders
-- =====================================================
CREATE POLICY "Users can view own bill_reminders" ON bill_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bill_reminders" ON bill_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bill_reminders" ON bill_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bill_reminders" ON bill_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- RLS Policies for recurring_transactions
-- =====================================================
CREATE POLICY "Users can view own recurring_transactions" ON recurring_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring_transactions" ON recurring_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring_transactions" ON recurring_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring_transactions" ON recurring_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- Indexes for better query performance
-- =====================================================
CREATE INDEX idx_bill_reminders_user_id ON bill_reminders(user_id);
CREATE INDEX idx_bill_reminders_next_due_date ON bill_reminders(next_due_date);
CREATE INDEX idx_bill_reminders_is_active ON bill_reminders(is_active);

CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_date);
CREATE INDEX idx_recurring_transactions_is_active ON recurring_transactions(is_active);
