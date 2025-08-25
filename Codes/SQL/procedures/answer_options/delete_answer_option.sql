CREATE OR REPLACE PROCEDURE delete_answer_option(p_auth_user_id UUID, p_answer_options_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_answer_option');

DELETE FROM ANSWER_OPTIONS
 WHERE answerOptionsId = p_answer_options_id;
END;
$$;