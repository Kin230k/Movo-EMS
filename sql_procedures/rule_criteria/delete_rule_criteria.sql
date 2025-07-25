CREATE OR REPLACE PROCEDURE delete_rule_criterion(
    p_rule_id UUID,
    p_criterion_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM RULE_CRITERIA
    WHERE ruleId = p_rule_id AND criterionId = p_criterion_id;
END;
$$;