CREATE OR REPLACE PROCEDURE create_interview(p_project_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO INTERVIEWS (projectId) 
    VALUES (p_project_id) 
    RETURNING *;
END;
$$;