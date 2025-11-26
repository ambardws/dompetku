-- =====================================================
-- Add category_id column to transactions table
-- =====================================================

-- Check if column exists first
DO $$
BEGIN
    -- Add category_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'transactions'
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN category_id UUID;
        RAISE NOTICE 'Added category_id column';
    ELSE
        RAISE NOTICE 'category_id column already exists';
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON public.transactions(category_id);

-- Add foreign key constraint
ALTER TABLE public.transactions
    DROP CONSTRAINT IF EXISTS transactions_category_id_fkey;

ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_category_id_fkey
    FOREIGN KEY (category_id)
    REFERENCES public.categories(id)
    ON DELETE SET NULL;

-- Verify the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'transactions'
ORDER BY ordinal_position;
