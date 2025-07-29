CREATE OR REPLACE PROCEDURE update_decision_rule(
    p_rule_id UUID,
    p_name JSONB,
    p_description JSONB,
    p_form_id UUID,
    p_priority INT,
    p_outcome_on_pass submission_outcome
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Validate priority
    IF p_priority < 0 THEN
        RAISE EXCEPTION 'Priority cannot be negative (provided: %)', p_priority;
    END IF;

    UPDATE DECISION_RULES
    SET 
        name = p_name,
        description = p_description,
        formId = p_form_id,
        priority = p_priority,
        outcomeOnPass = p_outcome_on_pass
    WHERE ruleId = p_rule_id;
END;
$$;