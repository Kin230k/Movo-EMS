CREATE OR REPLACE FUNCTION create_location(
 p_auth_user_id UUID,
 p_name JSONB,
 p_project_id UUID,
 p_site_map VARCHAR(512),
 p_longitude NUMERIC,
 p_latitude NUMERIC
)
RETURNS TABLE (
 locationid UUID,
 name JSONB,
 projectid UUID,
 sitemap VARCHAR(512),
 longitude NUMERIC,
 latitude NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_location');

IF p_longitude < -180 OR p_longitude > 180 THEN
 RAISE EXCEPTION 'Longitude must be between -180 and 180 (provided: %)', p_longitude;
 END IF;
 IF p_latitude < -90 OR p_latitude > 90 THEN
 RAISE EXCEPTION 'Latitude must be between -90 and 90 (provided: %)', p_latitude;
 END IF;

 RETURN QUERY
 INSERT INTO locations (locationid, name, projectid, sitemap, longitude, latitude)
 VALUES (gen_random_uuid(), p_name, p_project_id, p_site_map, p_longitude, p_latitude)
 RETURNING locations.locationid, locations.name, locations.projectid, locations.sitemap, locations.longitude, locations.latitude;
END;
$$;
