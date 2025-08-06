CREATE OR REPLACE FUNCTION get_all_role_actions()
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
    FROM ROLE_ACTIONS ra;
END;
$$;