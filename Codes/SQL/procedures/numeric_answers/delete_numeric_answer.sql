CREATE OR REPLACE PROCEDURE delete_numeric_answer(p_auth_user_id UUID, p_answer_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_numeric_answer');

DELETE FROM NUMERIC_ANSWERS
    WHERE answerId = p_answer_id;
END;
$$;