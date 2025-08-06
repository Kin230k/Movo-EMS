CREATE OR REPLACE PROCEDURE delete_location(p_auth_user_id UUID, p_location_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_location');

DELETE FROM LOCATIONS
    WHERE locationId = p_location_id;
END;
$$;