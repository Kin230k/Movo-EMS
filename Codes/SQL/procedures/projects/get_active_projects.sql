CREATE OR REPLACE FUNCTION get_active_projects()
RETURNS TABLE (
    projectId UUID,
    name JSONB,
    badgeBackground VARCHAR(512),
    startingDate DATE,
    endingDate DATE,
    description JSONB,
    clientName JSONB  -- Add client name
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
RETURN QUERY 
    SELECT 
        p.projectId,
        p.name,
        p.badgeBackground,
        p.startingDate,
        p.endingDate,
        p.description,
        c.name  -- Join with CLIENTS table
    FROM PROJECTS p
    LEFT JOIN CLIENTS c ON p.clientId = c.clientId
    WHERE CURRENT_DATE < p.endingDate;
END;
$$;
