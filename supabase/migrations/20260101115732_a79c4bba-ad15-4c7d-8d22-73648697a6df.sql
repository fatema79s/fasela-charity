-- Add original_case_id column to track where donation originally came from
ALTER TABLE public.donation_handovers 
ADD COLUMN original_case_id uuid REFERENCES public.cases(id);

-- Backfill existing records with the original case from the donation
UPDATE public.donation_handovers dh
SET original_case_id = d.case_id
FROM public.donations d
WHERE dh.donation_id = d.id;

-- Add index for efficient querying of cross-case handovers
CREATE INDEX idx_donation_handovers_original_case ON public.donation_handovers(original_case_id);

-- Add comment for documentation
COMMENT ON COLUMN public.donation_handovers.original_case_id IS 'The case the donation was originally made to (for audit trail of cross-case handovers)';