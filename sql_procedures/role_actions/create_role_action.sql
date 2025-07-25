CREATE OR REPLACE PROCEDURE create_role_action(
    p_roleId UUID,
    p_actionId UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ROLE_ACTIONS (
        roleActionsId,
        roleId,
        actionId
    ) VALUES (
        gen_random_uuid(),  -- Auto-generate UUID
        p_roleId,
        p_actionId
    );
END;
$$;