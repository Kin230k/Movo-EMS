CREATE OR REPLACE FUNCTION get_all_projects(p_auth_user_id UUID)
RETURNS TABLE (
    projectId UUID,
    clientId UUID,
    name JSONB,
    badgeBackground VARCHAR(512),
    startingDate DATE,
    endingDate DATE,
    description JSONB,
    clientName JSONB  -- Add client name
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_projects');

RETURN QUERY 
    SELECT 
        p.projectId,
        p.clientId,
        p.name,
        p.badgeBackground,
        p.startingDate,
        p.endingDate,
        p.description,
        c.name  -- Join with CLIENTS table
    FROM PROJECTS p
    LEFT JOIN CLIENTS c ON p.clientId = c.clientId;
END;
$$;
