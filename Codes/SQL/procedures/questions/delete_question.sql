CREATE OR REPLACE PROCEDURE delete_question(p_auth_user_id UUID, p_question_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_question');

DELETE FROM QUESTIONS
    WHERE questionId = p_question_id;
END;
$$;