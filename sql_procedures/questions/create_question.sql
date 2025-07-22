CREATE OR REPLACE PROCEDURE create_question(
    p_type_code VARCHAR(30),
    p_question_text VARCHAR(1000),
    p_form_id UUID,
    p_interview_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO QUESTIONS (
        typeCode, 
        questionText, 
        formId, 
        interviewId
    ) VALUES (
        p_type_code,
        p_question_text,
        p_form_id,
        p_interview_id
    ) RETURNING *;
END;
$$;