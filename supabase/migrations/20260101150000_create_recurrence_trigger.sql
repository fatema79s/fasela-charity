-- Function to handle recurring followups
CREATE OR REPLACE FUNCTION handle_recurring_followup()
RETURNS TRIGGER AS $$
DECLARE
  next_date DATE;
BEGIN
  -- Only trigger on status change to completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' AND NEW.is_recurring = true THEN
    -- Calculate next date
    IF NEW.recurrence_interval = 'weekly' THEN
      next_date := (NEW.action_date::DATE) + INTERVAL '1 week';
    ELSIF NEW.recurrence_interval = 'monthly' THEN
      next_date := (NEW.action_date::DATE) + INTERVAL '1 month';
    ELSE
      RETURN NEW;
    END IF;
    
    -- Insert new action
    INSERT INTO public.followup_actions (
      title, description, action_date, cost, requires_case_action, 
      requires_volunteer_action, case_id, created_by, status, 
      task_level, kid_ids, answer_type, answer_options, profile_field_mapping,
      is_recurring, recurrence_interval
    ) VALUES (
      NEW.title, NEW.description, next_date, NEW.cost, NEW.requires_case_action,
      NEW.requires_volunteer_action, NEW.case_id, NEW.created_by, 'pending',
      NEW.task_level, NEW.kid_ids, NEW.answer_type, NEW.answer_options, NEW.profile_field_mapping,
      true, NEW.recurrence_interval
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_followup_complete ON followup_actions;
CREATE TRIGGER on_followup_complete
AFTER UPDATE ON followup_actions
FOR EACH ROW
EXECUTE FUNCTION handle_recurring_followup();
