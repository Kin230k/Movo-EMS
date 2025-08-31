CREATE OR REPLACE FUNCTION get_questions_by_interview_id(p_auth_user_id UUID,p_interview_id UUID)
RETURNS TABLE (
    questionId UUID,
    typeCode VARCHAR(30),
    questionText TEXT,  -- Changed from JSONB to TEXT
    formId UUID,
    interviewId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_questions_by_interview_id');

RETURN QUERY 
    SELECT 
        q.questionId,
        q.typeCode,
        q.questionText,  -- Now returns TEXT
        q.formId,
        q.interviewId
    FROM QUESTIONS q
    WHERE q.interviewId = p_interview_id;
END;
$$;