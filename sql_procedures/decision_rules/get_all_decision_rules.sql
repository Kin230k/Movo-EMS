CREATE OR REPLACE FUNCTION get_all_decision_rules()
RETURNS TABLE (
    ruleId UUID,
    name VARCHAR(100),
    description TEXT,
    formId UUID,
    priority INT,
    outcomeOnPass submission_outcome,
    outcomeOnFail submission_outcome
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        dr.ruleId,
        dr.name,
        dr.description,
        dr.formId,
        dr.priority,
        dr.outcomeOnPass,
        dr.outcomeOnFail
    FROM DECISION_RULES dr;
END;
$$;