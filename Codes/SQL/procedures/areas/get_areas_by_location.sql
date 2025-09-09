CREATE OR REPLACE FUNCTION get_areas_by_location(
    p_auth_user_id UUID,
    p_location_id UUID
)
RETURNS TABLE (
    areaId UUID,
    name JSONB,
    locationId UUID
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
    -- Check if the user has permission to get areas by location
    CALL check_user_permission(p_auth_user_id, 'get_areas_by_location');

    -- Return all areas for the given location
    RETURN QUERY
    SELECT 
        a.areaId,
        a.name,
        a.locationId
    FROM AREAS a
    WHERE a.locationId = p_location_id;
END;
$$;
