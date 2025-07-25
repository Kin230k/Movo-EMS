CREATE OR REPLACE PROCEDURE delete_role(p_role_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ROLES
    WHERE roleId = p_role_id;
END;
$$;