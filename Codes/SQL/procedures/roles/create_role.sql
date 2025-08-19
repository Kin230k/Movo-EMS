CREATE OR REPLACE PROCEDURE create_role(p_auth_user_id UUID,
 p_name JSONB,
 p_description JSONB
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_role');

INSERT INTO ROLES (roleId,name, description)
 VALUES (gen_random_uuid(),p_name, p_description)
;
END;
$$;