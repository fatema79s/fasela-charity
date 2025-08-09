-- Update the donations status check constraint to include all valid statuses
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check;

-- Add the updated constraint with all valid status values
ALTER TABLE donations ADD CONSTRAINT donations_status_check 
CHECK (status IN ('pending', 'confirmed', 'redeemed', 'cancelled'));