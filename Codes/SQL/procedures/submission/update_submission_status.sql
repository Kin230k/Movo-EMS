CREATE OR REPLACE PROCEDURE update_submission_status(
  p_auth_user_id UUID,
  p_submission_id UUID,
  p_outcome VARCHAR(20),
  p_decision_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  CALL check_user_permission(p_auth_user_id, 'update_submission_status');

  UPDATE SUBMISSIONS
  SET 
    outcome = COALESCE(p_outcome::varchar(20), outcome),
    decisionNotes = COALESCE(p_decision_notes, decisionNotes)
  WHERE submissionId = p_submission_id;
END;
$$;
