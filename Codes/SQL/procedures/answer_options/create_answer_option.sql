CREATE OR REPLACE FUNCTION create_answer_option(
 p_answer_id UUID,
 p_option_id UUID
)
RETURNS TABLE (
 answerOptionsId UUID,
 answerId UUID,
 optionId UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_answer_option');

RETURN QUERY
 INSERT INTO ANSWER_OPTIONS (answerId, optionId)
 VALUES (p_answer_id, p_option_id)
 RETURNING answerOptionsId, answerId, optionId;
END;
$$;