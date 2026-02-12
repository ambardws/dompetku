-- Add transaction_date column to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMPTZ;

-- Create index for better performance on date range queries
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date ON transactions(transaction_date);

-- Migrate existing data: set transaction_date = created_at for existing records
-- Only update records that don't have a manual transaction_date set yet
UPDATE transactions
SET transaction_date = created_at
WHERE transaction_date IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN transactions.transaction_date IS 'Date of transaction for analytics and filtering. Can be different from created_at for retroactive entries';
COMMENT ON COLUMN transactions.created_at IS 'Audit timestamp - when the record was created';
