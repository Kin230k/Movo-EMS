CREATE OR REPLACE PROCEDURE update_admin_role(
    p_admin_role_id UUID,
    p_admin_id UUID,
    p_role_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ADMINS_ROLES
    SET 
        adminId = p_admin_id,
        roleId = p_role_id
    WHERE adminRoleId = p_admin_role_id;
END;
$$;