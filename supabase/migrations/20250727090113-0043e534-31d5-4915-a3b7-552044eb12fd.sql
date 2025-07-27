-- First, let's ensure we have proper user roles system
-- Create app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'volunteer', 'user');
    END IF;
END $$;

-- Update user_roles table to use app_role if it exists, otherwise create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE TABLE public.user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            role app_role NOT NULL DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE (user_id, role)
        );
        
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for user_roles
        CREATE POLICY "Admins can manage all user roles" 
        ON public.user_roles 
        FOR ALL 
        USING (has_role(auth.uid(), 'admin'::app_role));

        CREATE POLICY "Users can view their own roles" 
        ON public.user_roles 
        FOR SELECT 
        USING (user_id = auth.uid());
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

-- Insert some sample admin user (this will only work after a user signs up)
-- We'll do this in the app after authentication is set up