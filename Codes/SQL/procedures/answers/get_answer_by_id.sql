CREATE OR REPLACE FUNCTION get_answer_by_id(p_auth_user_id UUID, p_answer_id UUID)
RETURNS TABLE (
    answerId UUID,
    submissionId UUID,
    questionId UUID,
    answeredAt TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_answer_by_id');
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