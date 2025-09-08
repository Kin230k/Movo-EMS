CREATE OR REPLACE FUNCTION get_project_user_roles_by_user_and_project(
    p_auth_user_id UUID,
    p_user_id UUID,
    p_project_id UUID
)
RETURNS TABLE (
    projectUserRoleId UUID,
    userId UUID,
    projectId UUID,
    roleId UUID,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the caller has permission
    CALL check_user_permission(p_auth_user_id, 'get_project_user_roles_by_user_and_project');

    -- Return roles for the given user and project
    RETURN QUERY
    SELECT pur.projectUserRoleId, pur.userId, pur.projectId, pur.roleId,pur.createdAt, pur.updatedAt
    FROM PROJECT_USER_ROLES pur
    WHERE pur.userId = p_user_id
      AND pur.projectId = p_project_id;
END;
$$;
