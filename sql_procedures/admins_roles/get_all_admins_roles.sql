CREATE OR REPLACE FUNCTION get_all_admin_roles()
RETURNS TABLE (adminRoleId UUID, adminId UUID, roleId UUID)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT ar.adminRoleId, ar.adminId, ar.roleId
    FROM ADMINS_ROLES ar;
END;
$$;