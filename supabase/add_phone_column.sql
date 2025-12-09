-- Add phone column to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add index for phone lookups
CREATE INDEX IF NOT EXISTS idx_vendors_phone ON vendors(phone);
