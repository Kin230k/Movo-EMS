CREATE OR REPLACE FUNCTION get_project_users(
    p_auth_user_id UUID,
    p_project_id UUID
)
RETURNS TABLE (
    userId UUID,
    name JSONB,
    email VARCHAR(255),
    phone VARCHAR(20),
    picture VARCHAR(512),
    role userRole,
    status userStatus,
    hourlyRate NUMERIC(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the caller has permission
    CALL check_user_permission(p_auth_user_id, 'get_project_users');

    -- Return users with their project roles for the given project
    RETURN QUERY
    SELECT 
        u.userId,
        u.name,
        u.email,
        u.phone,
        u.picture,
        u.role,
        u.status,
        r.hourlyRate

    FROM USERS u
    INNER JOIN PROJECT_USER_ROLES pur ON u.userId = pur.userId INNER JOIN rates r on r.userId=u.userId and r.projectId=p_project_id
    WHERE pur.projectId = p_project_id;
END;
$$;