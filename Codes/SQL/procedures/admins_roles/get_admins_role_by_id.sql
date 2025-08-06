CREATE OR REPLACE FUNCTION get_admin_role_by_id(p_admin_role_id UUID)
RETURNS TABLE (adminRoleId UUID, adminId UUID, roleId UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_admins_role_by_id');

RETURN QUERY 
    SELECT ar.adminRoleId, ar.adminId, ar.roleId
    FROM ADMINS_ROLES ar
    WHERE ar.adminRoleId = p_admin_role_id;
END;
$$;