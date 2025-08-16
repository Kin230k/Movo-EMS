CREATE OR REPLACE PROCEDURE delete_admin_role(p_auth_user_id UUID, p_admin_role_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_admins_role');

DELETE FROM ADMINS_ROLES
 WHERE adminRoleId = p_admin_role_id;
END;
$$;