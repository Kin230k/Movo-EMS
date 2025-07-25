CREATE OR REPLACE PROCEDURE delete_admin_role(p_admin_role_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ADMINS_ROLES
    WHERE adminRoleId = p_admin_role_id;
END;
$$;