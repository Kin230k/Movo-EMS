CREATE OR REPLACE FUNCTION get_role_by_id(p_role_id UUID)
RETURNS TABLE (roleId UUID, name JSONB, description JSONB)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_role_by_id');

RETURN QUERY 
    SELECT r.roleId, r.name, r.description
    FROM ROLES r
    WHERE r.roleId = p_role_id;
END;
$$;