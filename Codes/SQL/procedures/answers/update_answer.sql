CREATE OR REPLACE PROCEDURE update_answer(p_auth_user_id UUID,
 p_answer_id UUID,
 p_submission_id UUID DEFAULT NULL,
 p_question_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_answer');

-- Validate inputs only when provided
 IF p_answer_id IS NULL THEN
 RAISE EXCEPTION 'Answer ID cannot be null';
 END IF;

 UPDATE ANSWERS
 SET
 submissionId = COALESCE(p_submission_id, submissionId),
 questionId = COALESCE(p_question_id, questionId)
 WHERE answerId = p_answer_id;

 EXCEPTION
 WHEN foreign_key_violation THEN
 RAISE EXCEPTION 'Invalid submissionId or questionId';
 WHEN not_null_violation THEN
 RAISE EXCEPTION 'Required fields cannot be null';
END;
$$;