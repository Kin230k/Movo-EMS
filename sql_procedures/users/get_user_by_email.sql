CREATE OR REPLACE FUNCTION get_user_by_email(p_email VARCHAR(255))
RETURNS TABLE (
    userId UUID,
    name VARCHAR(100),
    phone VARCHAR(20),
    picture VARCHAR(512),
    role user_role,
    status user_status
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        u.userId,
        u.name,
        u.phone,
        u.picture,
        u.role,
        u.status
    FROM USERS u
    WHERE u.email = p_email;
END;
$$;