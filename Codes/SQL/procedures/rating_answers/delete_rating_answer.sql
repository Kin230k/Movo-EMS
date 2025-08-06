CREATE OR REPLACE PROCEDURE delete_rating_answer(p_auth_user_id UUID, p_answer_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_rating_answer');

DELETE FROM RATING_ANSWERS
    WHERE answerId = p_answer_id;
END;
$$;