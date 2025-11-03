-- Add new lifecycle_status column to cases table
ALTER TABLE public.cases 
ADD COLUMN lifecycle_status text NOT NULL DEFAULT 'active';

-- Add check constraint for lifecycle_status
ALTER TABLE public.cases
ADD CONSTRAINT cases_lifecycle_status_check 
CHECK (lifecycle_status IN ('active', 'sponsored', 'removed', 'completed', 'under_more_investigation', 'parked'));

-- Update existing status column check constraint to reflect money collection states
ALTER TABLE public.cases
DROP CONSTRAINT IF EXISTS cases_status_check;

ALTER TABLE public.cases
ADD CONSTRAINT cases_status_check 
CHECK (status IN ('active', 'complete', 'completed', 'money_collected'));

COMMENT ON COLUMN public.cases.lifecycle_status IS 'Lifecycle status of the case';
COMMENT ON COLUMN public.cases.status IS 'Money collection status of the case';