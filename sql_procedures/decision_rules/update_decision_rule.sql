CREATE OR REPLACE PROCEDURE update_decision_rule(
    p_rule_id UUID,
    p_name VARCHAR(100),
    p_description TEXT,
    p_form_id UUID,
    p_priority INT,
    p_outcome_on_pass submission_outcome,
    p_outcome_on_fail submission_outcome
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE DECISION_RULES
    SET 
        name = p_name,
        description = p_description,
        formId = p_form_id,
        priority = p_priority,
        outcomeOnPass = p_outcome_on_pass,
        outcomeOnFail = p_outcome_on_fail
    WHERE ruleId = p_rule_id;
END;
$$;