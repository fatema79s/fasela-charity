-- Add answer type fields to followup_actions table for tasks
ALTER TABLE public.followup_actions 
ADD COLUMN IF NOT EXISTS answer_type TEXT CHECK (answer_type IN ('multi_choice', 'photo_upload', 'text_area')),
ADD COLUMN IF NOT EXISTS answer_options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS answer_text TEXT,
ADD COLUMN IF NOT EXISTS answer_photos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS answer_multi_choice TEXT,
ADD COLUMN IF NOT EXISTS answered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.followup_actions.answer_type IS 'Type of answer required: multi_choice, photo_upload, or text_area';
COMMENT ON COLUMN public.followup_actions.answer_options IS 'Array of options for multi-choice questions';
COMMENT ON COLUMN public.followup_actions.answer_text IS 'Text answer for text_area type';
COMMENT ON COLUMN public.followup_actions.answer_photos IS 'Array of photo URLs for photo_upload type';
COMMENT ON COLUMN public.followup_actions.answer_multi_choice IS 'Selected option for multi-choice questions';
COMMENT ON COLUMN public.followup_actions.answered_at IS 'Timestamp when the task was answered';
COMMENT ON COLUMN public.followup_actions.answered_by IS 'User who answered the task';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_followup_actions_answer_type ON public.followup_actions(answer_type);
CREATE INDEX IF NOT EXISTS idx_followup_actions_answered_at ON public.followup_actions(answered_at);

