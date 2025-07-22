CREATE OR REPLACE PROCEDURE update_action(
    p_action_id UUID,
    p_action_type VARCHAR(100)
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ACTIONS
    SET actionType = p_action_type
    WHERE actionId = p_action_id;
END;
$$;