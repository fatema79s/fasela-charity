-- Create a security definer function to get current user's email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- Drop and recreate the policy using the new function
DROP POLICY IF EXISTS "Users can join org via invitation" ON public.user_roles;

CREATE POLICY "Users can join org via invitation" ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id 
        AND public.has_pending_invitation(
            public.get_current_user_email(),
            organization_id
        )
    );

-- Also fix the org_invitations policy
DROP POLICY IF EXISTS "Invited users can accept their invitation" ON public.org_invitations;

CREATE POLICY "Invited users can accept their invitation" ON public.org_invitations
    FOR UPDATE
    TO authenticated
    USING (email = public.get_current_user_email() AND status = 'pending')
    WITH CHECK (status = 'accepted');