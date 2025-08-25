CREATE OR REPLACE FUNCTION finalize_submission_outcome()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dateSubmitted IS NOT NULL THEN
    PERFORM update_submission_outcome(NEW.submissionId);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;