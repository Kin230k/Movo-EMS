CREATE OR REPLACE PROCEDURE delete_decision_rule(p_auth_user_id UUID, p_rule_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_decision_rule');

DELETE FROM DECISION_RULES
 WHERE ruleId = p_rule_id;
END;
$$;