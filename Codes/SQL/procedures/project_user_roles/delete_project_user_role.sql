CREATE OR REPLACE PROCEDURE delete_project_user_role(p_project_user_role_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM PROJECT_USER_ROLES
    WHERE projectUserRoleId = p_project_user_role_id;
END;
$$;