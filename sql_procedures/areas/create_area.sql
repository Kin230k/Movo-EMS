CREATE OR REPLACE PROCEDURE create_area(
    p_name VARCHAR(255),
    p_location_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO AREAS (
        name, 
        locationId
    ) VALUES (
        p_name,
        p_location_id
    ) RETURNING *;
END;
$$;