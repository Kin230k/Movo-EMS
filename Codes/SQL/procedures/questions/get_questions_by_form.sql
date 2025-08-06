CREATE OR REPLACE FUNCTION get_questions_by_form(p_form_id UUID)
RETURNS TABLE (
    questionId UUID,
    typeCode VARCHAR(30),
    questionText JSONB
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_questions_by_form');

RETURN QUERY 
    SELECT 
        q.questionId,
        q.typeCode,
        q.questionText
    FROM QUESTIONS q
    WHERE q.formId = p_form_id;
END;
$$;