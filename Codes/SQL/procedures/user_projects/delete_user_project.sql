CREATE OR REPLACE PROCEDURE delete_user_project(p_user_project_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM USER_PROJECT
    WHERE userProjectId = p_user_project_id;
END;
$$;