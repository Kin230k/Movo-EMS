CREATE OR REPLACE PROCEDURE update_user_project(p_auth_user_id UUID,
 p_user_project_id UUID,
 p_user_id UUID DEFAULT NULL,
 p_project_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_user_project');

UPDATE USER_PROJECT
 SET
 userId = COALESCE(p_user_id, userId),
 projectId = COALESCE(p_project_id, projectId)
 WHERE userProjectId = p_user_project_id;
END;
$$;