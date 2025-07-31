CREATE OR REPLACE PROCEDURE update_user_project(
    p_user_project_id UUID,
    p_user_id UUID,
    p_project_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE USER_PROJECT
    SET 
        userId = p_user_id,
        projectId = p_project_id
    WHERE userProjectId = p_user_project_id;
END;
$$;