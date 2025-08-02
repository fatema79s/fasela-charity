-- Remove the default value temporarily, create enum, then restore
ALTER TABLE donations ALTER COLUMN status DROP DEFAULT;

-- Create the enum type
CREATE TYPE donation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'redeemed');

-- Update the column to use the enum
ALTER TABLE donations 
ALTER COLUMN status TYPE donation_status 
USING status::donation_status;

-- Restore the default value
ALTER TABLE donations ALTER COLUMN status SET DEFAULT 'pending';