CREATE OR REPLACE FUNCTION get_all_actions(p_auth_user_id UUID)
RETURNS TABLE (actionId UUID, actionType VARCHAR(100))
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_all_actions');
RETURN QUERY
 SELECT
 a.actionId,
 a.actionType
 FROM ACTIONS a;
END;
$$;