-- Helper function to get current user's organization ID
-- Assumes single-org membership for now, or returns the first one found.
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO authenticated;

-- Helper to check if user belongs to specific org
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND organization_id = org_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated;
