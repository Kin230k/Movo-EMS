CREATE OR REPLACE FUNCTION get_all_criteria()
RETURNS TABLE (
    criterionId UUID,
    type criteria_operator,
    value VARCHAR(255),
    questionId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_criteria');

RETURN QUERY 
    SELECT 
        c.criterionId,
        c.type,
        c.value,
        c.questionId
    FROM CRITERIA c;
END;
$$;