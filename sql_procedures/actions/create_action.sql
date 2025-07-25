CREATE OR REPLACE PROCEDURE create_action(p_action_type VARCHAR(100))
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ACTIONS (actionId, actionType) 
    VALUES (gen_random_uuid(), p_action_type);
END;
$$;