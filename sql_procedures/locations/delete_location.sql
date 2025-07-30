CREATE OR REPLACE PROCEDURE delete_location(p_location_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM LOCATIONS
    WHERE locationId = p_location_id;
END;
$$;