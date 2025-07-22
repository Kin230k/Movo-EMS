CREATE OR REPLACE FUNCTION get_all_projects()
RETURNS TABLE (
    projectId UUID,
    name VARCHAR(255),
    badgeBackground VARCHAR(512),
    startingDate DATE,
    endingDate DATE,
    description VARCHAR(2000)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        p.projectId,
        p.name,
        p.badgeBackground,
        p.startingDate,
        p.endingDate,
        p.description
    FROM PROJECTS p;
END;
$$;