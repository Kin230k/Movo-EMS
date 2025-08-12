
CREATE OR REPLACE FUNCTION get_all_clients()
RETURNS TABLE (
    clientId UUID,
    name JSONB,
    logo VARCHAR(512),
    company JSONB,
    contactEmail VARCHAR(255),
    contactPhone VARCHAR(20),
    status client_status, 
    userId UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        c.clientId,
        c.name,
        c.logo,
        c.company,
        c.contactEmail,
        c.contactPhone,
        c.status,
        c.userId
    FROM CLIENTS c;
END;
$$;
