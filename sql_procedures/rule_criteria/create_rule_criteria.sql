CREATE OR REPLACE PROCEDURE create_rule_criterion(
    p_rule_id UUID,
    p_criterion_id UUID,
    p_required BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO RULE_CRITERIA (
        ruleId, 
        criterionId, 
        required
    ) VALUES (
        p_rule_id,
        p_criterion_id,
        p_required
    ) RETURNING *;
END;
$$;