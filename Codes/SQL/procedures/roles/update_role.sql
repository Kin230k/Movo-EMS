CREATE OR REPLACE PROCEDURE update_role(p_auth_user_id UUID,
 p_role_id UUID,
 p_name JSONB DEFAULT NULL,
 p_description JSONB DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_role');

UPDATE ROLES
 SET
 name = COALESCE(p_name, name),
 description = COALESCE(p_description, description)
 WHERE roleId = p_role_id;
END;
$$;