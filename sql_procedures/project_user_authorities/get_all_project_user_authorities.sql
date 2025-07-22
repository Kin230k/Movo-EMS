CREATE OR REPLACE FUNCTION get_all_project_user_authorities()
RETURNS TABLE (
    projectUserAuthoritiesId UUID,
    userId UUID,
    projectId UUID,
    authorityId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        pua.projectUserAuthoritiesId,
        pua.userId,
        pua.projectId,
        pua.authorityId
    FROM PROJECT_USER_AUTHORITIES pua;
END;
$$;