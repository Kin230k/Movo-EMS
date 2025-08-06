CREATE OR REPLACE PROCEDURE delete_action(p_auth_user_id UUID, p_action_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_action');

DELETE FROM ACTIONS
    WHERE actionId = p_action_id;
END;
$$;