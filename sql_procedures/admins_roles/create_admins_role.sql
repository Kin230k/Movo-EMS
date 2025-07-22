CREATE OR REPLACE PROCEDURE create_admin_role(
    p_admin_id UUID,
    p_role_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ADMINS_ROLES (adminId, roleId) 
    VALUES (p_admin_id, p_role_id) 
    RETURNING *;
END;
$$;