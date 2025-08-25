CREATE OR REPLACE FUNCTION get_role_action_by_id(p_auth_user_id UUID,
 p_roleActionsId UUID
)
RETURNS TABLE (
 roleActionsId UUID,
 roleId UUID,
 actionId UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_role_action_by_id');

RETURN QUERY
 SELECT
 ra.roleActionsId,
 ra.roleId,
 ra.actionId
 FROM ROLE_ACTIONS ra
 WHERE ra.roleActionsId = p_roleActionsId;
END;
$$;