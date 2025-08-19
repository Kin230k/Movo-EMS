CREATE OR REPLACE FUNCTION get_all_clients(p_auth_user_id UUID)
RETURNS TABLE (
 clientId UUID,
 name JSONB,
 logo VARCHAR(512),
 company JSONB,
 contactEmail VARCHAR(255),
 contactPhone VARCHAR(20))
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_all_clients');

RETURN QUERY
 SELECT
 c.clientId,
 c.name,
 c.logo,
 c.company,
 c.contactEmail,
 c.contactPhone
 FROM CLIENTS c;
END;
$$;