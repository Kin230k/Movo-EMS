CREATE OR REPLACE FUNCTION get_rule_criterion_by_id(
    p_rule_id UUID,
    p_criterion_id UUID
)
RETURNS TABLE (ruleId UUID, criterionId UUID, required BOOLEAN)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_rule_criteria_by_id');

RETURN QUERY 
    SELECT 
        rc.ruleId,
        rc.criterionId,
        rc.required
    FROM RULE_CRITERIA rc
    WHERE rc.ruleId = p_rule_id AND rc.criterionId = p_criterion_id;
END;
$$;