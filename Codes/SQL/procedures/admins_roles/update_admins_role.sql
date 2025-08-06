CREATE OR REPLACE PROCEDURE update_admin_role(p_auth_user_id UUID, 
    p_admin_role_id UUID,
    p_admin_id UUID DEFAULT NULL,
    p_role_id UUID DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_admins_role');

UPDATE ADMINS_ROLES
    SET 
        adminId = COALESCE(p_admin_id, adminId),
        roleId = COALESCE(p_role_id, roleId)
    WHERE adminRoleId = p_admin_role_id;
END;
$$;