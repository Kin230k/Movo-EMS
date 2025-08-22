CREATE OR REPLACE FUNCTION submission_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE submissions
  SET answer_count = answer_count + 1
  WHERE submissionid = NEW.submissionid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;