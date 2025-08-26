CREATE OR REPLACE FUNCTION get_project_by_client(
    p_auth_user_id UUID,
    p_client_id UUID
)
RETURNS TABLE (
    projectId UUID,
    name JSONB,
    badgeBackground VARCHAR(512),
    startingDate DATE,
    endingDate DATE,
    description JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the caller has permission
    CALL check_user_permission(p_auth_user_id, 'get_project_by_client');

    -- Return projects for the given client
    RETURN QUERY 
    SELECT 
        p.projectId,
        p.name,
        p.badgeBackground,
        p.startingDate,
        p.endingDate,
        p.description
    FROM PROJECTS p
    WHERE p.clientId = p_client_id;
END;
$$;