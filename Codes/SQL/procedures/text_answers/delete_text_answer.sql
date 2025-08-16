CREATE OR REPLACE PROCEDURE delete_text_answer(p_auth_user_id UUID, p_answer_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_text_answer');

DELETE FROM TEXT_ANSWERS
 WHERE answerId = p_answer_id;
END;
$$;