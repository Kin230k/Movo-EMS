CREATE OR REPLACE FUNCTION create_question(
    p_auth_user_id UUID,
    p_type_code VARCHAR(30),
    p_question_text JSONB,
    p_form_id UUID,
    p_interview_id UUID
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    new_question_id UUID;
BEGIN
    -- Check user permissions
    CALL check_user_permission(p_auth_user_id, 'create_question');
    
    -- Insert the new question and return the generated ID
    INSERT INTO QUESTIONS (
        questionId,
        typeCode,
        questionText,
        formId,
        interviewId
    ) VALUES (
        gen_random_uuid(),
        p_type_code,
        p_question_text,
        p_form_id,
        p_interview_id
    )
    RETURNING questionId INTO new_question_id;
    
    -- Return the new question ID
    RETURN new_question_id;
END;
$$;
