CREATE OR REPLACE PROCEDURE create_role(
    p_name JSONB,
    p_description JSONB
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ROLES (roleId,name, description) 
    VALUES (gen_random_uuid(),p_name, p_description) 
    ;
END;
$$;