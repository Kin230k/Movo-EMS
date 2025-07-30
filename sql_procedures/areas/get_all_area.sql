CREATE OR REPLACE FUNCTION get_all_areas()
RETURNS TABLE (
    areaId UUID,
    name JSONB,
    locationId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.areaId,
        a.name,
        a.locationId
    FROM AREAS a;
END;
$$;