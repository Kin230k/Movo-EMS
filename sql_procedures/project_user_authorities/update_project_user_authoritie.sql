CREATE OR REPLACE PROCEDURE update_project_user_authority(
    p_project_user_authorities_id UUID,
    p_user_id UUID,
    p_project_id UUID,
    p_authority_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE PROJECT_USER_AUTHORITIES
    SET 
        userId = p_user_id,
        projectId = p_project_id,
        authorityId = p_authority_id
    WHERE projectUserAuthoritiesId = p_project_user_authorities_id;
END;
$$;