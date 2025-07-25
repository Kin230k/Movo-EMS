CREATE OR REPLACE FUNCTION get_answer_by_id(p_answer_id UUID)
RETURNS TABLE (
    answerId UUID,
    submissionId UUID,
    questionId UUID,
    answeredAt TIMESTAMP
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.answerId,
        a.submissionId,
        a.questionId,
        a.answeredAt
    FROM ANSWERS a
    WHERE a.answerId = p_answer_id;
END;
$$;