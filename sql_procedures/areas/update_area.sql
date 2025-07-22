CREATE OR REPLACE PROCEDURE update_area(
    p_area_id UUID,
    p_name VARCHAR(255),
    p_location_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE AREAS
    SET 
        name = p_name,
        locationId = p_location_id
    WHERE areaId = p_area_id;
END;
$$;