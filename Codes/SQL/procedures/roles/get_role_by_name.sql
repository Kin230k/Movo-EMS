CREATE OR REPLACE FUNCTION get_role_by_name(p_auth_user_id UUID,p_name TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_role_id UUID;
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_role_by_name');


 SELECT r.roleId into v_role_id
 FROM ROLES r
 WHERE r.name->>'en' = p_name; 
 RETURN v_role_id;
END;
$$;