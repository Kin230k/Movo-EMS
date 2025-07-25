CREATE OR REPLACE PROCEDURE update_rule_criterion(
    p_rule_id UUID,
    p_criterion_id UUID,
    p_required BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE RULE_CRITERIA
    SET required = p_required
    WHERE ruleId = p_rule_id AND criterionId = p_criterion_id;
END;
$$;