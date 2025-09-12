
CREATE OR REPLACE FUNCTION get_questions_by_interview_id(p_auth_user_id UUID, p_interview_id UUID)
RETURNS TABLE (
    questionId UUID,
    typeCode VARCHAR(30),
    questionText TEXT,
    formId UUID,
    interviewId UUID,
    interviewTitle TEXT,
    criteria JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_questions_by_interview_id');

    RETURN QUERY 
    SELECT 
        q.questionId,
        q.typeCode,
        q.questionText,
        q.formId,
        q.interviewId,
        i.title AS interviewTitle,
        COALESCE(
          (
            SELECT jsonb_agg(to_jsonb(c) - 'questionid')
            FROM criteria c
            WHERE c.questionid = q.questionid
          ),
          '[]'::jsonb
        ) AS criteria
    FROM QUESTIONS q
    INNER JOIN INTERVIEWS i ON q.interviewId = i.interviewId
    WHERE q.interviewId = p_interview_id;
END;
$$;