CREATE OR REPLACE PROCEDURE delete_role(p_auth_user_id UUID, p_role_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_role');

DELETE FROM ROLES
    WHERE roleId = p_role_id;
END;
$$;