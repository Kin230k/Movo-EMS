CREATE OR REPLACE FUNCTION get_users_by_project(p_auth_user_id UUID, p_project_id UUID)
RETURNS TABLE (
    userProjectId UUID,
    userId UUID,
    projectId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_users_by_project');

    RETURN QUERY 
    SELECT 
        up.userProjectId,
        up.userId,
        up.projectId
    FROM USER_PROJECT up
    WHERE up.projectId = p_project_id;
END;
$$;