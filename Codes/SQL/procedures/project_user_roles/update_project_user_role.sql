CREATE OR REPLACE PROCEDURE update_project_user_role(p_auth_user_id UUID,
 p_project_user_role_id UUID,
 p_user_id UUID DEFAULT NULL,
 p_project_id UUID DEFAULT NULL,
 p_role_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_project_user_role');

UPDATE PROJECT_USER_ROLES
 SET
 userId = COALESCE(p_user_id, userId),
 projectId = COALESCE(p_project_id, projectId),
 roleId = COALESCE(p_role_id, roleId)
 WHERE projectUserRoleId = p_project_user_role_id;
END;
$$;