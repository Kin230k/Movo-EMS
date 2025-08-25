CREATE OR REPLACE PROCEDURE delete_user(p_auth_user_id UUID, p_user_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_user');

DELETE FROM USERS
 WHERE userId = p_user_id;
END;
$$;