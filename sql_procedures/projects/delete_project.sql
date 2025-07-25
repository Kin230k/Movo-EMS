CREATE OR REPLACE PROCEDURE delete_project(p_project_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM PROJECTS
    WHERE projectId = p_project_id;
END;
$$;