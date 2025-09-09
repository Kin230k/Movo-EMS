CREATE OR REPLACE FUNCTION get_user_by_id(p_auth_user_id UUID, p_user_id UUID)
RETURNS TABLE (
    userId UUID,
    name JSONB,
    email VARCHAR(255),
    phone VARCHAR(20),
    picture VARCHAR(512),
    role user_role,
    status user_status,
    twoFaEnabled BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_user_by_id');

    RETURN QUERY
    SELECT 
        u.userId,
        u.name,
        u.email,
        u.phone,
        u.picture,
        u.role::user_role,     -- cast here
        u.status::user_status, -- cast here (if needed)
        u.twoFaEnabled
    FROM users u
    WHERE u.userId = p_user_id;
END;
$$;
