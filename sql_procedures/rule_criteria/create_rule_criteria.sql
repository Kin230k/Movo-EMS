CREATE OR REPLACE PROCEDURE create_rule_criterion(
    IN p_ruleId UUID,
    IN p_criterionId UUID,
    IN p_required BOOLEAN DEFAULT TRUE
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate existence of ruleId and criterionId first
    IF NOT EXISTS (SELECT 1 FROM DECISION_RULES WHERE ruleId = p_ruleId) THEN
        RAISE EXCEPTION 'Invalid ruleId: % does not exist in DECISION_RULES', p_ruleId;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CRITERIA WHERE criterionId = p_criterionId) THEN
        RAISE EXCEPTION 'Invalid criterionId: % does not exist in CRITERIA', p_criterionId;
    END IF;

    -- Insert into RULE_CRITERIA
    INSERT INTO RULE_CRITERIA (
        ruleId,
        criterionId,
        required
    ) VALUES (
        p_ruleId,
        p_criterionId,
        p_required
    );
    
    EXCEPTION
        WHEN unique_violation THEN
            RAISE EXCEPTION 'Rule-Criterion association already exists (ruleId: %, criterionId: %)', p_ruleId, p_criterionId;
END;
$$;