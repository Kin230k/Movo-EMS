CREATE OR REPLACE FUNCTION get_location_by_id(p_location_id UUID)
RETURNS TABLE (
    locationId UUID,
    name JSONB,
    projectId UUID,
    siteMap VARCHAR(512),
    longitude NUMERIC,
    latitude NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
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