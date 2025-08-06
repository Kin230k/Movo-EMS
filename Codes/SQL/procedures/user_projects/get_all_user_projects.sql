CREATE OR REPLACE FUNCTION get_all_user_projects()
RETURNS TABLE (
    userProjectId UUID,
    userId UUID,
    projectId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_user_projects');

RETURN QUERY 
    SELECT 
        up.userProjectId,
        up.userId,
        up.projectId
    FROM USER_PROJECT up;
END;
$$;