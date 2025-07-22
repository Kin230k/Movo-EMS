CREATE OR REPLACE FUNCTION get_project_user_authority_by_id(p_project_user_authorities_id UUID)
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
    FROM PROJECT_USER_AUTHORITIES pua
    WHERE pua.projectUserAuthoritiesId = p_project_user_authorities_id;
END;
$$;