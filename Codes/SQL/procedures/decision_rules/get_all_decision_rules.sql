CREATE OR REPLACE FUNCTION get_all_decision_rules()
RETURNS TABLE (
    ruleId UUID,
    name JSONB,
    description JSONB,
    formId UUID,
    priority INT,
    outcomeOnPass submission_outcome
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_decision_rules');

RETURN QUERY 
    SELECT 
        dr.ruleId,
        dr.name,
        dr.description,
        dr.formId,
        dr.priority,
        dr.outcomeOnPass
    FROM DECISION_RULES dr;
END;
$$;