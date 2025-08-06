CREATE OR REPLACE FUNCTION get_project_user_role_by_id(p_project_user_role_id UUID)
RETURNS TABLE (projectUserRoleId UUID, userId UUID, projectId UUID, roleId UUID)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT pur.projectUserRoleId, pur.userId, pur.projectId, pur.roleId
    FROM PROJECT_USER_ROLES pur
    WHERE pur.projectUserRoleId = p_project_user_role_id;
END;
$$;