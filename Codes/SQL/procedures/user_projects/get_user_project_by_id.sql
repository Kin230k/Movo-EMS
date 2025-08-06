CREATE OR REPLACE FUNCTION get_user_project_by_id(p_user_project_id UUID)
RETURNS TABLE (
    userProjectId UUID,
    userId UUID,
 projectId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_user_project_by_id');

RETURN QUERY 
    SELECT 
        up.userProjectId,
        up.userId,
        up.projectId
    FROM USER_PROJECT up
    WHERE up.userProjectId = p_user_project_id;
END;
$$;