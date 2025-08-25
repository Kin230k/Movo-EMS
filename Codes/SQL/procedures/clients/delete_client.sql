CREATE OR REPLACE PROCEDURE delete_client(p_auth_user_id UUID, p_client_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_client');

DELETE FROM CLIENTS
 WHERE clientId = p_client_id;
END;
$$;