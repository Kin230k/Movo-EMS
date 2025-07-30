CREATE OR REPLACE PROCEDURE delete_client(p_client_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM CLIENTS
    WHERE clientId = p_client_id;
END;
$$;