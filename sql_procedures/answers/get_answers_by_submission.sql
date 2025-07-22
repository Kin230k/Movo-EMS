CREATE OR REPLACE FUNCTION get_answers_by_submission(p_submission_id UUID)
RETURNS TABLE (
    answerId UUID,
    questionId UUID,
    answeredAt TIMESTAMP
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.answerId,
        a.questionId,
        a.answeredAt
    FROM ANSWERS a
    WHERE a.submissionId = p_submission_id;
END;
$$;