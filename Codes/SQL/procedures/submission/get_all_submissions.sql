CREATE OR REPLACE FUNCTION get_all_submissions(p_auth_user_id UUID)
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
    CALL check_user_permission(p_auth_user_id, 'get_all_submissions');

RETURN QUERY 
    SELECT 
        s.submissionId,
        s.formId,
        s.userId,
        s.interviewId,
        s.dateSubmitted,
        s.outcome,
        s.decisionNotes
    FROM SUBMISSIONS s;
END;
$$;