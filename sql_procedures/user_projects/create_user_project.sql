CREATE OR REPLACE PROCEDURE create_user_project(
    p_user_id UUID,
    p_project_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO USER_PROJECT (
        userId, 
        projectId
    ) VALUES (
        p_user_id,
        p_project_id
    ) RETURNING *;
END;
$$;