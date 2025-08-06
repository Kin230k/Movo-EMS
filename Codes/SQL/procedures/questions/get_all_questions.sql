CREATE OR REPLACE FUNCTION get_all_questions()
RETURNS TABLE (
    questionId UUID,
    typeCode VARCHAR(30),
    questionText JSONB,
    formId UUID,
    interviewId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_questions');

RETURN QUERY 
    SELECT 
        q.questionId,
        q.typeCode,
        q.questionText,
        q.formId,
        q.interviewId
    FROM QUESTIONS q;
END;
$$;