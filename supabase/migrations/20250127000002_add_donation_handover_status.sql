-- Add donation handover status column to cases table
-- This column tracks whether all collected donations have been handed over to the case

ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS all_donations_handed_over BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.cases.all_donations_handed_over IS 'Indicates whether all collected donations have been fully handed over to the case';

-- Create a function to automatically update this status based on donation data
CREATE OR REPLACE FUNCTION public.update_case_handover_status(target_case_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_donations NUMERIC := 0;
    total_handed_over NUMERIC := 0;
    is_fully_handed_over BOOLEAN := FALSE;
BEGIN
    -- Calculate total confirmed donations for the case
    SELECT COALESCE(SUM(amount), 0) INTO total_donations
    FROM public.donations
    WHERE case_id = target_case_id
    AND status = 'confirmed';
    
    -- Calculate total handed over amount for the case
    SELECT COALESCE(SUM(total_handed_over), 0) INTO total_handed_over
    FROM public.donations
    WHERE case_id = target_case_id
    AND status = 'confirmed';
    
    -- Determine if all donations are handed over
    is_fully_handed_over := (total_donations > 0 AND total_handed_over >= total_donations);
    
    -- Update the case status
    UPDATE public.cases
    SET all_donations_handed_over = is_fully_handed_over
    WHERE id = target_case_id;
    
    RETURN is_fully_handed_over;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_case_handover_status(UUID) TO authenticated;

-- Create a trigger function to automatically update handover status when donations change
CREATE OR REPLACE FUNCTION public.trigger_update_case_handover_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update handover status for the affected case
    PERFORM public.update_case_handover_status(COALESCE(NEW.case_id, OLD.case_id));
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers on donations table to automatically update case status
DROP TRIGGER IF EXISTS update_case_handover_on_donation_change ON public.donations;
CREATE TRIGGER update_case_handover_on_donation_change
    AFTER INSERT OR UPDATE OR DELETE ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_case_handover_status();

-- Update existing cases with current handover status
DO $$
DECLARE
    case_record RECORD;
BEGIN
    FOR case_record IN SELECT id FROM public.cases LOOP
        PERFORM public.update_case_handover_status(case_record.id);
    END LOOP;
END $$;
