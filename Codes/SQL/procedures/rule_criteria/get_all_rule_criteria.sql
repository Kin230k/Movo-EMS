CREATE OR REPLACE FUNCTION get_all_rule_criteria()
RETURNS TABLE (ruleId UUID, criterionId UUID, required BOOLEAN)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_rule_criteria');

RETURN QUERY 
    SELECT 
        rc.ruleId,
        rc.criterionId,
        rc.required
    FROM RULE_CRITERIA rc;
END;
$$;