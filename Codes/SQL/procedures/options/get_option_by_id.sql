CREATE OR REPLACE FUNCTION get_option_by_id(p_auth_user_id UUID,p_option_id UUID)
RETURNS TABLE (
    optionId UUID,
    optionText TEXT,  -- Changed from JSONB to TEXT
    questionId UUID,
    isCorrect BOOLEAN,
    displayOrder INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_option_by_id');

RETURN QUERY 
    SELECT 
        o.optionId,
        o.optionText,  -- Now returns TEXT
        o.questionId,
        o.isCorrect,
        o.displayOrder
    FROM OPTIONS o
    WHERE o.optionId = p_option_id;
END;
$$;