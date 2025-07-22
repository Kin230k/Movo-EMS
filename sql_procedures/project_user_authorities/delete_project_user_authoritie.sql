CREATE OR REPLACE PROCEDURE delete_project_user_authority(p_project_user_authorities_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM PROJECT_USER_AUTHORITIES
    WHERE projectUserAuthoritiesId = p_project_user_authorities_id;
END;
$$;