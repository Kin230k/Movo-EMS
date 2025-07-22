CREATE OR REPLACE FUNCTION get_users_by_project(p_project_id UUID)
RETURNS TABLE (
    userId UUID,
    name VARCHAR(100),
    email VARCHAR(255),
    role user_role
) LANGUAGE plpgsql AS $$
BEGIN
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