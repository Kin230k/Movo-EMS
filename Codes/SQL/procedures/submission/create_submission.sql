CREATE OR REPLACE FUNCTION create_submission(
 p_form_id UUID,
 p_user_id UUID,
 p_interview_id UUID,
 p_date_submitted TIMESTAMP,
 p_decision_notes TEXT
)
RETURNS TABLE (
 submissionId UUID,
 formId UUID,
 userId UUID,
 interviewId UUID,
 dateSubmitted TIMESTAMP,
 decisionNotes TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_submission');

RETURN QUERY
 INSERT INTO SUBMISSIONS (
 submissionId, formId, userId, interviewId, dateSubmitted, decisionNotes
 ) VALUES (
 gen_random_uuid(), p_form_id, p_user_id, p_interview_id, p_date_submitted, p_decision_notes
 )
 RETURNING submissionId, formId, userId, interviewId, dateSubmitted, decisionNotes;
END;
$$;