-- Check if 'volunteer' value exists in app_role enum and add it if not
DO $$
BEGIN
    -- Add 'volunteer' to the app_role enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'app_role')
        AND enumlabel = 'volunteer'
    ) THEN
        ALTER TYPE public.app_role ADD VALUE 'volunteer';
    END IF;
END $$;

-- Update RLS policies for cases to allow admin/volunteer access
DROP POLICY IF EXISTS "Allow admin to manage cases" ON public.cases;
DROP POLICY IF EXISTS "Allow public read access for cases" ON public.cases;

CREATE POLICY "Allow admin and volunteers to manage cases" 
ON public.cases 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'volunteer'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'volunteer'::app_role));

CREATE POLICY "Allow public read access for published cases" 
ON public.cases 
FOR SELECT 
USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'volunteer'::app_role));

-- Update RLS policies for monthly_needs
DROP POLICY IF EXISTS "Allow authenticated users to manage monthly needs" ON public.monthly_needs;

CREATE POLICY "Allow admin and volunteers to manage monthly needs" 
ON public.monthly_needs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'volunteer'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'volunteer'::app_role));

-- Update RLS policies for monthly_reports
DROP POLICY IF EXISTS "Allow authenticated users to manage monthly reports" ON public.monthly_reports;

CREATE POLICY "Allow admin and volunteers to manage monthly reports" 
ON public.monthly_reports 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'volunteer'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'volunteer'::app_role));

-- Create a function to check if user is admin or volunteer
CREATE OR REPLACE FUNCTION public.is_admin_or_volunteer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'volunteer')
  );
END;
$$;