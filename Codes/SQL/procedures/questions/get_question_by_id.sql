CREATE OR REPLACE FUNCTION get_question_by_id(p_auth_user_id UUID,p_question_id UUID)
RETURNS TABLE (
    questionId UUID,
    typeCode question_types,
    questionText TEXT,
    formId UUID,
    interviewId UUID,
    criteria JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_question_by_id');

RETURN QUERY 
    SELECT 
        q.questionId,
        q.typeCode::question_types,
        q.questionText,
        q.formId,
        q.interviewId,
        COALESCE(
          (
            SELECT jsonb_agg(to_jsonb(c) - 'questionid')
            FROM criteria c
            WHERE c.questionid = q.questionid
          ),
          '[]'::jsonb
        ) AS criteria
    FROM QUESTIONS q
    WHERE q.questionId = p_question_id;
END;
$$;