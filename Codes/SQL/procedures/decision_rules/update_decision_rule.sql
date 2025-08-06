CREATE OR REPLACE PROCEDURE update_decision_rule(p_auth_user_id UUID, 
    p_rule_id UUID,
    p_name JSONB DEFAULT NULL,
    p_description JSONB DEFAULT NULL,
    p_form_id UUID DEFAULT NULL,
    p_priority INT DEFAULT NULL,
    p_outcome_on_pass submission_outcome DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_decision_rule');

-- Validate priority only when provided
    IF p_priority IS NOT NULL AND p_priority < 0 THEN
        RAISE EXCEPTION 'Priority cannot be negative (provided: %)', p_priority;
    END IF;

    UPDATE DECISION_RULES
    SET 
        name = COALESCE(p_name, name),
        description = COALESCE(p_description, description),
        formId = COALESCE(p_form_id, formId),
        priority = COALESCE(p_priority, priority),
        outcomeOnPass = COALESCE(p_outcome_on_pass, outcomeOnPass)
    WHERE ruleId = p_rule_id;
END;
$$;