-- Add cost field to followup_actions table
ALTER TABLE public.followup_actions
ADD COLUMN cost numeric DEFAULT 0;