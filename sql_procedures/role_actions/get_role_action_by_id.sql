CREATE OR REPLACE FUNCTION get_role_action_by_id(
    p_roleActionsId UUID
)
RETURNS TABLE (
    roleActionsId UUID,
    roleId UUID,
    actionId UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        ra.roleActionsId,
        ra.roleId,
        ra.actionId
    FROM ROLE_ACTIONS ra
    WHERE ra.roleActionsId = p_roleActionsId;
END;
$$;