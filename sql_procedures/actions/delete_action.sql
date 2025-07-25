CREATE OR REPLACE PROCEDURE delete_action(p_action_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ACTIONS
    WHERE actionId = p_action_id;
END;
$$;