CREATE OR REPLACE PROCEDURE delete_area(p_area_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM AREA
    WHERE areaId = p_area_id;
END;
$$;