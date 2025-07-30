CREATE OR REPLACE PROCEDURE create_interview(p_project_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO INTERVIEWS (interviewId,projectId) 
    VALUES (gen_random_uuid(),p_project_id) 
    ;
END;
$$;