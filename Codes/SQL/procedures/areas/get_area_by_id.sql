CREATE OR REPLACE FUNCTION get_area_by_id(p_area_id UUID)
RETURNS TABLE (
    areaId UUID,
    name JSONB,
    locationId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    

RETURN QUERY 
    SELECT 
        a.areaId,
        a.name,
        a.locationId
    FROM AREAS a
    WHERE a.areaId = p_area_id;
END;
$$;