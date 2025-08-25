CREATE OR REPLACE FUNCTION get_all_roles(p_auth_user_id UUID)
RETURNS TABLE (roleId UUID, name JSONB, description JSONB)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_all_roles');

RETURN QUERY
 SELECT r.roleId, r.name, r.description
 FROM ROLES r;
END;
$$;