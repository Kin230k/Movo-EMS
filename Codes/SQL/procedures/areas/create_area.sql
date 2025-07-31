CREATE OR REPLACE PROCEDURE create_area(
    p_name JSONB,
    p_location_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO AREAS (
        areaId,
        name, 
        locationId
    ) VALUES (
        gen_random_uuid(),
        p_name,
        p_location_id
    ) ;
END;
$$;