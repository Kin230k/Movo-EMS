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
    -- Validate geographic coordinates
    IF p_longitude < -180 OR p_longitude > 180 THEN
        RAISE EXCEPTION 'Longitude must be between -180 and 180 (provided: %)', p_longitude;
    END IF;
    
    IF p_latitude < -90 OR p_latitude > 90 THEN
        RAISE EXCEPTION 'Latitude must be between -90 and 90 (provided: %)', p_latitude;
    END IF;

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