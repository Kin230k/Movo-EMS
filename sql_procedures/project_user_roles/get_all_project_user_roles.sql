CREATE OR REPLACE FUNCTION get_all_project_user_roles()
RETURNS TABLE (
  projectUserRoleId UUID,
  userId             UUID,
  projectId          UUID,
  roleId             UUID
)

LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT pur.projectUserRoleId, pur.userId, pur.projectId, pur.roleId
    FROM PROJECT_USER_ROLES pur;
END;
$$;