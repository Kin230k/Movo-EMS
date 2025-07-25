CREATE OR REPLACE FUNCTION get_all_user_projects()
RETURNS TABLE (
    userProjectId UUID,
    userId UUID,
    projectId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        up.userProjectId,
        up.userId,
        up.projectId
    FROM USER_PROJECT up;
END;
$$;