CREATE OR REPLACE PROCEDURE update_role(
    p_role_id UUID,
    p_name JSONB,
    p_description JSONB
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ROLES
    SET 
        name = p_name,
        description = p_description
    WHERE roleId = p_role_id;
END;
$$;