CREATE OR REPLACE PROCEDURE update_role_action(p_auth_user_id UUID, 
    p_roleActionsId UUID,
    p_roleId UUID DEFAULT NULL,
    p_actionId UUID DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_role_action');

UPDATE ROLE_ACTIONS
    SET 
        roleId = COALESCE(p_roleId, roleId),
        actionId = COALESCE(p_actionId, actionId)
    WHERE roleActionsId = p_roleActionsId;
    
    -- Check if any row was updated
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Role action with id % not found', p_roleActionsId;
    END IF;
    
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'Invalid roleId or actionId provided';
        WHEN not_null_violation THEN
            RAISE EXCEPTION 'roleId and actionId cannot be NULL';
END;
$$;