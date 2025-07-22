CREATE OR REPLACE FUNCTION get_users_by_role(p_role user_role)
RETURNS TABLE (
    userId UUID,
    name VARCHAR(100),
    email VARCHAR(255),
    status user_status
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        u.userId,
        u.name,
        u.email,
        u.status
    FROM USERS u
    WHERE u.role = p_role;
END;
$$;