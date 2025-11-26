-- Add category_id column to transactions table
ALTER TABLE transactions
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_transactions_category_id ON transactions(category_id);

-- Make category column nullable (for backward compatibility)
ALTER TABLE transactions
ALTER COLUMN category DROP NOT NULL;

-- Comment
COMMENT ON COLUMN transactions.category_id IS 'Reference to categories table. If null, uses legacy category field';
COMMENT ON COLUMN transactions.category IS 'Legacy free-text category. Kept for backward compatibility';
