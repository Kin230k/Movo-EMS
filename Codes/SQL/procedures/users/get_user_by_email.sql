CREATE OR REPLACE FUNCTION get_user_by_email(p_auth_user_id UUID,p_email VARCHAR(255))
RETURNS TABLE (
    userId UUID,
    name JSONB,
    phone VARCHAR(20),
    picture VARCHAR(512),
    role user_role,
    status user_status
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_user_by_email');

RETURN QUERY 
    SELECT 
        u.userId,
        u.name,
        u.phone,
        u.picture,
        u.role::user_role,
        u.status::user_status
    FROM USERS u
    WHERE u.email = p_email;
END;
$$;