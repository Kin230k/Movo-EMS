CREATE OR REPLACE FUNCTION create_answer(
    p_submission_id UUID,
    p_question_id   UUID,
    p_answered_at   TIMESTAMP
)
RETURNS TABLE (
    answerId      UUID,
    submissionId  UUID,
    questionId    UUID,
    answeredAt    TIMESTAMP
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_answer');

IF p_submission_id IS NULL THEN
        RAISE EXCEPTION 'Submission ID cannot be null';
    END IF;
    IF p_question_id IS NULL THEN
        RAISE EXCEPTION 'Question ID cannot be null';
    END IF;

    RETURN QUERY
    INSERT INTO ANSWERS (answerId, submissionId, questionId, answeredAt)
    VALUES (gen_random_uuid(), p_submission_id, p_question_id, p_answered_at)
    RETURNING answerId, submissionId, questionId, answeredAt;
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'Invalid submissionId or questionId';
    WHEN not_null_violation THEN
        RAISE EXCEPTION 'Required fields cannot be null';
END;
$$;