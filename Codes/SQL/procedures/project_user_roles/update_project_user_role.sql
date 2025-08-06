CREATE OR REPLACE PROCEDURE update_project_user_role(
    p_project_user_role_id UUID,
    p_user_id UUID,
    p_project_id UUID,
    p_role_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE PROJECT_USER_ROLES
    SET 
        userId = p_user_id,
        projectId = p_project_id,
        roleId = p_role_id
    WHERE projectUserRoleId = p_project_user_role_id;
END;
$$;