-- Add payment_type column to cases table
-- This field indicates whether the case is for one-time help payment or monthly commitment
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS payment_type TEXT NOT NULL DEFAULT 'monthly';

-- Add check constraint for payment_type
ALTER TABLE public.cases
ADD CONSTRAINT cases_payment_type_check 
CHECK (payment_type IN ('one_time', 'monthly'));

COMMENT ON COLUMN public.cases.payment_type IS 'Type of payment: one_time for one-time help payment, monthly for monthly commitment';

