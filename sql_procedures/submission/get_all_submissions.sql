CREATE OR REPLACE FUNCTION get_all_submissions()
RETURNS TABLE (
    submissionId UUID,
    formId UUID,
    userId UUID,
    interviewId UUID,
    dateSubmitted DATE,
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
    FROM SUBMISSION s;
END;
$$;