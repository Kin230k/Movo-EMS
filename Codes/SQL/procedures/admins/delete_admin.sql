CREATE OR REPLACE PROCEDURE delete_admin(p_auth_user_id UUID, p_admin_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_admin');

DELETE FROM ADMINS
 WHERE adminId = p_admin_id;
END;
$$;