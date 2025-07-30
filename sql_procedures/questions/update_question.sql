CREATE OR REPLACE PROCEDURE update_question(
    p_question_id UUID,
    p_type_code VARCHAR(30),
    p_question_text JSONB,
    p_form_id UUID,
    p_interview_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE QUESTIONS
    SET 
        typeCode = p_type_code,
        questionText = p_question_text,
        formId = p_form_id,
        interviewId = p_interview_id
    WHERE questionId = p_question_id;
END;
$$;