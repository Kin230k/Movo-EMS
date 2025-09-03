CREATE OR REPLACE PROCEDURE update_project_user_role_by_user_and_project(p_auth_user_id UUID,
 p_user_id UUID,
 p_project_id UUID,
 p_role_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    role_name VARCHAR(20);
    new_updated_at TIMESTAMP := CURRENT_TIMESTAMP;
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_project_user_role_by_user_and_project');

 SELECT name->>'en' INTO role_name
   FROM ROLES 
    WHERE roleId = p_role_id;

UPDATE PROJECT_USER_ROLES
 SET
 roleId = COALESCE(p_role_id, roleId),
 updatedAt=new_updated_at
 WHERE userId = p_user_id and projectId=p_project_id;

 UPDATE USERS
    SET role = role_name::user_role
    WHERE userId = p_user_id;
END;
$$;