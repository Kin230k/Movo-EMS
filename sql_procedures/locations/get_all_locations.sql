CREATE OR REPLACE FUNCTION get_all_locations()
RETURNS TABLE (
    locationId UUID,
    name VARCHAR(255),
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
    FROM LOCATIONS l;
END;
$$;