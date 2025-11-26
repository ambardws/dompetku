-- Create bot_users table
-- This table links bot platform accounts (Telegram/WhatsApp) to Dompetku users

CREATE TABLE IF NOT EXISTS bot_users (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('telegram', 'whatsapp')),
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one platform user can only be linked to one Dompetku user
  UNIQUE(platform, platform_user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bot_users_user_id ON bot_users(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_platform_user ON bot_users(platform, platform_user_id);

-- Enable Row Level Security
ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see and manage their own bot user links
CREATE POLICY "Users can view their own bot links"
  ON bot_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bot links"
  ON bot_users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot links"
  ON bot_users FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot links"
  ON bot_users FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_bot_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bot_users_updated_at_trigger
  BEFORE UPDATE ON bot_users
  FOR EACH ROW
  EXECUTE FUNCTION update_bot_users_updated_at();

-- Create bot_link_tokens table for secure account linking
CREATE TABLE IF NOT EXISTS bot_link_tokens (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_bot_link_tokens_user_id ON bot_link_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_link_tokens_expires_at ON bot_link_tokens(expires_at);

-- Enable RLS for bot_link_tokens
ALTER TABLE bot_link_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bot_link_tokens
CREATE POLICY "Users can view their own link tokens"
  ON bot_link_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own link tokens"
  ON bot_link_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own link tokens"
  ON bot_link_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Function to clean up expired tokens (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_bot_link_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM bot_link_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
