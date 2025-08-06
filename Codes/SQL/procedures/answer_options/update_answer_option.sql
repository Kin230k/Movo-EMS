CREATE OR REPLACE PROCEDURE update_answer_option(p_auth_user_id UUID, 
    p_answer_options_id UUID,
    p_answer_id UUID DEFAULT NULL,
    p_option_id UUID DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_answer_option');

UPDATE ANSWER_OPTIONS
    SET 
        answerId = COALESCE(p_answer_id, answerId),
        optionId = COALESCE(p_option_id, optionId)
    WHERE answerOptionsId = p_answer_options_id;
END;
$$;