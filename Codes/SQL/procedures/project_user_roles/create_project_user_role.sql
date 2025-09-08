CREATE OR REPLACE PROCEDURE create_project_user_role(p_auth_user_id UUID,
 p_user_id UUID,
 p_project_id UUID,
 p_role_id UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    role_name VARCHAR(20);
    new_created_at TIMESTAMP := CURRENT_TIMESTAMP;
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_project_user_role');

SELECT name->>'en' INTO role_name
   FROM ROLES 
    WHERE roleId = p_role_id;

INSERT INTO PROJECT_USER_ROLES (projectUserRoleId,userId, projectId, roleId, createdAt, updatedAt)
 VALUES (gen_random_uuid(),p_user_id, p_project_id, p_role_id,new_created_at,new_created_at);

UPDATE USERS
    SET role = role_name::user_role
    WHERE userId = p_user_id;
END;
$$;
