-- First, let's check current policies and drop the one that depends on status
DROP POLICY IF EXISTS "Public can view confirmed donations for transparency" ON donations;

-- Remove the default value temporarily
ALTER TABLE donations ALTER COLUMN status DROP DEFAULT;

-- Create the enum type
CREATE TYPE donation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'redeemed');

-- Update the column to use the enum
ALTER TABLE donations 
ALTER COLUMN status TYPE donation_status 
USING status::donation_status;

-- Restore the default value
ALTER TABLE donations ALTER COLUMN status SET DEFAULT 'pending';

-- Recreate the policy with the new enum value
CREATE POLICY "Public can view confirmed donations for transparency" 
ON donations 
FOR SELECT 
USING (status = 'confirmed');