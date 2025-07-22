CREATE OR REPLACE FUNCTION get_client_by_id(p_client_id UUID)
RETURNS TABLE (
    clientId UUID,
    name VARCHAR(255),
    logo VARCHAR(512),
    company VARCHAR(255),
    contactEmail VARCHAR(255),
    contactPhone VARCHAR(20))
LANGUAGE plpgsql AS $$
BEGIN
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