CREATE OR REPLACE FUNCTION get_projects_by_user(p_auth_user_id UUID, p_user_id UUID)
RETURNS TABLE (
    userProjectId UUID,
    userId UUID,
    projectId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_projects_by_user');

    RETURN QUERY 
    SELECT 
        up.userProjectId,
        up.userId,
        up.projectId
    FROM USER_PROJECT up
    WHERE up.userId = p_user_id;
END;
$$;