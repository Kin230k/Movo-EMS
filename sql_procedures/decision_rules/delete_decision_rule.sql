CREATE OR REPLACE PROCEDURE delete_decision_rule(p_rule_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM DECISION_RULES
    WHERE ruleId = p_rule_id;
END;
$$;