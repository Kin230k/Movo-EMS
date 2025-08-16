CREATE OR REPLACE FUNCTION get_answers_by_submission(p_auth_user_id UUID,p_submission_id UUID)
RETURNS TABLE (
    answerId UUID,
    questionId UUID,
    answeredAt TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_answers_by_submission');

RETURN QUERY 
    SELECT 
        a.answerId,
        a.questionId,
        a.answeredAt
    FROM ANSWERS a
    WHERE a.submissionId = p_submission_id;
END;
$$;