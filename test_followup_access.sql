-- Test script to check followup_actions table access
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if the table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'followup_actions';

-- 2. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'followup_actions';

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'followup_actions';

-- 4. Check if is_admin() function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'is_admin';

-- 5. Test the is_admin() function (replace with actual user ID)
-- SELECT is_admin();

-- 6. Check user_roles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles';

-- 7. Check if current user has admin role
SELECT user_id, role 
FROM public.user_roles 
WHERE user_id = auth.uid();

-- 8. Test inserting a followup action (this will show the actual error)
-- INSERT INTO public.followup_actions (
--   case_id, 
--   title, 
--   action_date, 
--   created_by
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000', -- Replace with actual case ID
--   'Test Followup',
--   CURRENT_DATE,
--   auth.uid()
-- );
