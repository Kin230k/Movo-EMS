CREATE OR REPLACE FUNCTION get_users_by_role(p_role user_role)
RETURNS TABLE (
    userId UUID,
    name JSONB,
    email VARCHAR(255),
    status user_status
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_users_by_role');

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