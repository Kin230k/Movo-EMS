CREATE OR REPLACE PROCEDURE update_location(p_auth_user_id UUID, 
    p_location_id UUID,
    p_name JSONB DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_site_map VARCHAR(512) DEFAULT NULL,
    p_longitude NUMERIC DEFAULT NULL,
    p_latitude NUMERIC DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_location');

-- Validate geographic coordinates only when provided
    IF p_longitude IS NOT NULL AND (p_longitude < -180 OR p_longitude > 180) THEN
        RAISE EXCEPTION 'Longitude must be between -180 and 180 (provided: %)', p_longitude;
    END IF;
    
    IF p_latitude IS NOT NULL AND (p_latitude < -90 OR p_latitude > 90) THEN
        RAISE EXCEPTION 'Latitude must be between -90 and 90 (provided: %)', p_latitude;
    END IF;

    UPDATE LOCATIONS
    SET 
        name = COALESCE(p_name, name),
        projectId = COALESCE(p_project_id, projectId),
        siteMap = COALESCE(p_site_map, siteMap),
        longitude = COALESCE(p_longitude, longitude),
        latitude = COALESCE(p_latitude, latitude)
    WHERE locationId = p_location_id;
END;
$$;