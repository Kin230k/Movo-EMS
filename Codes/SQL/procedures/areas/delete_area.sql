CREATE OR REPLACE PROCEDURE delete_area(p_auth_user_id UUID, p_area_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_area');

DELETE FROM AREAS
 WHERE areaId = p_area_id;
END;
$$;