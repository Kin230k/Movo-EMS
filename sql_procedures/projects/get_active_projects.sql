CREATE OR REPLACE FUNCTION get_active_projects()
RETURNS TABLE (
    projectId UUID,
    name VARCHAR(255),
    startingDate DATE,
    endingDate DATE
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        p.projectId,
        p.name,
        p.startingDate,
        p.endingDate
    FROM PROJECTS p
    WHERE CURRENT_DATE BETWEEN p.startingDate AND p.endingDate;
END;
$$;