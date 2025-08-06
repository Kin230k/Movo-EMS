CREATE OR REPLACE PROCEDURE create_area(p_auth_user_id UUID, 
    p_name JSONB,
    p_location_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_area');

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