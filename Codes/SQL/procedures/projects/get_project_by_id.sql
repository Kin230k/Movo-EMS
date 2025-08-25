CREATE OR REPLACE FUNCTION get_project_by_id(p_project_id UUID)
RETURNS TABLE (
    projectId UUID,
    name JSONB,
    badgeBackground VARCHAR(512),
    startingDate DATE,
    endingDate DATE,
    description JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN

RETURN QUERY 
    SELECT 
        p.projectId,
        p.name,
        p.badgeBackground,
        p.startingDate,
        p.endingDate,
        p.description
    FROM PROJECTS p
    WHERE p.projectId = p_project_id;
END;
$$;