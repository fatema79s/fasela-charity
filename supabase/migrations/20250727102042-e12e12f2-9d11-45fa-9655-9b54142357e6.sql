-- Create donations table to track pending and confirmed donations
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  donor_name TEXT,
  donor_email TEXT,
  amount NUMERIC NOT NULL,
  months_pledged INTEGER NOT NULL DEFAULT 1,
  payment_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  donation_type TEXT NOT NULL DEFAULT 'monthly' CHECK (donation_type IN ('monthly', 'custom')),
  payment_reference TEXT,
  admin_notes TEXT,
  confirmed_by UUID REFERENCES auth.users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create policies for donations
CREATE POLICY "Anyone can create donations" 
ON public.donations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all donations" 
ON public.donations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all donations" 
ON public.donations 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view confirmed donations for transparency" 
ON public.donations 
FOR SELECT 
USING (status = 'confirmed');

-- Add trigger for updated_at
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update case totals when donation is confirmed
CREATE OR REPLACE FUNCTION update_case_totals_on_donation_confirm()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status changed to confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE public.cases 
    SET 
      total_secured_money = COALESCE(total_secured_money, 0) + NEW.amount,
      months_covered = CASE 
        WHEN NEW.donation_type = 'monthly' THEN COALESCE(months_covered, 0) + NEW.months_pledged
        ELSE COALESCE(months_covered, 0) + FLOOR(NEW.amount / monthly_cost)
      END,
      updated_at = now()
    WHERE id = NEW.case_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp';

-- Create trigger for updating case totals
CREATE TRIGGER donations_update_case_totals
AFTER UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION update_case_totals_on_donation_confirm();