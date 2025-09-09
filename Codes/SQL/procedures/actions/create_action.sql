CREATE OR REPLACE PROCEDURE create_action(p_auth_user_id UUID, p_action_type VARCHAR(100))
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_action');

INSERT INTO ACTIONS (actionId, actionType)
 VALUES (gen_random_uuid(), p_action_type);
END;
$$;