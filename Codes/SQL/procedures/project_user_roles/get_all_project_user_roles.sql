CREATE OR REPLACE FUNCTION get_all_project_user_roles(p_auth_user_id UUID)
RETURNS TABLE (
 projectUserRoleId UUID,
 userId UUID,
 projectId UUID,
 roleId UUID,
 createdAt TIMESTAMP,    
 updatedAt TIMESTAMP
)

LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_all_project_user_roles');

RETURN QUERY
 SELECT pur.projectUserRoleId, pur.userId, pur.projectId, pur.roleId,pur.createdAt, pur.updatedAt
 FROM PROJECT_USER_ROLES pur;
END;
$$;