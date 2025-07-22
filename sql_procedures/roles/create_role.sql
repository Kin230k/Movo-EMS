CREATE OR REPLACE PROCEDURE create_role(
    p_name VARCHAR(100),
    p_description TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ROLES (name, description) 
    VALUES (p_name, p_description) 
    RETURNING *;
END;
$$;