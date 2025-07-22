CREATE OR REPLACE PROCEDURE create_project_user_authority(
    p_user_id UUID,
    p_project_id UUID,
    p_authority_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO PROJECT_USER_AUTHORITIES (
        userId, 
        projectId, 
        authorityId
    ) VALUES (
        p_user_id,
        p_project_id,
        p_authority_id
    ) RETURNING *;
END;
$$;