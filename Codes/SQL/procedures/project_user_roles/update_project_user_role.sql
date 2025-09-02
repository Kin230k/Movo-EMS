CREATE OR REPLACE PROCEDURE update_project_user_role(p_auth_user_id UUID,
 p_project_user_role_id UUID,
 p_user_id UUID DEFAULT NULL,
 p_project_id UUID DEFAULT NULL,
 p_role_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    role_name VARCHAR(20);
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_project_user_role');

 SELECT name->>'en' INTO role_name
   FROM ROLES 
    WHERE roleId = p_role_id;

UPDATE PROJECT_USER_ROLES
 SET
 userId = COALESCE(p_user_id, userId),
 projectId = COALESCE(p_project_id, projectId),
 roleId = COALESCE(p_role_id, roleId)
 WHERE projectUserRoleId = p_project_user_role_id;

 UPDATE USERS
    SET role = role_name::user_role
    WHERE userId = p_user_id;
END;
$$;