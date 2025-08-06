CREATE OR REPLACE FUNCTION get_client_by_id(p_client_id UUID)
RETURNS TABLE (
    clientId UUID,
    name JSONB,
    logo VARCHAR(512),
    company JSONB,
    contactEmail VARCHAR(255),
    contactPhone VARCHAR(20))
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_client_by_id');

RETURN QUERY 
    SELECT 
        c.clientId,
        c.name,
        c.logo,
        c.company,
        c.contactEmail,
        c.contactPhone
    FROM CLIENTS c
    WHERE c.clientId = p_client_id;
END;
$$;