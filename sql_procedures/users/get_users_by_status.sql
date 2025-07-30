CREATE OR REPLACE FUNCTION get_users_by_status(p_status user_status)
RETURNS TABLE (
    userId UUID,
    name JSONB,
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
    WHERE u.status = p_status;
END;
$$;