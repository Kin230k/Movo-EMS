CREATE OR REPLACE FUNCTION get_decision_rule_by_id(p_auth_user_id UUID,p_rule_id UUID)
RETURNS TABLE (
    ruleId UUID,
    name JSONB,
    description JSONB,
    formId UUID,
    priority INT,
    outcomeOnPass submission_outcome
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_decision_rule_by_id');

RETURN QUERY 
    SELECT 
        dr.ruleId,
        dr.name,
        dr.description,
        dr.formId,
        dr.priority,
        dr.outcomeOnPass::submission_outcome
    FROM DECISION_RULES dr
    WHERE dr.ruleId = p_rule_id;
END;
$$;