-- Add recurrence columns to followup_actions table
ALTER TABLE followup_actions
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurrence_interval TEXT CHECK (recurrence_interval IN ('weekly', 'monthly'));
