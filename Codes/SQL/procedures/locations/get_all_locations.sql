CREATE OR REPLACE FUNCTION get_all_locations()
RETURNS TABLE (
    locationId UUID,
    name JSONB,
    projectId UUID,
    siteMap VARCHAR(512),
    longitude NUMERIC,
    latitude NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_locations');

RETURN QUERY 
    SELECT 
        l.locationId,
        l.name,
        l.projectId,
        l.siteMap,
        l.longitude,
        l.latitude
    FROM LOCATIONS l;
END;
$$;