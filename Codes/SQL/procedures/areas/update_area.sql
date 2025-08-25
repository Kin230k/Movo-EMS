CREATE OR REPLACE PROCEDURE update_area(p_auth_user_id UUID,
 p_area_id UUID,
 p_name JSONB DEFAULT NULL,
 p_location_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_area');

UPDATE AREAS
 SET
 name = COALESCE(p_name, name),
 locationId = COALESCE(p_location_id, locationId)
 WHERE areaId = p_area_id;
END;
$$;