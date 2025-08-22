CREATE OR REPLACE FUNCTION update_submission_outcome(sub_id UUID)
RETURNS VOID AS $$
DECLARE
  any_failed   BOOLEAN;
  all_passed   BOOLEAN;
  any_manual   BOOLEAN;
  has_answers  BOOLEAN;
  new_outcome  submission_outcome;
BEGIN
  SELECT
    COALESCE(BOOL_OR(ar.outcome = 'FAILED'), FALSE),
    COALESCE(BOOL_AND(ar.outcome = 'PASSED'), FALSE),
    COALESCE(BOOL_OR(ar.outcome = 'MANUAL'), FALSE),
    COUNT(*) > 0
  INTO any_failed, all_passed, any_manual, has_answers
  FROM answer_results ar
  JOIN answers a USING (answerid)
  WHERE a.submissionid = sub_id;

  IF NOT has_answers THEN
    new_outcome := 'MANUAL_REVIEW'::submission_outcome;
  ELSIF any_failed THEN
    new_outcome := 'REJECTED'::submission_outcome;
  ELSIF all_passed THEN
    new_outcome := 'ACCEPTED'::submission_outcome;
  ELSIF any_manual THEN
    new_outcome := 'MANUAL_REVIEW'::submission_outcome;
  ELSE
    -- defensive fallback
    new_outcome := 'MANUAL_REVIEW'::submission_outcome;
  END IF;

  UPDATE submissions
     SET outcome = new_outcome
   WHERE submissionid = sub_id;
END;
$$ LANGUAGE plpgsql;
