CREATE OR REPLACE PROCEDURE create_user_project(p_auth_user_id UUID, 
    p_user_id UUID,
    p_project_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_user_project');

INSERT INTO USER_PROJECT (
        userProjectId,
        userId, 
        projectId
    ) VALUES (
        gen_random_uuid(),
        p_user_id,
        p_project_id
    ) ;
END;
$$;