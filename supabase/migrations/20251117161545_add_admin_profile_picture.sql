-- Add admin_profile_picture_url column to cases table
-- This field stores the URL of a profile picture that is only visible to admins
-- and is displayed in admin case list views, not in consumer-facing pages
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS admin_profile_picture_url text;

COMMENT ON COLUMN public.cases.admin_profile_picture_url IS 'URL of admin-only profile picture for the case, displayed in admin views only';

