CREATE OR REPLACE PROCEDURE create_location(
    p_name JSONB,
    p_project_id UUID,
    p_site_map VARCHAR(512),
    p_longitude NUMERIC,
    p_latitude NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO LOCATIONS (
        locationId,
        name, 
        projectId, 
        siteMap, 
        longitude, 
        latitude
    ) VALUES (
        gen_random_uuid(),
        p_name,
        p_project_id,
        p_site_map,
        p_longitude,
        p_latitude
    ) RETURNING *;
END;
$$;