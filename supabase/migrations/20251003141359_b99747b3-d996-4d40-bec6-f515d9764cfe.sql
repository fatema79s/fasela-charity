-- Add parent profile fields to cases table
ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS rent_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS kids_number integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS health_state text,
ADD COLUMN IF NOT EXISTS parent_age integer,
ADD COLUMN IF NOT EXISTS work_ability text,
ADD COLUMN IF NOT EXISTS skills text[],
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS profile_notes text;

-- Add kid profile tracking fields to case_kids table
ALTER TABLE public.case_kids
ADD COLUMN IF NOT EXISTS health_state text,
ADD COLUMN IF NOT EXISTS education_progress jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS certificates jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ongoing_courses jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS current_grade text,
ADD COLUMN IF NOT EXISTS school_name text;

-- Add comments for documentation
COMMENT ON COLUMN public.cases.rent_amount IS 'Monthly rent amount for the family';
COMMENT ON COLUMN public.cases.kids_number IS 'Total number of children in the family';
COMMENT ON COLUMN public.cases.health_state IS 'General health state of the parent/guardian';
COMMENT ON COLUMN public.cases.parent_age IS 'Age of the parent/guardian';
COMMENT ON COLUMN public.cases.work_ability IS 'Work ability status (e.g., unable, limited, able)';
COMMENT ON COLUMN public.cases.skills IS 'Skills possessed by the parent/guardian';
COMMENT ON COLUMN public.cases.education_level IS 'Education level of the parent/guardian';
COMMENT ON COLUMN public.cases.profile_notes IS 'Additional notes about the parent profile';

COMMENT ON COLUMN public.case_kids.health_state IS 'Health state of the child';
COMMENT ON COLUMN public.case_kids.education_progress IS 'Year-over-year education progress tracking';
COMMENT ON COLUMN public.case_kids.certificates IS 'Certificates and grades achieved';
COMMENT ON COLUMN public.case_kids.ongoing_courses IS 'Current ongoing courses and needs';
COMMENT ON COLUMN public.case_kids.current_grade IS 'Current grade/class level';
COMMENT ON COLUMN public.case_kids.school_name IS 'Name of the school the child attends';