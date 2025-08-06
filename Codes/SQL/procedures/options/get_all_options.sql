CREATE OR REPLACE FUNCTION get_all_options()
RETURNS TABLE (
    optionId UUID,
    optionText JSONB,
    questionId UUID,
    isCorrect BOOLEAN,
    displayOrder INT
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_options');

RETURN QUERY 
    SELECT 
        o.optionId,
        o.optionText,
        o.questionId,
        o.isCorrect,
        o.displayOrder
    FROM OPTIONS o;
END;
$$;