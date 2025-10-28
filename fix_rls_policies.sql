-- Fix RLS policies to use existing functions instead of missing has_role function
-- Drop existing policies for case_tasks
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.case_tasks;
DROP POLICY IF EXISTS "Admins can insert tasks" ON public.case_tasks;
DROP POLICY IF EXISTS "Admins can update tasks" ON public.case_tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.case_tasks;

-- Create new policies using the existing is_admin_or_volunteer() function
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

-- Drop existing policies for case_followups
DROP POLICY IF EXISTS "Admins can view all followups" ON public.case_followups;
DROP POLICY IF EXISTS "Admins can insert followups" ON public.case_followups;
DROP POLICY IF EXISTS "Admins can update followups" ON public.case_followups;
DROP POLICY IF EXISTS "Admins can delete followups" ON public.case_followups;

-- Create new policies using the existing is_admin_or_volunteer() function
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
