CREATE OR REPLACE PROCEDURE create_interview(p_project_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO INTERVIEW (projectId) 
    VALUES (p_project_id) 
    RETURNING *;
END;
$$;