CREATE OR REPLACE PROCEDURE update_answer(
    p_answer_id UUID,
    p_submission_id UUID,
    p_question_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Validate inputs
    IF p_answer_id IS NULL THEN
        RAISE EXCEPTION 'Answer ID cannot be null';
    END IF;
    
    UPDATE ANSWERS
    SET 
        submissionId = p_submission_id,
        questionId = p_question_id
    WHERE answerId = p_answer_id;
    
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'Invalid submissionId or questionId';
        WHEN not_null_violation THEN
            RAISE EXCEPTION 'Required fields cannot be null';
END;
$$;
