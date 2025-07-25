CREATE OR REPLACE PROCEDURE create_answer(
    p_submission_id UUID,
    p_question_id UUID,
    p_answered_at TIMESTAMP
)
LANGUAGE plpgsql AS $$
BEGIN
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
    ) RETURNING *;
END;
$$;