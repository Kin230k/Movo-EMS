CREATE OR REPLACE PROCEDURE create_project_user_role(
    p_user_id UUID,
    p_project_id UUID,
    p_role_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO PROJECT_USER_ROLES (projectUserRoleId,userId, projectId, roleId) 
    VALUES (gen_random_uuid(),p_user_id, p_project_id, p_role_id) 
    ;
END;
$$;