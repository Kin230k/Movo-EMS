CREATE OR REPLACE FUNCTION get_all_role_actions()
RETURNS TABLE (
    roleActionsId UUID,
    roleId UUID,
    actionId UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_role_actions');

RETURN QUERY 
    SELECT 
        ra.roleActionsId,
        ra.roleId,
        ra.actionId
    FROM ROLE_ACTIONS ra;
END;
$$;