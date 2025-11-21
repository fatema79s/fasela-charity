-- Rename payment_type column to case_care_type and update values
-- First, drop the old constraint
ALTER TABLE public.cases
DROP CONSTRAINT IF EXISTS cases_payment_type_check;

-- Rename the column
ALTER TABLE public.cases
RENAME COLUMN payment_type TO case_care_type;

-- Update existing values
UPDATE public.cases
SET case_care_type = CASE
  WHEN case_care_type = 'monthly' THEN 'sponsorship'
  WHEN case_care_type = 'one_time' THEN 'one_time_donation'
  ELSE 'sponsorship' -- Default for any unexpected values
END;

-- Add new check constraint with the three options
ALTER TABLE public.cases
ADD CONSTRAINT cases_case_care_type_check 
CHECK (case_care_type IN ('cancelled', 'sponsorship', 'one_time_donation'));

-- Update the default value
ALTER TABLE public.cases
ALTER COLUMN case_care_type SET DEFAULT 'sponsorship';

COMMENT ON COLUMN public.cases.case_care_type IS 'Type of case care: cancelled (case is cancelled), sponsorship (monthly commitment), one_time_donation (one-time help payment)';

