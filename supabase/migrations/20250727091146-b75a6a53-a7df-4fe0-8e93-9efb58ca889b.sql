-- Add admin role to admin@gmail.com if the user exists
INSERT INTO public.user_roles (user_id, role)
SELECT 
    auth.users.id,
    'admin'::app_role
FROM auth.users 
WHERE auth.users.email = 'admin@gmail.com'
    AND NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.users.id AND role = 'admin'::app_role
    );

-- Also create a function to easily add admin users in the future
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- If user doesn't exist, return false
    IF target_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Insert admin role if it doesn't already exist
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN TRUE;
END;
$$;