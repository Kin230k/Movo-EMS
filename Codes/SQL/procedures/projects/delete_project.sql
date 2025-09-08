CREATE OR REPLACE PROCEDURE delete_project(p_auth_user_id UUID, p_project_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_project');

DELETE FROM PROJECTS
 WHERE projectId = p_project_id;
END;
$$;