CREATE OR REPLACE FUNCTION get_action_by_id(p_action_id UUID)
RETURNS TABLE (actionId UUID, actionType VARCHAR(100))
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_action_by_id');

RETURN QUERY 
    SELECT 
        a.actionId,
        a.actionType
    FROM ACTIONS a
    WHERE a.actionId = p_action_id;
END;
$$;