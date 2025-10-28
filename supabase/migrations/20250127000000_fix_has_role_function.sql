-- Fix missing has_role function for RLS policies
-- This function is referenced in RLS policies but was never created

CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = has_role.user_id 
    AND user_roles.role = has_role.role_name
  );
END;
$$;

-- Also create a version that uses auth.uid() for convenience
CREATE OR REPLACE FUNCTION public.has_role(role_name app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = has_role.role_name
  );
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(app_role) TO authenticated;
