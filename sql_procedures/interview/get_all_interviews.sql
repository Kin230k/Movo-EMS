CREATE OR REPLACE FUNCTION get_all_interviews()
RETURNS TABLE (interviewId UUID, projectId UUID)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        i.interviewId,
        i.projectId
    FROM INTERVIEWS i;
END;
$$;