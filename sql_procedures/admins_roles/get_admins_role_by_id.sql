CREATE OR REPLACE FUNCTION get_admin_role_by_id(p_admin_role_id UUID)
RETURNS TABLE (adminRoleId UUID, adminId UUID, roleId UUID)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT ar.adminRoleId, ar.adminId, ar.roleId
    FROM ADMINS_ROLES ar
    WHERE ar.adminRoleId = p_admin_role_id;
END;
$$;