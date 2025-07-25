CREATE OR REPLACE FUNCTION get_decision_rule_by_id(p_rule_id UUID)
RETURNS TABLE (
    ruleId UUID,
    name JSONB,
    description JSONB,
    formId UUID,
    priority INT,
    outcomeOnPass submission_outcome
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        dr.ruleId,
        dr.name,
        dr.description,
        dr.formId,
        dr.priority,
        dr.outcomeOnPass
    FROM DECISION_RULES dr
    WHERE dr.ruleId = p_rule_id;
END;
$$;