CREATE OR REPLACE PROCEDURE update_role_action(
    p_roleActionsId UUID,
    p_roleId UUID,
    p_actionId UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ROLE_ACTIONS
    SET 
        roleId = p_roleId,
        actionId = p_actionId
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