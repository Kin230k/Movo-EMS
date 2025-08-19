CREATE OR REPLACE PROCEDURE delete_rule_criterion(p_auth_user_id UUID,
 p_rule_id UUID,
 p_criterion_id UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_rule_criteria');

DELETE FROM RULE_CRITERIA
 WHERE ruleId = p_rule_id AND criterionId = p_criterion_id;
END;
$$;