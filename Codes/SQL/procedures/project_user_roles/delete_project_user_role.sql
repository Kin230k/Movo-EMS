CREATE OR REPLACE PROCEDURE delete_project_user_role(p_auth_user_id UUID, p_project_user_role_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_project_user_role');

DELETE FROM PROJECT_USER_ROLES
    WHERE projectUserRoleId = p_project_user_role_id;
END;
$$;