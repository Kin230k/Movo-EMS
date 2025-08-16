CREATE OR REPLACE PROCEDURE update_rule_criterion(p_auth_user_id UUID,
 p_rule_id UUID,
 p_criterion_id UUID DEFAULT NULL,
 p_required BOOLEAN DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_rule_criteria');

UPDATE RULE_CRITERIA
 SET
 criterionId = COALESCE(p_criterion_id, criterionId),
 required = COALESCE(p_required, required)
 WHERE ruleId = p_rule_id;
END;
$$;