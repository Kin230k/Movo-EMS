CREATE OR REPLACE FUNCTION get_options_by_question(p_auth_user_id UUID,p_question_id UUID)
RETURNS TABLE (
    optionId UUID,
    optionText TEXT,  -- Changed from JSONB to TEXT
    questionId UUID,
    isCorrect BOOLEAN,
    displayOrder INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_options_by_question');

RETURN QUERY 
    SELECT 
        o.optionId,
        o.optionText,  -- Now returns TEXT
        o.questionId,
        o.isCorrect,
        o.displayOrder
    FROM OPTIONS o
    WHERE o.questionId = p_question_id;
END;
$$;