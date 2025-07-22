CREATE OR REPLACE FUNCTION get_authority_by_id(p_authority_id UUID)
RETURNS TABLE (authorityId UUID, name VARCHAR(100))
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.authorityId,
        a.name
    FROM AUTHORITIES a
    WHERE a.authorityId = p_authority_id;
END;
$$;