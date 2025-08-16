CREATE OR REPLACE FUNCTION get_all_answers(p_auth_user_id UUID)
RETURNS TABLE (
    answerId UUID,
    submissionId UUID,
    questionId UUID,
    answeredAt TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_answers');
RETURN QUERY 
    SELECT 
        a.answerId,
        a.submissionId,
        a.questionId,
        a.answeredAt
    FROM ANSWERS a;
END;
$$;