CREATE OR REPLACE FUNCTION get_submission_by_id(p_submission_id UUID)
RETURNS TABLE (
    submissionId UUID,
    formId UUID,
    userId UUID,
    interviewId UUID,
    dateSubmitted TIMESTAMP,
    outcome submission_outcome,
    decisionNotes TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        s.submissionId,
        s.formId,
        s.userId,
        s.interviewId,
        s.dateSubmitted,
        s.outcome,
        s.decisionNotes
    FROM SUBMISSIONS s
    WHERE s.submissionId = p_submission_id;
END;
$$;