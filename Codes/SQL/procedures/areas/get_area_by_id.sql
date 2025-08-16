CREATE OR REPLACE FUNCTION get_area_by_id(p_auth_user_id UUID,p_area_id UUID)
RETURNS TABLE (
    areaId UUID,
    name JSONB,
    locationId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_area_by_id');

RETURN QUERY 
    SELECT 
        a.areaId,
        a.name,
        a.locationId
    FROM AREAS a
    WHERE a.areaId = p_area_id;
END;
$$;