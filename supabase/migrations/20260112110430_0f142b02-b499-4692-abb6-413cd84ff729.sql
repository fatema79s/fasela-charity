-- Create a security definer function to check if a valid pending invitation exists
CREATE OR REPLACE FUNCTION public.has_pending_invitation(check_email text, check_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_invitations
    WHERE email = check_email
      AND organization_id = check_org_id
      AND status = 'pending'
      AND expires_at > NOW()
  );
$$;

-- Drop and recreate the policy using the security definer function
DROP POLICY IF EXISTS "Users can join org via invitation" ON public.user_roles;

CREATE POLICY "Users can join org via invitation" ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id 
        AND public.has_pending_invitation(
            (SELECT email FROM auth.users WHERE id = auth.uid()),
            organization_id
        )
    );

-- Also allow users to update their own invitation to "accepted"
DROP POLICY IF EXISTS "Invited users can accept their invitation" ON public.org_invitations;

CREATE POLICY "Invited users can accept their invitation" ON public.org_invitations
    FOR UPDATE
    TO authenticated
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND status = 'pending')
    WITH CHECK (status = 'accepted');