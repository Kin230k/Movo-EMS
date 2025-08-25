CREATE OR REPLACE FUNCTION get_submission_by_id(p_auth_user_id UUID,p_submission_id UUID)
RETURNS TABLE (
    submissionId UUID,
    formId UUID,
    userId UUID,
    interviewId UUID,
    dateSubmitted TIMESTAMP,
    outcome submission_outcome,
    decisionNotes TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_submission_by_id');

RETURN QUERY 
    SELECT 
        s.submissionId,
        s.formId,
        s.userId,
        s.interviewId,
        s.dateSubmitted,
        s.outcome::submission_outcome,
        s.decisionNotes
    FROM SUBMISSIONS s
    WHERE s.submissionId = p_submission_id;
END;
$$;