CREATE OR REPLACE FUNCTION get_all_answer_options()
RETURNS TABLE (
    answerOptionsId UUID,
    answerId UUID,
    optionId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_answer_options');

RETURN QUERY 
    SELECT 
        ao.answerOptionsId,
        ao.answerId,
        ao.optionId
    FROM ANSWER_OPTIONS ao;
END;
$$;