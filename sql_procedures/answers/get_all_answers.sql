CREATE OR REPLACE FUNCTION get_all_answers()
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
    FROM ANSWERS a;
END;
$$;