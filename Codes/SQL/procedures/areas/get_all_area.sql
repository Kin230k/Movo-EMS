CREATE OR REPLACE FUNCTION get_all_areas(p_auth_user_id UUID)
RETURNS TABLE (
    areaId UUID,
    name JSONB,
    locationId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_area');

RETURN QUERY 
    SELECT 
        a.areaId,
        a.name,
        a.locationId
    FROM AREAS a;
END;
$$;