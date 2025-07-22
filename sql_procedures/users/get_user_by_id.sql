CREATE OR REPLACE FUNCTION get_user_by_id(p_user_id UUID)
RETURNS TABLE (
    userId UUID,
    name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    picture VARCHAR(512),
    role user_role,
    status user_status,
    twoFaEnabled BOOLEAN
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        u.userId,
        u.name,
        u.email,
        u.phone,
        u.picture,
        u.role,
        u.status,
        u.twoFaEnabled
    FROM USERS u
    WHERE u.userId = p_user_id;
END;
$$;