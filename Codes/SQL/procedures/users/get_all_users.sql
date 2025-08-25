CREATE OR REPLACE FUNCTION get_all_users(p_auth_user_id UUID)
RETURNS TABLE (
    userId UUID,
    name JSONB,
    email VARCHAR(255),
    phone VARCHAR(20),
    picture VARCHAR(512)
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_users');

RETURN QUERY 
    SELECT 
        u.userId,
        u.name,
        u.email,
        u.phone,
        u.picture
    FROM USERS u;
END;
$$;