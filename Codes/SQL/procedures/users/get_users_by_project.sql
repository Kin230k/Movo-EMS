CREATE OR REPLACE FUNCTION get_users_by_project(p_auth_user_id UUID,p_project_id UUID)
RETURNS TABLE (
    userId UUID,
    name JSONB,
    email VARCHAR(255),
    role user_role
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_users_by_project');

RETURN QUERY 
    SELECT 
        u.userId,
        u.name,
        u.email,
        u.role
    FROM USERS u
    JOIN USER_PROJECT up ON u.userId = up.userId
    WHERE up.projectId = p_project_id;
END;
$$;