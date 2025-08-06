CREATE OR REPLACE PROCEDURE create_admin_role(p_auth_user_id UUID, 
    p_admin_id UUID,
    p_role_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_admins_role');

INSERT INTO ADMINS_ROLES (adminRoleId,adminId, roleId) 
    VALUES (gen_random_uuid(),p_admin_id, p_role_id) 
    ;
END;
$$;