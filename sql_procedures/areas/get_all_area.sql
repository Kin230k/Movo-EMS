CREATE OR REPLACE FUNCTION get_all_areas()
RETURNS TABLE (
    areaId UUID,
    name VARCHAR(255),
    locationId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.areaId,
        a.name,
        a.locationId
    FROM AREA a;
END;
$$;