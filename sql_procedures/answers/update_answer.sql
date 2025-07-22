CREATE OR REPLACE PROCEDURE update_answer(
    p_answer_id UUID,
    p_submission_id UUID,
    p_question_id UUID,
    p_answered_at TIMESTAMP
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ANSWERS
    SET 
        submissionId = p_submission_id,
        questionId = p_question_id,
        answeredAt = p_answered_at
    WHERE answerId = p_answer_id;
END;
$$;