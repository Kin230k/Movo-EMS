CREATE OR REPLACE PROCEDURE update_action(p_auth_user_id UUID,
 p_action_id UUID,
 p_action_type VARCHAR(100) DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_action');

UPDATE ACTIONS
 SET actionType = COALESCE(p_action_type, actionType)
 WHERE actionId = p_action_id;
END;
$$;