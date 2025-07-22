CREATE OR REPLACE PROCEDURE create_action(p_action_type VARCHAR(100))
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ACTIONS (actionType) 
    VALUES (p_action_type) 
    RETURNING *;
END;
$$;