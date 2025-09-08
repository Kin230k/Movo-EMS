CREATE OR REPLACE FUNCTION get_user_role_by_id(
    p_auth_user_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    role user_role
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Ensure caller has permission to read user role
    CALL check_user_permission(p_auth_user_id, 'get_user_role_by_id');

    RETURN QUERY
    SELECT u.role::user_role
    FROM USERS u
    WHERE u.userId = p_user_id;
END;
$$;


