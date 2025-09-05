CREATE OR REPLACE PROCEDURE delete_project_user_role_by_user_project(p_auth_user_id UUID, p_project_id UUID,p_user_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_project_user_role_by_user_project');
 
 UPDATE USERS
    SET role = 'User'::user_role
    WHERE userId =  UUID;

DELETE FROM PROJECT_USER_ROLES
 WHERE projectId = p_project_id and userId= UUID;
END;
$$;