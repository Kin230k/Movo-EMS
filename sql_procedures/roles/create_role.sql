CREATE OR REPLACE PROCEDURE create_role(
    p_name JSONB,
    p_description JSONB
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ROLES (name, description) 
    VALUES (p_name, p_description) 
    RETURNING *;
END;
$$;