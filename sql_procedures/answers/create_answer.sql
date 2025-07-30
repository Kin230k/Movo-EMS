CREATE OR REPLACE PROCEDURE create_answer(
    p_submission_id UUID,
    p_question_id UUID,
    p_answered_at TIMESTAMP
)
LANGUAGE plpgsql AS $$
DECLARE
    new_answer ANSWERS;
BEGIN
    -- Validate inputs
    IF p_submission_id IS NULL THEN
        RAISE EXCEPTION 'Submission ID cannot be null';
    END IF;
    
    IF p_question_id IS NULL THEN
        RAISE EXCEPTION 'Question ID cannot be null';
    END IF;

    -- Create base answer
    INSERT INTO ANSWERS (
        answerId,
        submissionId, 
        questionId, 
        answeredAt
    ) VALUES (
        gen_random_uuid(),
        p_submission_id,
        p_question_id,
        p_answered_at
    ) RETURNING * INTO new_answer;
    
    -- Return generated answer
    SELECT new_answer;
    
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'Invalid submissionId or questionId';
        WHEN not_null_violation THEN
            RAISE EXCEPTION 'Required fields cannot be null';
END;
$$;
