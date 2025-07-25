CREATE OR REPLACE PROCEDURE update_location(
    p_location_id UUID,
    p_name JSONB,
    p_project_id UUID,
    p_site_map VARCHAR(512),
    p_longitude NUMERIC,
    p_latitude NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE LOCATIONS
    SET 
        name = p_name,
        projectId = p_project_id,
        siteMap = p_site_map,
        longitude = p_longitude,
        latitude = p_latitude
    WHERE locationId = p_location_id;
END;
$$;