-- Fix followup RLS policies and performance issues
-- This script fixes the RLS policies for case_followups and case_tasks tables

-- First, create the is_admin_or_volunteer function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin_or_volunteer()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has admin or volunteer role
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'volunteer')
  );
END;
$$;

-- Drop existing problematic policies for case_followups
DROP POLICY IF EXISTS "Admins can view all followups" ON public.case_followups;
DROP POLICY IF EXISTS "Admins can insert followups" ON public.case_followups;
DROP POLICY IF EXISTS "Admins can update followups" ON public.case_followups;
DROP POLICY IF EXISTS "Admins can delete followups" ON public.case_followups;

-- Create new policies using the working is_admin_or_volunteer() function
CREATE POLICY "Admins can view all followups"
  ON public.case_followups
  FOR SELECT
  USING (is_admin_or_volunteer());

CREATE POLICY "Admins can insert followups"
  ON public.case_followups
  FOR INSERT
  WITH CHECK (is_admin_or_volunteer());

CREATE POLICY "Admins can update followups"
  ON public.case_followups
  FOR UPDATE
  USING (is_admin_or_volunteer());

CREATE POLICY "Admins can delete followups"
  ON public.case_followups
  FOR DELETE
  USING (is_admin_or_volunteer());

-- Drop existing problematic policies for case_tasks
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.case_tasks;
DROP POLICY IF EXISTS "Admins can insert tasks" ON public.case_tasks;
DROP POLICY IF EXISTS "Admins can update tasks" ON public.case_tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.case_tasks;

-- Create new policies using the working is_admin_or_volunteer() function
CREATE POLICY "Admins can view all tasks"
  ON public.case_tasks
  FOR SELECT
  USING (is_admin_or_volunteer());

CREATE POLICY "Admins can insert tasks"
  ON public.case_tasks
  FOR INSERT
  WITH CHECK (is_admin_or_volunteer());

CREATE POLICY "Admins can update tasks"
  ON public.case_tasks
  FOR UPDATE
  USING (is_admin_or_volunteer());

CREATE POLICY "Admins can delete tasks"
  ON public.case_tasks
  FOR DELETE
  USING (is_admin_or_volunteer());

-- Add performance indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_case_followups_case_id_created_at ON public.case_followups(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_followups_followup_date_desc ON public.case_followups(followup_date DESC);
CREATE INDEX IF NOT EXISTS idx_case_tasks_case_id_status ON public.case_tasks(case_id, status);
CREATE INDEX IF NOT EXISTS idx_case_tasks_status_priority ON public.case_tasks(status, priority);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_followups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_tasks TO authenticated;
