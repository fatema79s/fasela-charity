ALTER TABLE donation_handovers
ADD COLUMN is_report_checkpoint BOOLEAN DEFAULT FALSE,
ADD COLUMN report_image_url TEXT;
