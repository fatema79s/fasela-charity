-- Create charities table
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case_charities junction table to track which charities support each case and monthly amounts
CREATE TABLE IF NOT EXISTS public.case_charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  monthly_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(case_id, charity_id)
);

-- Enable Row Level Security
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_charities ENABLE ROW LEVEL SECURITY;

-- Create policies for charities table
CREATE POLICY "Admins can manage all charities" 
ON public.charities 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view charities" 
ON public.charities 
FOR SELECT 
USING (true);

-- Create policies for case_charities table
CREATE POLICY "Admins can manage all case charities" 
ON public.case_charities 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view case charities" 
ON public.case_charities 
FOR SELECT 
USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_case_charities_case_id ON public.case_charities(case_id);
CREATE INDEX IF NOT EXISTS idx_case_charities_charity_id ON public.case_charities(charity_id);

-- Add trigger for updated_at on charities
CREATE OR REPLACE FUNCTION update_charities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_charities_updated_at
BEFORE UPDATE ON public.charities
FOR EACH ROW
EXECUTE FUNCTION update_charities_updated_at();

-- Add trigger for updated_at on case_charities
CREATE OR REPLACE FUNCTION update_case_charities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_case_charities_updated_at
BEFORE UPDATE ON public.case_charities
FOR EACH ROW
EXECUTE FUNCTION update_case_charities_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.charities IS 'Table storing information about charities';
COMMENT ON TABLE public.case_charities IS 'Junction table linking cases to charities with monthly support amounts';
COMMENT ON COLUMN public.case_charities.monthly_amount IS 'Monthly amount (in local currency) that this charity provides to the case';

