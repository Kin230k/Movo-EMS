CREATE OR REPLACE FUNCTION get_locations_by_client(
    p_auth_user_id UUID,
    p_client_id UUID
)
RETURNS TABLE (
    locationId UUID,
    name JSONB,
    projectId UUID,
    siteMap VARCHAR(512),
    longitude NUMERIC,
    latitude NUMERIC
) 
LANGUAGE plpgsql SECURITY DEFINER 
AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_locations_by_client');

    RETURN QUERY 
        SELECT 
            l.locationId,
            l.name,
            l.projectId,
            l.siteMap,
            l.longitude,
            l.latitude
        FROM LOCATIONS l
        INNER JOIN PROJECTS p ON p.projectId = l.projectId
        WHERE p.clientId = p_client_id;
END;
$$;


