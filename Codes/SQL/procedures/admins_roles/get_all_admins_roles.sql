CREATE OR REPLACE FUNCTION get_all_admin_roles(p_auth_user_id UUID)
RETURNS TABLE (adminRoleId UUID, adminId UUID, roleId UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_all_admins_roles');
RETURN QUERY
 SELECT ar.adminRoleId, ar.adminId, ar.roleId
 FROM ADMINS_ROLES ar;
END;
$$;