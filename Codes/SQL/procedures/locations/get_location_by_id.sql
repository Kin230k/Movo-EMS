CREATE OR REPLACE FUNCTION get_location_by_id(p_auth_user_id UUID,p_location_id UUID)
RETURNS TABLE (
    locationId UUID,
    name JSONB,
    projectId UUID,
    siteMap VARCHAR(512),
    longitude NUMERIC,
    latitude NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_location_by_id');

RETURN QUERY 
    SELECT 
        l.locationId,
        l.name,
        l.projectId,
        l.siteMap,
        l.longitude,
        l.latitude
    FROM LOCATIONS l
    WHERE l.locationId = p_location_id;
END;
$$;